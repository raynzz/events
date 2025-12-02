'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Proveedor, 
  EventoParticipante,
  EventoRequisito,
  getAllProviders, 
  getEventParticipants,
  createEventParticipant,
  createItem,
  getEventRequirements,
  assignRequirementsToParticipant
} from '@/lib/directus';
import RequirementAssignmentModal from '@/components/RequirementAssignmentModal';

interface ProviderWithStatus extends Proveedor {
  isAssigned?: boolean;
  assignmentStatus?: 'pending' | 'approved' | 'rejected';
  participantes?: EventoParticipante[];
}

interface IntegratedProviderAssignmentProps {
  eventId: string | number;
  onComplete?: () => void;
}

export default function IntegratedProviderAssignment({ eventId, onComplete }: IntegratedProviderAssignmentProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allProviders, setAllProviders] = useState<ProviderWithStatus[]>([]);
  const [eventParticipants, setEventParticipants] = useState<EventoParticipante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [isCreatingProvider, setIsCreatingProvider] = useState(false);
  const [currentStep, setCurrentStep] = useState<'select' | 'assign' | 'requirements'>('select');
  const [assignedParticipant, setAssignedParticipant] = useState<EventoParticipante | null>(null);
  const [newProvider, setNewProvider] = useState({
    nombre: '',
    descripcion: '',
    email: '',
    telefono: '',
    contacto: '',
    rubro: ''
  });
  const [showRequirementModal, setShowRequirementModal] = useState(false);

  useEffect(() => {
    loadProviders();
  }, [eventId]);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const [providersData, participantsData] = await Promise.all([
        getAllProviders().catch(() => []),
        getEventParticipants(eventId).catch(() => [])
      ]);

      setAllProviders(providersData);
      setEventParticipants(participantsData);

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
    setCurrentStep('assign');
    
    try {
      const participant = await createEventParticipant({
        evento_id: eventId,
        proveedor_id: providerId,
        status: 'pending'
      });
      
      setAssignedParticipant(participant);
      await loadProviders();
      setCurrentStep('requirements');
      setShowRequirementModal(true);
    } catch (error) {
      console.error('Error assigning provider:', error);
      alert('Error al asignar proveedor');
      setCurrentStep('select');
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
      setCurrentStep('assign');
      
      // Create new provider
      const createdProvider = await createItem('proveedores', {
        nombre: newProvider.nombre,
        descripcion: newProvider.descripcion,
        email: newProvider.email,
        telefono: newProvider.telefono,
        contacto: newProvider.contacto,
        rubro: newProvider.rubro,
        status: 'active'
      });

      // Assign to event
      const participant = await createEventParticipant({
        evento_id: eventId,
        proveedor_id: createdProvider.id,
        status: 'pending'
      });

      setNewProvider({
        nombre: '',
        descripcion: '',
        email: '',
        telefono: '',
        contacto: '',
        rubro: ''
      });
      setIsCreatingProvider(false);
      setAssignedParticipant(participant);
      setCurrentStep('requirements');
      setShowRequirementModal(true);
      
      await loadProviders();
      
    } catch (error) {
      console.error('Error creating provider:', error);
      alert('Error al crear proveedor');
      setCurrentStep('select');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequirementsAssigned = () => {
    setShowRequirementModal(false);
    setAssignedParticipant(null);
    setCurrentStep('select');
    onComplete?.();
  };

  const handleSkipRequirements = () => {
    setShowRequirementModal(false);
    setAssignedParticipant(null);
    setCurrentStep('select');
    onComplete?.();
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

  const getStepIndicator = () => {
    const steps = [
      { key: 'select', label: 'Seleccionar', icon: '🔍' },
      { key: 'assign', label: 'Asignar', icon: '➕' },
      { key: 'requirements', label: 'Requisitos', icon: '📋' }
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStep);

    return (
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              index <= currentIndex 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-gray-100 border-gray-300 text-gray-400'
            }`}>
              <span className="text-sm">{step.icon}</span>
            </div>
            <span className={`ml-2 text-sm ${
              index <= currentIndex ? 'text-blue-600 font-medium' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-4 ${
                index < currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      {getStepIndicator()}

      {/* Requirement Assignment Modal */}
      {showRequirementModal && assignedParticipant && (
        <RequirementAssignmentModal
          isOpen={showRequirementModal}
          onClose={() => setShowRequirementModal(false)}
          eventId={eventId}
          participantId={assignedParticipant.id}
          onRequirementsAssigned={handleRequirementsAssigned}
        />
      )}

      {/* Skip Requirements Option */}
      {currentStep === 'requirements' && showRequirementModal && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800 mb-4">
            ¿Deseas asignar requisitos ahora o prefieres hacerlo más tarde?
          </p>
          <div className="space-x-4">
            <button
              onClick={() => setShowRequirementModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Asignar Requisitos Ahora
            </button>
            <button
              onClick={handleSkipRequirements}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Asignar Más Tarde
            </button>
          </div>
        </div>
      )}

      {/* Provider Selection/Assignment */}
      {currentStep === 'select' && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-black">Seleccionar Proveedor</h3>
              <button
                onClick={() => setIsCreatingProvider(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                + Crear Nuevo Proveedor
              </button>
            </div>

            {/* Create Provider Form */}
            {isCreatingProvider && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h4 className="text-md font-medium text-black mb-4">Crear Nuevo Proveedor</h4>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
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
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Creando...' : 'Crear y Asignar'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Providers List */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando proveedores...</p>
                </div>
              ) : allProviders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🏢</div>
                  <p>No hay proveedores en el catálogo</p>
                  <p className="text-sm">Crea el primer proveedor para comenzar</p>
                </div>
              ) : (
                allProviders.map((provider) => (
                  <div key={provider.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-black">{provider.nombre}</h4>
                        {provider.isAssigned && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            provider.assignmentStatus === 'approved' 
                              ? 'bg-green-100 text-green-800'
                              : provider.assignmentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {getAssignmentButtonText(provider)}
                          </span>
                        )}
                      </div>
                      
                      {provider.descripcion && (
                        <p className="text-gray-600 mt-1">{provider.descripcion}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        {provider.rubro && <span>🏢 {provider.rubro}</span>}
                        {provider.email && <span>📧 {provider.email}</span>}
                        {provider.telefono && <span>📞 {provider.telefono}</span>}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {!provider.isAssigned ? (
                        <button
                          onClick={() => handleAssignProvider(provider.id.toString())}
                          disabled={isAssignmentDisabled(provider)}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAssigning === provider.id.toString() ? 'Asignando...' : 'Seleccionar'}
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Ya asignado</span>
                          <Link
                            href={`/events/${eventId}/providers/${provider.participantes?.[0]?.id}`}
                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
                          >
                            Ver Detalle
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Assignment Progress */}
      {currentStep === 'assign' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h3 className="text-lg font-medium text-black mt-4">Asignando proveedor al evento...</h3>
            <p className="text-gray-600 mt-2">Por favor espera mientras se procesa la asignación</p>
          </div>
        </div>
      )}
    </div>
  );
}