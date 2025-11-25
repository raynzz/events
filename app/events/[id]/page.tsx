'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { readItem, readEventProviders, createProvider, updateProvider, deleteProvider, Integrante } from '@/lib/directus';
import { use } from 'react';

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

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = use(params);
  
  // Debug: Mostrar el ID recibido
  console.log('EventDetailPage - Received ID:', id);
  console.log('EventDetailPage - ID type:', typeof id);

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

  // Estados para integrantes
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [isLoadingIntegrantes, setIsLoadingIntegrantes] = useState(false);
  const [showIntegranteForm, setShowIntegranteForm] = useState(false);
  const [editingIntegrante, setEditingIntegrante] = useState<Integrante | null>(null);
  const [integranteForm, setIntegranteForm] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    fecha_nacimiento: '',
    proveedor: '',
  });

  // Fetch event details
  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        console.log('Fetching event with ID:', id);
        const data = await readItem('eventos', id);
        console.log('Event data received:', data);
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        // Mostrar más detalles del error
        console.error('Event ID:', id);
        console.error('Full error:', error);
      }
    };
    fetchEvent();
  }, [id]);

  // Fetch providers for the event
  const fetchProviders = async () => {
    if (!id) return;
    setIsLoadingProviders(true);
    try {
      console.log('Fetching providers for event ID:', id);
      const data = await readEventProviders(id);
      console.log('Providers data received:', data);
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      console.error('Event ID:', id);
      console.error('Full error:', error);
      setProviders([]);
    } finally {
      setIsLoadingProviders(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchIntegrantes();
  }, [id]);

  // Cargar integrantes para el evento
  const fetchIntegrantes = async () => {
    if (!id) return;
    setIsLoadingIntegrantes(true);
    try {
      console.log('🔥 Fetching integrantes for event ID:', id);
      const { readIntegrantes } = await import('@/lib/directus');
      
      // Obtener todos los integrantes del evento
      const data = await readIntegrantes({
        filter: {
          evento: {
            _eq: id
          }
        },
        sort: 'sort,nombre,apellido'
      });
      
      console.log('🔥 Integrantes data received:', data);
      setIntegrantes(data || []);
      console.log('✅ Integrantes set in state:', data?.length || 0, 'integrantes');
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
      if (editingProvider) {
        await updateProvider(editingProvider.id, formData);
        alert('Proveedor actualizado exitosamente');
      } else {
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
      await deleteProvider(providerId);
      alert('Proveedor eliminado exitosamente');
      fetchProviders();
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert('Error al eliminar el proveedor');
    }
  };

  // Funciones para integrantes
  const handleIntegranteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { createIntegrante, updateIntegrante } = await import('@/lib/directus');
      
      if (editingIntegrante) {
        // Actualizar integrante existente - actualización optimista
        console.log('🔥 Updating integrante:', editingIntegrante.id);
        
        // Actualizar en la lista actual de inmediato (optimista)
        const updatedIntegrantes = integrantes.map(integrante =>
          integrante.id === editingIntegrante.id
            ? {
                ...integrante,
                nombre: integranteForm.nombre,
                apellido: integranteForm.apellido,
                documento: integranteForm.documento,
                fecha_nacimiento: integranteForm.fecha_nacimiento
              }
            : integrante
        );
        setIntegrantes(updatedIntegrantes);
        
        await updateIntegrante(editingIntegrante.id.toString(), integranteForm);
        console.log('✅ Integrante updated successfully');
        alert('Integrante actualizado exitosamente');
      } else {
        // Crear nuevo integrante - actualización optimista
        console.log('🔥 Creating integrante for provider:', integranteForm.proveedor);
        
        // Crear objeto optimista para mostrar inmediatamente
        const newIntegranteOptimista: Integrante = {
          id: Date.now(), // ID temporal para el optimista
          nombre: integranteForm.nombre,
          apellido: integranteForm.apellido,
          documento: integranteForm.documento,
          fecha_nacimiento: integranteForm.fecha_nacimiento,
          proveedor: parseInt(integranteForm.proveedor),
          evento: parseInt(id),
          status: 'active',
          sort: 0,
          date_created: new Date().toISOString(),
          date_updated: new Date().toISOString(),
          user_created: 0,
          user_updated: 0
        };
        
        // Agregar a la lista inmediatamente (optimista)
        setIntegrantes(prev => [...prev, newIntegranteOptimista]);
        
        const newIntegrante = await createIntegrante({
          ...integranteForm,
          evento: id,
          status: 'active'
        });
        console.log('✅ Integrante created successfully:', newIntegrante);
        
        alert('Integrante creado exitosamente');
        
        // Reemplazar el optimista con el real si tenemos el ID real
        if (newIntegrante?.data?.id) {
          setIntegrantes(prev => prev.map(integrante =>
            integrante.id === newIntegranteOptimista.id
              ? { ...newIntegranteOptimista, id: newIntegrante.data.id.toString() }
              : integrante
          ));
        }
      }
      
      // Limpiar formulario
      setIntegranteForm({
        nombre: '',
        apellido: '',
        documento: '',
        fecha_nacimiento: '',
        proveedor: '',
      });
      setShowIntegranteForm(false);
      setEditingIntegrante(null);
      
      // Solo recargar si hubo error o para sincronizar completamente
      console.log('🔥 Data updated in real-time');
    } catch (error) {
      console.error('❌ Error saving integrante:', error);
      alert('Error al guardar el integrante');
      
      // En caso de error, recargar los datos reales
      fetchIntegrantes();
    }
  };

  const handleEditIntegrante = (integrante: Integrante) => {
    setEditingIntegrante(integrante);
    setIntegranteForm({
      nombre: integrante.nombre,
      apellido: integrante.apellido,
      documento: integrante.documento,
      fecha_nacimiento: integrante.fecha_nacimiento.split('T')[0], // Convertir a formato YYYY-MM-DD
      proveedor: integrante.proveedor?.toString() || '',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
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
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {getStatusText(event.status)}
              </span>
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
                {new Date(event.start_date).toLocaleDateString('es-AR')} {new Date(event.start_date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div>
              <span className="font-medium text-black">Fecha de Fin:</span>
              <div className="text-gray-600">
                {new Date(event.end_date).toLocaleDateString('es-AR')} {new Date(event.end_date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
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
            <div className="space-y-3">
              {providers.map(provider => (
                <Link
                  key={provider.id}
                  href={`/events/${id}/providers/${provider.id}`}
                  className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-1">{provider.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {provider.contact_name && `Contacto: ${provider.contact_name} • `}
                        {provider.email && `Email: ${provider.email} • `}
                        {provider.phone && `Tel: ${provider.phone}`}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                        {getStatusText(provider.status)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}