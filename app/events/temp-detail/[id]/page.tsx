'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { use } from 'react';
import EventStatusSelector from '@/components/EventStatusSelector';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: string;
}

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

export default function TempEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading } = useAuth();
  const { id } = use(params);
  
  const [event, setEvent] = useState<Event | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    description: '',
  });

  // Buscar el evento en la lista de eventos del usuario
  useEffect(() => {
    if (!user?.id || !id) return;
    
    const fetchEventFromList = async () => {
      try {
        const { readUserEvents } = await import('@/lib/directus');
        const data = await readUserEvents(user.id);
        
        // Buscar el evento específico por ID
        const foundEvent = data.find((item: any) => item.id === id);
        
        if (foundEvent) {
          const mappedEvent: Event = {
            id: foundEvent.id,
            title: foundEvent.title,
            description: foundEvent.description,
            startDate: foundEvent.start_date,
            endDate: foundEvent.end_date,
            location: foundEvent.location,
            status: foundEvent.status,
            createdAt: foundEvent.date_created
          };
          setEvent(mappedEvent);
          console.log('Event found from list:', mappedEvent);
        } else {
          console.log('Event not found in user list');
        }
      } catch (error) {
        console.error('Error fetching event from list:', error);
      }
    };
    
    fetchEventFromList();
  }, [user, id]);

  // Cargar proveedores para el evento
  const fetchProviders = async () => {
    if (!id) return;
    setIsLoadingProviders(true);
    try {
      console.log('Fetching providers for event ID:', id);
      const { readEventProviders } = await import('@/lib/directus');
      const data = await readEventProviders(id);
      console.log('Providers data received:', data);
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      setProviders([]);
    } finally {
      setIsLoadingProviders(false);
    }
  };

  useEffect(() => {
    if (event) {
      fetchProviders();
    }
  }, [event]);

  const handleSubmitProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { createProvider } = await import('@/lib/directus');
      
      if (editingProvider) {
        // Actualizar proveedor existente
        console.log('Updating provider:', editingProvider.id);
        const { updateProvider } = await import('@/lib/directus');
        await updateProvider(editingProvider.id, formData);
        alert('Proveedor actualizado exitosamente');
      } else {
        // Crear nuevo proveedor
        console.log('Creating provider for event:', id);
        await createProvider({ ...formData, evento: id, status: 'draft' });
        alert('Proveedor creado exitosamente');
      }
      
      setFormData({ name: '', contact_name: '', email: '', phone: '', description: '' });
      setShowProviderForm(false);
      setEditingProvider(null);
      fetchProviders();
    } catch (error) {
      console.error('Error saving provider:', error);
      alert('Error al guardar el proveedor');
    }
  };

  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      contact_name: provider.contact_name || '',
      email: provider.email || '',
      phone: provider.phone || '',
      description: provider.description || '',
    });
    setShowProviderForm(true);
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    try {
      const { deleteProvider } = await import('@/lib/directus');
      await deleteProvider(providerId);
      alert('Proveedor eliminado exitosamente');
      fetchProviders();
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert('Error al eliminar el proveedor');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Borrador';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Completado';
      default:
        return status;
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

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/events" className="text-xl font-bold text-black">
                  ← Volver a Eventos
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-black mb-2">Evento no encontrado</h2>
            <p className="text-gray-600 mb-6">El evento que buscas no existe o no tienes permiso para verlo.</p>
            <Link href="/events" className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
              Volver a la lista de eventos
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
              <Link href="/events" className="text-xl font-bold text-black">
                ← Volver a Eventos
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <EventStatusSelector
                eventId={event.id}
                currentStatus={event.status}
                onStatusChange={(newStatus) => {
                  console.log(`Event ${event.id} status changed to ${newStatus}`);
                }}
                onRefresh={() => {
                  // Recargar el evento desde la lista
                  const fetchEventFromList = async () => {
                    try {
                      const { readUserEvents } = await import('@/lib/directus');
                      const data = await readUserEvents(user!.id);
                      const foundEvent = data.find((item: any) => item.id === id);
                      if (foundEvent) {
                        const mappedEvent: Event = {
                          id: foundEvent.id,
                          title: foundEvent.title,
                          description: foundEvent.description,
                          startDate: foundEvent.start_date,
                          endDate: foundEvent.end_date,
                          location: foundEvent.location,
                          status: foundEvent.status,
                          createdAt: foundEvent.date_created
                        };
                        setEvent(mappedEvent);
                      }
                    } catch (error) {
                      console.error('Error refreshing event:', error);
                    }
                  };
                  fetchEventFromList();
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">{event.title}</h1>
          <p className="text-gray-600 text-lg mb-6">{event.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-black">Fecha de Inicio:</span>
              <div className="text-gray-600">
                {new Date(event.startDate).toLocaleDateString('es-AR')} {new Date(event.startDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div>
              <span className="font-medium text-black">Fecha de Fin:</span>
              <div className="text-gray-600">
                {new Date(event.endDate).toLocaleDateString('es-AR')} {new Date(event.endDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div>
              <span className="font-medium text-black">Ubicación:</span>
              <div className="text-gray-600">{event.location}</div>
            </div>
          </div>
        </div>

        {/* Providers Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Proveedores del Evento</h2>
            <button
              onClick={() => {
                setEditingProvider(null);
                setFormData({ name: '', contact_name: '', email: '', phone: '', description: '' });
                setShowProviderForm(!showProviderForm);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
            >
              {showProviderForm ? 'Cancelar' : '+ Agregar Proveedor'}
            </button>
          </div>

          {/* Provider Form */}
          {showProviderForm && (
            <form onSubmit={handleSubmitProvider} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-black mb-4">
                {editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Proveedor *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Contacto/Representante</label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email de Contacto</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del Servicio</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProviderForm(false);
                    setEditingProvider(null);
                    setFormData({ name: '', contact_name: '', email: '', phone: '', description: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                >
                  {editingProvider ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          )}

          {/* Providers List */}
          {isLoadingProviders ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando proveedores...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-black mb-2">No hay proveedores</h3>
              <p className="text-gray-600">Agrega el primer proveedor para este evento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {providers.map(provider => (
                <div key={provider.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-black">{provider.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                        {getStatusText(provider.status)}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditProvider(provider)}
                        className="px-3 py-1 text-sm text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  {provider.description && <p className="text-gray-600 mb-4">{provider.description}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {provider.contact_name && (
                      <div>
                        <span className="font-medium text-black">Contacto:</span>
                        <div className="text-gray-600">{provider.contact_name}</div>
                      </div>
                    )}
                    {provider.email && (
                      <div>
                        <span className="font-medium text-black">Email:</span>
                        <div className="text-gray-600">{provider.email}</div>
                      </div>
                    )}
                    {provider.phone && (
                      <div>
                        <span className="font-medium text-black">Teléfono:</span>
                        <div className="text-gray-600">{provider.phone}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}