'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Proveedor, 
  EventoParticipante,
  getAllProviders, 
  getEventParticipants,
  createEventParticipant,
  createItem,
  readEventProviders
} from '@/lib/directus';
import IntegratedProviderAssignment from '@/components/IntegratedProviderAssignment';

interface ProviderWithStatus extends Proveedor {
  isAssigned?: boolean;
  assignmentStatus?: 'pending' | 'approved' | 'rejected';
  participantes?: EventoParticipante[];
}

export default function EventProvidersPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allProviders, setAllProviders] = useState<ProviderWithStatus[]>([]);
  const [eventParticipants, setEventParticipants] = useState<EventoParticipante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [isCreatingProvider, setIsCreatingProvider] = useState(false);
  const [newProvider, setNewProvider] = useState({
    nombre: '',
    descripcion: '',
    email: '',
    telefono: '',
    contacto: '',
    rubro: ''
  });

  useEffect(() => {
    loadProviders();
  }, [params.id]);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      // Cargar todos los proveedores y participantes del evento en paralelo
      const [providersData, participantsData] = await Promise.all([
        getAllProviders().catch(() => []), // Manejar error silenciosamente
        getEventParticipants(params.id).catch(() => [])
      ]);

      setAllProviders(providersData);
      setEventParticipants(participantsData);

      // Marcar proveedores ya asignados
      const providersWithStatus = providersData.map((provider: Proveedor) => {
        const participant = participantsData.find((p: EventoParticipante) => p.proveedor_id === provider.id);
        return {
          ...provider,
          isAssigned: !!participant,
          assignmentStatus: participant?.status,
          participantes: participant ? [participant] : []
        };
      });

      setAllProviders(providersWithStatus);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignProvider = async (providerId: string) => {
    setIsAssigning(providerId);
    try {
      await createEventParticipant({
        evento_id: params.id,
        proveedor_id: providerId,
        status: 'pending'
      });
      
      await loadProviders(); // Recargar datos
      alert('Proveedor asignado exitosamente');
    } catch (error) {
      console.error('Error assigning provider:', error);
      alert('Error al asignar proveedor');
    } finally {
      setIsAssigning(null);
    }
  };

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProvider.nombre.trim()) {
      alert('El nombre del proveedor es obligatorio');
      return;
    }

    try {
      setIsLoading(true);
      
      // Crear nuevo proveedor en el catálogo
      const createdProvider = await createItem('proveedores', {
        nombre: newProvider.nombre,
        descripcion: newProvider.descripcion,
        email: newProvider.email,
        telefono: newProvider.telefono,
        contacto: newProvider.contacto,
        rubro: newProvider.rubro,
        status: 'active'
      });

      // Asignar el nuevo proveedor al evento
      await createEventParticipant({
        evento_id: params.id,
        proveedor_id: createdProvider.id,
        status: 'pending'
      });

      // Limpiar formulario
      setNewProvider({
        nombre: '',
        descripcion: '',
        email: '',
        telefono: '',
        contacto: '',
        rubro: ''
      });
      setIsCreatingProvider(false);
      
      // Recargar datos
      await loadProviders();
      
      alert('Proveedor creado y asignado exitosamente');
    } catch (error) {
      console.error('Error creating provider:', error);
      alert('Error al crear proveedor');
    } finally {
      setIsLoading(false);
    }
  };

  const getAssignmentButtonText = (provider: ProviderWithStatus) => {
    if (provider.isAssigned) {
      switch (provider.assignmentStatus) {
        case 'approved': return '✓ Asignado';
        case 'pending': return '⏳ Pendiente';
        case 'rejected': return '✗ Rechazado';
        default: return 'Asignado';
      }
    }
    return 'Asignar';
  };

  const isAssignmentDisabled = (provider: ProviderWithStatus) => {
    return provider.isAssigned || isAssigning === provider.id.toString();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/events/${params.id}/dashboard`} className="text-xl font-bold text-black">
                ← Volver al Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-black">Gestión de Proveedores</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-lg font-medium text-black">
              Evento ID: {params.id}
            </h2>
            <p className="text-gray-600">
              {eventParticipants.length} proveedor(es) asignado(s)
            </p>
          </div>
          <button
            onClick={() => setIsCreatingProvider(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            + Crear Nuevo Proveedor
          </button>
        </div>

        {/* Create Provider Form */}
        {isCreatingProvider && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-black">Crear Nuevo Proveedor</h3>
              <button
                onClick={() => setIsCreatingProvider(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProvider} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Proveedor *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProvider.nombre}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Empresa ABC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rubro
                  </label>
                  <input
                    type="text"
                    value={newProvider.rubro}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, rubro: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Catering"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newProvider.email}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contacto@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={newProvider.telefono}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    value={newProvider.contacto}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, contacto: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newProvider.descripcion}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                  placeholder="Descripción del proveedor y servicios"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreatingProvider(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Creando...' : 'Crear y Asignar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Integrated Provider Assignment Workflow */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-black mb-2">Asignar Proveedor al Evento</h3>
            <p className="text-gray-600">
              Selecciona un proveedor del catálogo o crea uno nuevo. Después podrás asignarle los requisitos específicos.
            </p>
          </div>
          
          <IntegratedProviderAssignment 
            eventId={params.id} 
            onComplete={() => loadProviders()}
          />
        </div>

        {/* Assigned Providers List */}
        {eventParticipants.length > 0 && (
          <div className="bg-white rounded-lg shadow mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-black">Proveedores Asignados</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {allProviders.filter(p => p.isAssigned).map((provider) => (
                <div key={provider.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-black">{provider.nombre}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          provider.assignmentStatus === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : provider.assignmentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getAssignmentButtonText(provider)}
                        </span>
                      </div>
                      
                      {provider.descripcion && (
                        <p className="text-gray-600 mt-1">{provider.descripcion}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/events/${params.id}/providers/${provider.participantes?.[0]?.id}`}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
                      >
                        Ver Detalle
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}