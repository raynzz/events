'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
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

export default function EventsPage() {
  const { user, loading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'draft'>('all');

  // Fetch events from Directus
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Solo cargar eventos si el usuario está logueado
        if (!user?.id) {
          setEvents([]);
          return;
        }

        const { readUserEvents } = await import('@/lib/directus');

        const data = await readUserEvents(user.id);

        const mappedEvents: Event[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          startDate: item.start_date,
          endDate: item.end_date,
          location: item.location,
          status: item.status,
          createdAt: item.date_created
        }));

        setEvents(mappedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [user]);

  // Función para refrescar eventos (se puede llamar cuando se cambie el estado)
  const refreshEvents = async () => {
    try {
      const { readUserEvents } = await import('@/lib/directus');
      const data = await readUserEvents(user!.id);

      const mappedEvents: Event[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        startDate: item.start_date,
        endDate: item.end_date,
        location: item.location,
        status: item.status,
        createdAt: item.date_created
      }));

      setEvents(mappedEvents);
      console.log('Events refreshed successfully');
    } catch (error) {
      console.error('Error refreshing events:', error);
    }
  };

  const filteredEvents = events.filter(event => {
    const now = new Date();
    const eventStart = new Date(event.startDate);

    switch (filter) {
      case 'upcoming':
        return eventStart > now && event.status === 'published';
      case 'past':
        return eventStart <= now && event.status !== 'draft';
      case 'draft':
        return event.status === 'draft';
      default:
        return true;
    }
  });

  const getStatusColor = (status: Event['status']) => {
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

  const getStatusText = (status: Event['status']) => {
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
        return 'Desconocido';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-black">
                ← Volver al Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-black">Mis Eventos</h1>
              <Link
                href="/events/create"
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                + Nuevo Evento
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">E</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                <p className="text-2xl font-semibold text-black">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">P</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Publicados</p>
                <p className="text-2xl font-semibold text-black">
                  {events.filter(e => e.status === 'published').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">B</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Borradores</p>
                <p className="text-2xl font-semibold text-black">
                  {events.filter(e => e.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Próximos</p>
                <p className="text-2xl font-semibold text-black">
                  {events.filter(e => e.status === 'published' && new Date(e.startDate) > new Date()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'upcoming'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Próximos
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'past'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Pasados
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'draft'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Borradores
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-black mb-2">No hay eventos</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'draft'
                  ? 'No tienes eventos guardados como borradores.'
                  : 'No se encontraron eventos con los filtros seleccionados.'}
              </p>
              <Link
                href="/events/create"
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                Crear Evento
              </Link>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-black">{event.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {getStatusText(event.status)}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Fecha:</span>
                          <div>{new Date(event.startDate).toLocaleDateString('es-AR')} {new Date(event.startDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div>
                          <span className="font-medium">Ubicación:</span>
                          <div>{event.location}</div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        Creado el {new Date(event.createdAt).toLocaleDateString('es-AR')}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <EventStatusSelector
                          eventId={event.id}
                          currentStatus={event.status}
                          onStatusChange={(newStatus) => {
                            console.log(`Event ${event.id} status changed to ${newStatus}`);
                          }}
                          onRefresh={refreshEvents}
                        />
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <Link
                        href={`/events/temp-detail/${event.id}`}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                      >
                        Ver Detalles
                      </Link>
                      {event.status === 'draft' && (
                        <Link
                          href={`/events/${event.id}/edit`}
                          className="px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Editar
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
