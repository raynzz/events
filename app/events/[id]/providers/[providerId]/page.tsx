'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Integrante } from '@/lib/directus';

interface Provider {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  contact_name?: string;
  status: string;
  date_created: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  date_created: string;
}

export default function ProviderDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; providerId: string }> 
}) {
  const { user, loading } = useAuth();
  const { id: eventId, providerId } = use(params);
  
  const [event, setEvent] = useState<Event | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [isLoadingIntegrantes, setIsLoadingIntegrantes] = useState(false);
  
  // Estados para forms
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [showIntegranteForm, setShowIntegranteForm] = useState(false);
  const [editingIntegrante, setEditingIntegrante] = useState<Integrante | null>(null);
  
  const [providerForm, setProviderForm] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    description: '',
  });
  
  const [integranteForm, setIntegranteForm] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    fecha_nacimiento: '',
  });

  // Cargar evento y proveedor
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar evento
        const { readUserEvents } = await import('@/lib/directus');
        const eventsData = await readUserEvents(user!.id);
        const foundEvent = eventsData.find((item: any) => 
          String(item.id) === String(eventId) || Number(item.id) === Number(eventId)
        );
        
        if (foundEvent) {
          const mappedEvent: Event = {
            id: foundEvent.id,
            title: foundEvent.title,
            description: foundEvent.description,
            start_date: foundEvent.start_date,
            end_date: foundEvent.end_date,
            location: foundEvent.location,
            status: foundEvent.status,
            date_created: foundEvent.date_created
          };
          setEvent(mappedEvent);
        }
        
        // Cargar proveedor
        const { readEventProviders } = await import('@/lib/directus');
        const providersData = await readEventProviders(eventId);
        const foundProvider = providersData.find((p: any) => 
          String(p.id) === String(providerId) || Number(p.id) === Number(providerId)
        );
        
        if (foundProvider) {
          setProvider(foundProvider);
          setProviderForm({
            name: foundProvider.name,
            contact_name: foundProvider.contact_name || '',
            email: foundProvider.email || '',
            phone: foundProvider.phone || '',
            description: foundProvider.description || '',
          });
        }
        
        // Cargar integrantes
        fetchIntegrantes();
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    if (user && eventId && providerId) {
      fetchData();
    }
  }, [user, eventId, providerId]);

  const fetchIntegrantes = async () => {
    if (!eventId) return;
    setIsLoadingIntegrantes(true);
    try {
      const { readIntegrantes } = await import('@/lib/directus');
      
      const data = await readIntegrantes({
        filter: {
          evento: {
            _eq: eventId
          },
          proveedor: {
            _eq: parseInt(providerId)
          }
        },
        sort: 'sort,nombre,apellido'
      });
      
      setIntegrantes(data || []);
    } catch (error) {
      console.error('❌ Error fetching integrantes:', error);
      setIntegrantes([]);
    } finally {
      setIsLoadingIntegrantes(false);
    }
  };

  const handleSubmitProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { updateProvider } = await import('@/lib/directus');
      await updateProvider(providerId, providerForm);
      alert('Proveedor actualizado exitosamente');
      setShowProviderForm(false);
    } catch (error) {
      console.error('Error updating provider:', error);
      alert('Error al guardar el proveedor');
    }
  };

  const handleEditIntegrante = (integrante: Integrante) => {
    setEditingIntegrante(integrante);
    setIntegranteForm({
      nombre: integrante.nombre,
      apellido: integrante.apellido,
      documento: integrante.documento,
      fecha_nacimiento: integrante.fecha_nacimiento.split('T')[0],
    });
    setShowIntegranteForm(true);
  };

  const handleDeleteIntegrante = async (integranteId: string) => {
    if (!confirm('¿Estás seguro de eliminar este integrante?')) return;
    try {
      const { deleteIntegrante } = await import('@/lib/directus');
      await deleteIntegrante(integranteId.toString());
      alert('Integrante eliminado exitosamente');
      fetchIntegrantes();
    } catch (error) {
      console.error('Error deleting integrante:', error);
      alert('Error al eliminar el integrante');
    }
  };

  const handleSubmitIntegrante = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { createIntegrante, updateIntegrante } = await import('@/lib/directus');
      
      if (editingIntegrante) {
        await updateIntegrante(editingIntegrante.id.toString(), {
          ...integranteForm,
          proveedor: parseInt(providerId),
          evento: parseInt(eventId),
          status: 'active'
        });
        alert('Integrante actualizado exitosamente');
      } else {
        await createIntegrante({
          ...integranteForm,
          proveedor: parseInt(providerId),
          evento: parseInt(eventId),
          status: 'active'
        });
        alert('Integrante creado exitosamente');
      }
      
      setIntegranteForm({
        nombre: '',
        apellido: '',
        documento: '',
        fecha_nacimiento: '',
      });
      setShowIntegranteForm(false);
      setEditingIntegrante(null);
      fetchIntegrantes();
    } catch (error) {
      console.error('Error saving integrante:', error);
      alert('Error al guardar el integrante');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Borrador';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
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

  if (!event || !provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href={`/events/${eventId}`} className="text-xl font-bold text-black">
                  ← Volver al Evento
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-black mb-2">Proveedor no encontrado</h2>
            <p className="text-gray-600 mb-6">El proveedor que buscas no existe o no tienes permiso para verlo.</p>
            <Link href={`/events/${eventId}`} className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
              Volver al evento
            </Link>
          </div>
        </main>
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
              <Link href={`/events/${eventId}`} className="text-xl font-bold text-black">
                ← Volver al Evento
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {getStatusText(event.status)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">Detalle del Proveedor</h1>
          <p className="text-gray-600">{event.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel izquierdo - Integrantes */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Integrantes</h2>
                <button
                  onClick={() => {
                    setEditingIntegrante(null);
                    setIntegranteForm({
                      nombre: '',
                      apellido: '',
                      documento: '',
                      fecha_nacimiento: '',
                    });
                    setShowIntegranteForm(!showIntegranteForm);
                  }}
                  className="px-3 py-1 text-sm text-white bg-black rounded-md hover:bg-gray-800"
                >
                  {showIntegranteForm ? 'Cancelar' : '+ Agregar'}
                </button>
              </div>

              {/* Integrante Form */}
              {showIntegranteForm && (
                <form onSubmit={handleSubmitIntegrante} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-black mb-4">
                    {editingIntegrante ? 'Editar Integrante' : 'Nuevo Integrante'}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        type="text"
                        value={integranteForm.nombre}
                        onChange={e => setIntegranteForm({ ...integranteForm, nombre: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                      <input
                        type="text"
                        value={integranteForm.apellido}
                        onChange={e => setIntegranteForm({ ...integranteForm, apellido: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DNI/CUIT/CUIL *</label>
                      <input
                        type="text"
                        value={integranteForm.documento}
                        onChange={e => setIntegranteForm({ ...integranteForm, documento: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
                      <input
                        type="date"
                        value={integranteForm.fecha_nacimiento}
                        onChange={e => setIntegranteForm({ ...integranteForm, fecha_nacimiento: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowIntegranteForm(false);
                        setEditingIntegrante(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                    >
                      {editingIntegrante ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </form>
              )}

              {/* Integrantes List */}
              {isLoadingIntegrantes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando integrantes...</p>
                </div>
              ) : integrantes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">👤</div>
                  <h3 className="text-lg font-medium text-black mb-2">No hay integrantes</h3>
                  <p className="text-gray-600">Agrega el primer integrante para este proveedor</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {integrantes.map(integrante => (
                    <div key={integrante.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-black">{integrante.nombre} {integrante.apellido}</h4>
                          <p className="text-sm text-gray-600 mt-1">{integrante.documento}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(integrante.fecha_nacimiento).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                        <div className="relative">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
                            </svg>
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden">
                            <div className="py-1">
                              <button
                                onClick={() => handleEditIntegrante(integrante)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteIntegrante(integrante.id.toString())}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho */}
          <div className="lg:col-span-2 space-y-8">
            {/* Card del Proveedor */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-black mb-2">{provider.name}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                    {getStatusText(provider.status)}
                  </span>
                </div>
                <div className="relative">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden">
                    <div className="py-1">
                      <button
                        onClick={() => setShowProviderForm(true)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Editar Proveedor
                      </button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        Eliminar Proveedor
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {provider.description && (
                <p className="text-gray-600 mb-6">{provider.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Información de Contacto</h3>
                  <div className="space-y-2">
                    {provider.contact_name && (
                      <div>
                        <span className="text-sm text-gray-600">Contacto:</span>
                        <p className="text-black font-medium">{provider.contact_name}</p>
                      </div>
                    )}
                    {provider.email && (
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <p className="text-black font-medium">{provider.email}</p>
                      </div>
                    )}
                    {provider.phone && (
                      <div>
                        <span className="text-sm text-gray-600">Teléfono:</span>
                        <p className="text-black font-medium">{provider.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Información del Evento</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Evento:</span>
                      <p className="text-black font-medium">{event.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Ubicación:</span>
                      <p className="text-black font-medium">{event.location}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Fecha:</span>
                      <p className="text-black font-medium">
                        {new Date(event.start_date).toLocaleDateString('es-AR')} - {new Date(event.end_date).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Módulo de Documentos Adjuntos (Demo) */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Documentos Adjuntos</h2>
                <button className="px-4 py-2 text-sm text-white bg-black rounded-md hover:bg-gray-800">
                  + Subir Documento
                </button>
              </div>
              
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-black mb-2">No hay documentos adjuntos</h3>
                <p className="text-gray-600 mb-4">Arrastra y suelta archivos aquí o haz clic en "Subir Documento"</p>
                <p className="text-xs text-gray-500">Módulo de demostración - Próximamente disponible</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}