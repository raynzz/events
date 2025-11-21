'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  price: number;
  category: string;
  requiresLiquorLicense: boolean;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: string;
}

export default function EventsPage() {
  const { user, loading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'draft'>('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Conferencia de Tecnología 2024',
        description: 'El mayor evento de tecnología del año con ponentes internacionales.',
        startDate: '2024-03-15T09:00:00',
        endDate: '2024-03-15T18:00:00',
        location: 'Centro de Convenciones, Buenos Aires',
        capacity: 500,
        price: 250,
        category: 'conferencia',
        requiresLiquorLicense: false,
        status: 'published',
        createdAt: '2024-02-01T10:00:00'
      },
      {
        id: '2',
        title: 'Workshop de React Avanzado',
        description: 'Taller práctico de React con hooks y context API.',
        startDate: '2024-03-20T14:00:00',
        endDate: '2024-03-20T18:00:00',
        location: 'Coworking Palermo, Buenos Aires',
        capacity: 30,
        price: 80,
        category: 'workshop',
        requiresLiquorLicense: false,
        status: 'published',
        createdAt: '2024-02-05T11:00:00'
      },
      {
        id: '3',
        title: 'Fiesta de Año Nuevo',
        description: 'Celebración de fin de año con música, comida y bebidas.',
        startDate: '2024-12-31T22:00:00',
        endDate: '2025-01-01T02:00:00',
        location: 'Salón de Eventos, Córdoba',
        capacity: 200,
        price: 150,
        category: 'social',
        requiresLiquorLicense: true,
        status: 'draft',
        createdAt: '2024-02-10T09:00:00'
      },
      {
        id: '4',
        title: 'Meetup de Desarrollo Web',
        description: 'Encuentro mensual de desarrolladores web para compartir conocimientos.',
        startDate: '2024-01-15T19:00:00',
        endDate: '2024-01-15T21:00:00',
        location: 'Espacio Coworking, Rosario',
        capacity: 50,
        price: 0,
        category: 'networking',
        requiresLiquorLicense: false,
        status: 'completed',
        createdAt: '2023-12-15T10:00:00'
      },
      {
        id: '5',
        title: 'Concierto de Jazz',
        description: 'Noche de jazz con artistas locales e internacionales.',
        startDate: '2024-04-10T20:00:00',
        endDate: '2024-04-10T23:00:00',
        location: 'Teatro Municipal, Mendoza',
        capacity: 300,
        price: 120,
        category: 'cultural',
        requiresLiquorLicense: true,
        status: 'published',
        createdAt: '2024-02-12T14:00:00'
      },
      {
        id: '6',
        title: 'Feria gastronómica italiana',
        description: 'Celebración de la auténtica cocina italiana con chefs internacionales, vinos selectos y música en vivo. Incluye demostraciones de cocina, degustaciones de pasta artesanal, pizzas de horno de leña y postres típicos.',
        startDate: '2024-05-15T18:00:00',
        endDate: '2024-05-18T23:00:00',
        location: 'Usina del Arte, Buenos Aires',
        capacity: 1200,
        price: 0,
        category: 'feria',
        requiresLiquorLicense: true,
        status: 'published',
        createdAt: '2024-02-20T10:00:00'
      }
    ];
    setEvents(mockEvents);
  }, []);

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

  const getCategoryText = (category: string) => {
    const categories: { [key: string]: string } = {
      conferencia: 'Conferencia',
      workshop: 'Workshop',
      networking: 'Networking',
      social: 'Evento Social',
      cultural: 'Evento Cultural',
      deportivo: 'Evento Deportivo'
    };
    return categories[category] || category;
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
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'all' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'upcoming' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Próximos
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'past' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pasados
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'draft' 
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
                        {event.requiresLiquorLicense && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            🍷 Venta de Licores
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Fecha:</span>
                          <div>{new Date(event.startDate).toLocaleDateString('es-AR')} {new Date(event.startDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div>
                          <span className="font-medium">Ubicación:</span>
                          <div>{event.location}</div>
                        </div>
                        <div>
                          <span className="font-medium">Capacidad:</span>
                          <div>{event.capacity} personas</div>
                        </div>
                        <div>
                          <span className="font-medium">Precio:</span>
                          <div>{event.price > 0 ? `$${event.price}` : 'Gratis'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getCategoryText(event.category)}
                        </span>
                        <span className="text-gray-500">
                          Creado el {new Date(event.createdAt).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex flex-col space-y-2">
                      <Link
                        href={`/events/${event.id}`}
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