'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProviderManager from '@/components/ProviderManager';

interface Provider {
  id: string;
  name: string;
  description: string;
  requiresLiquorLicense: boolean;
  requiredDocuments: any[];
  teamMembers: any[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  category: string;
  requiresLiquorLicense: boolean;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  providers: Provider[];
  createdAt: string;
  updatedAt: string;
}

export default function EventDashboardPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);

  // Load event data
  useEffect(() => {
    const mockEvent: Event = {
      id: params.id,
      title: 'Feria gastronómica italiana',
      description: 'El mejor evento de comida italiana en la ciudad con chefs internacionales y productos importados directamente de Italia.',
      startDate: '2024-06-15T10:00:00',
      endDate: '2024-06-17T22:00:00',
      location: 'Usina del Arte, Buenos Aires',
      capacity: 1200,
      category: 'gastronomico',
      requiresLiquorLicense: true,
      status: 'published',
      providers: [
        {
          id: 'provider-1',
          name: 'Branca',
          description: 'Proveedor principal de alimentos italianos',
          requiresLiquorLicense: true,
          requiredDocuments: [
            { id: 'rc1', type: 'RC', name: 'Registro de Comercio', required: false, description: 'Registro legal del establecimiento' },
            { id: 'ap1', type: 'AP', name: 'Autorización de Policía', required: false, description: 'Permiso de autoridades locales' },
            { id: 'art1', type: 'ART', name: 'ART - Responsabilidad del Trabajo', required: false, description: 'Seguro de accidentes de trabajo' },
          ],
          teamMembers: [
            {
              id: 'member-1',
              name: 'Ana Lucia',
              role: 'Jefa de Cocina',
              documentStatus: {
                'rc1': 'verified',
                'ap1': 'uploaded',
                'art1': 'pending'
              }
            },
            {
              id: 'member-2',
              name: 'Luis Pérez',
              role: 'Sous Chef',
              documentStatus: {
                'rc1': 'verified',
                'ap1': 'verified',
                'art1': 'verified'
              }
            },
            {
              id: 'member-3',
              name: 'Luciano Reyes',
              role: 'Ayudante de Cocina',
              documentStatus: {
                'rc1': 'pending',
                'ap1': 'pending',
                'art1': 'pending'
              }
            },
            {
              id: 'member-4',
              name: 'Maria Becerra',
              role: 'Camarera',
              documentStatus: {
                'rc1': 'verified',
                'ap1': 'uploaded',
                'art1': 'verified'
              }
            }
          ]
        }
      ],
      createdAt: '2024-05-01T10:00:00',
      updatedAt: '2024-05-10T14:30:00',
    };

    // Simulate loading
    setTimeout(() => {
      if (params.id === '1' || params.id === '2' || params.id === '3') {
        setEvent(mockEvent);
        setProviders(mockEvent.providers);
      } else {
        setEvent(null);
      }
    }, 500);
  }, [params.id]);

  const handleProvidersChange = (updatedProviders: Provider[]) => {
    setProviders(updatedProviders);
    if (event) {
      setEvent({
        ...event,
        providers: updatedProviders
      });
    }
  };

  const getEventProgress = () => {
    if (!event) return 0;
    
    const totalProviders = event.providers.length;
    const completedProviders = event.providers.filter(provider => {
      const completionPercentage = getProviderCompletionPercentage(provider);
      return completionPercentage === 100;
    }).length;
    
    return totalProviders > 0 ? Math.round((completedProviders / totalProviders) * 100) : 0;
  };

  const getProviderCompletionPercentage = (provider: Provider) => {
    if (provider.teamMembers.length === 0) return 0;
    
    const totalDocuments = provider.requiredDocuments.length;
    if (totalDocuments === 0) return 100;
    
    let completedDocuments = 0;
    provider.teamMembers.forEach(member => {
      Object.values(member.documentStatus).forEach(status => {
        if (status === 'verified') completedDocuments++;
      });
    });
    
    return Math.round((completedDocuments / (provider.teamMembers.length * totalDocuments)) * 100);
  };

  const getTotalTeamMembers = () => {
    return event?.providers.reduce((total, provider) => total + provider.teamMembers.length, 0) || 0;
  };

  const getVerifiedDocuments = () => {
    return event?.providers.reduce((total, provider) => {
      return total + provider.teamMembers.reduce((memberTotal, member) => {
        return memberTotal + Object.values(member.documentStatus).filter(status => status === 'verified').length;
      }, 0);
    }, 0) || 0;
  };

  const getTotalDocuments = () => {
    return event?.providers.reduce((total, provider) => {
      return total + (provider.requiredDocuments.length * provider.teamMembers.length);
    }, 0) || 0;
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
            <Link
              href="/events"
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
            >
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
              <Link href={`/events/${params.id}`} className="text-xl font-bold text-black">
                ← Volver al Evento
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-black">Dashboard del Evento</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">{event.title}</h2>
              <p className="text-gray-600 mb-4">{event.description}</p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {event.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  {event.capacity} personas
                </div>
                {event.requiresLiquorLicense && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    🍷 Venta de bebidas
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                event.status === 'published' ? 'bg-green-100 text-green-800' :
                event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {event.status === 'published' ? 'Publicado' :
                 event.status === 'draft' ? 'Borrador' :
                 event.status === 'completed' ? 'Completado' : 'Cancelado'}
              </span>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">P</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Progreso Total</p>
                  <p className="text-2xl font-semibold text-black">{getEventProgress()}%</p>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-black h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getEventProgress()}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">👥</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Integrantes</p>
                  <p className="text-2xl font-semibold text-black">{getTotalTeamMembers()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Documentos Verificados</p>
                  <p className="text-2xl font-semibold text-black">{getVerifiedDocuments()}/{getTotalDocuments()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🏢</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Proveedores</p>
                  <p className="text-2xl font-semibold text-black">{event.providers.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Provider Management */}
        <ProviderManager
          providers={providers}
          onProvidersChange={handleProvidersChange}
        />
      </main>
    </div>
  );
}