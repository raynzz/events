'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { use } from 'react';
import CredentialPreviewModal from '@/components/CredentialPreviewModal';

interface DocumentRequirement {
  id: string;
  type: 'RC' | 'AP' | 'ART' | 'SS';
  name: string;
  required: boolean;
  description: string;
  status: 'pending' | 'uploaded' | 'verified';
  uploadUrl?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  registered: number;
  price: number;
  category: string;
  requiresLiquorLicense: boolean;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  requiredDocuments: DocumentRequirement[];
  additionalDocuments: DocumentRequirement[];
  createdAt: string;
  updatedAt: string;
  organizer: {
    name: string;
    email: string;
  };
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'providers'>('overview');
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [providers, setProviders] = useState<any[]>([]); // New state for providers
  const id = use(params).id;

  // Fetch event and providers from Directus
  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;

      try {
        const { readItem, readItems } = await import('@/lib/directus');

        // 1. Fetch Event Details
        const eventData = await readItem('events', id, {
          fields: ['*']
        });

        if (eventData) {
          // 2. Fetch Providers
          const providersData = await readItems('providers', {
            fields: ['*', 'team_members.*']
          });
          setProviders(providersData);

          setEvent({
            id: eventData.id,
            title: eventData.name,
            description: eventData.description,
            startDate: eventData.start_date,
            endDate: eventData.end_date,
            location: eventData.location,
            capacity: eventData.capacity,
            registered: 0,
            price: eventData.price,
            category: 'conferencia',
            requiresLiquorLicense: eventData.requires_liquor_license,
            status: eventData.status,
            createdAt: eventData.date_created,
            updatedAt: eventData.date_updated,
            organizer: {
              name: eventData.organizer_name || 'Organizador',
              email: eventData.organizer_email || 'email@example.com'
            },
            requiredDocuments: [],
            additionalDocuments: []
          });
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
        setEvent(null);
      }
    };

    fetchEventData();
  }, [id]);

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

  const getDocumentStatusColor = (status: DocumentRequirement['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'uploaded':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentStatusText = (status: DocumentRequirement['status']) => {
    switch (status) {
      case 'verified':
        return 'Verificado';
      case 'uploaded':
        return 'Subido';
      case 'pending':
        return 'Pendiente';
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
      deportivo: 'Evento Deportivo',
      feria: 'Feria'
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'conferencia':
        return 'bg-blue-100 text-blue-800';
      case 'workshop':
        return 'bg-purple-100 text-purple-800';
      case 'networking':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-pink-100 text-pink-800';
      case 'cultural':
        return 'bg-indigo-100 text-indigo-800';
      case 'deportivo':
        return 'bg-orange-100 text-orange-800';
      case 'feria':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrintCredential = (assistant: any, providerName: string) => {
    const credentialData = {
      id: `CRD-${event?.id}-${assistant.id}`,
      name: assistant.name,
      email: assistant.email,
      provider: providerName,
      eventId: event?.id || '',
      eventName: event?.title || '',
      eventDate: event?.startDate || '',
      position: assistant.position || 'Asistente'
    };
    setSelectedCredential(credentialData);
    setIsCredentialModalOpen(true);
  };

  const getRegistrationProgress = () => {
    if (!event) return 0;
    return Math.round((event.registered / event.capacity) * 100);
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
              <Link href="/events" className="text-xl font-bold text-black flex items-center">
                ← Volver a Eventos
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/events/${event.id}/edit`}>
                <button className="px-3 py-1 text-sm text-white bg-black rounded-md hover:bg-gray-800">
                  Editar Evento
                </button>
              </Link>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {getStatusText(event.status)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                {getCategoryText(event.category)}
              </span>
              {event.requiresLiquorLicense && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  🍷 Venta de Licores
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">{event.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{event.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryText(event.category) === 'Gratis' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {event.price === 0 ? 'Gratis' : 'De Pago'}
              </span>
            </div>
          </div>

          {/* Event Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-medium text-black mb-1">
                {new Date(event.startDate).toLocaleDateString('es-AR')}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(event.startDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-medium text-black mb-1">{event.registered}</div>
              <div className="text-xs text-gray-500">de {event.capacity}</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-medium text-black mb-1">
                {getRegistrationProgress()}%
              </div>
              <div className="text-xs text-gray-500">Progreso</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="text-2xl">📍</div>
            <div>
              <div className="font-medium text-black">{event.location}</div>
              <div className="text-sm text-gray-600">Ubicación del evento</div>
            </div>
          </div>

          {/* Registration Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Documentación de proveedores completada</span>
              <span>{getRegistrationProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-black h-2 rounded-full transition-all duration-300"
                style={{ width: `${getRegistrationProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'documents'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Documentos
              </button>
              <button
                onClick={() => setActiveTab('providers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'providers'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Proveedores
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-black mb-4">Información del Evento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <h4 className="font-medium text-black mb-2">Organizador</h4>
                      <p className="text-gray-600">{event.organizer.name}</p>
                      <p className="text-gray-600">{event.organizer.email}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-black mb-2">Capacidad</h4>
                      <p className="text-gray-600">{event.capacity} personas</p>
                      <p className="text-gray-600">{event.capacity - event.registered} cupos disponibles</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-black mb-2">Requisitos</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Mayores de 18 años</li>
                    <li>• Documento de identidad vigente</li>
                    {event.requiresLiquorLicense && (
                      <li>• Mayores de 21 años para consumo de bebidas alcohólicas</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-black mb-2">Incluye</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Acceso al evento</li>
                    <li>• Material de conferencia</li>
                    <li>• Coffee break</li>
                    <li>• Certificado de participación</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-black mb-4">Documentos Requeridos</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-black mb-3">Documentos Obligatorios</h4>
                      <div className="space-y-3">
                        {event.requiredDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.type === 'RC' ? 'bg-red-100 text-red-800' :
                                doc.type === 'AP' ? 'bg-purple-100 text-purple-800' :
                                  doc.type === 'ART' ? 'bg-green-100 text-green-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                {doc.type}
                              </span>
                              <div>
                                <h5 className="font-medium text-black">{doc.name}</h5>
                                <p className="text-sm text-black">{doc.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentStatusColor(doc.status)}`}>
                                {getDocumentStatusText(doc.status)}
                              </span>
                              {doc.status === 'pending' && (
                                <button className="px-3 py-1 text-xs text-white bg-black rounded-md hover:bg-gray-800">
                                  Subir Documento
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {event.additionalDocuments.length > 0 && (
                      <div>
                        <h4 className="font-medium text-black mb-3">Documentos Adicionales</h4>
                        <div className="space-y-3">
                          {event.additionalDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.type === 'RC' ? 'bg-red-100 text-red-800' :
                                  doc.type === 'AP' ? 'bg-purple-100 text-purple-800' :
                                    doc.type === 'ART' ? 'bg-green-100 text-green-800' :
                                      'bg-blue-100 text-blue-800'
                                  }`}>
                                  {doc.type}
                                </span>
                                <div>
                                  <h5 className="font-medium text-black">{doc.name}</h5>
                                  <p className="text-sm text-black">{doc.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentStatusColor(doc.status)}`}>
                                  {getDocumentStatusText(doc.status)}
                                </span>
                                {doc.status === 'pending' && (
                                  <button className="px-3 py-1 text-xs text-white bg-black rounded-md hover:bg-gray-800">
                                    Subir Documento
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ Documentación Requerida</h4>
                  <p className="text-sm text-yellow-700">
                    Todos los documentos obligatorios deben ser presentados al menos 48 horas antes del evento.
                    Los documentos adicionales pueden ser solicitados durante el evento.
                  </p>
                </div>
              </div>
            )}

            {/* Providers Tab */}
            {activeTab === 'providers' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-black">Gestión de Proveedores</h3>
                  <Link href={`/events/${event.id}/providers/new`}>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
                      + Agregar Proveedor
                    </button>
                  </Link>
                </div>

                <div className="space-y-6">
                  {/* Provider Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-black mb-1">2</div>
                      <div className="text-sm text-gray-600">Proveedores</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-black mb-1">8</div>
                      <div className="text-sm text-gray-600">Documentos Requeridos</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-black mb-1">5</div>
                      <div className="text-sm text-gray-600">Verificados</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-black mb-1">62%</div>
                      <div className="text-sm text-gray-600">Progreso</div>
                    </div>
                  </div>

                  {/* Provider List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                      <span className="text-sm text-black">ART - Responsabilidad del Trabajo</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pendiente</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                      <span className="text-sm text-black">SS - Servicios Sanitarios</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pendiente</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>


      {/* Credential Preview Modal */}
      <CredentialPreviewModal
        isOpen={isCredentialModalOpen}
        onClose={() => setIsCredentialModalOpen(false)}
        credentialData={selectedCredential}
      />
    </div>
  );
}