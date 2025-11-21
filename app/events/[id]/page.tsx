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
  const id = use(params).id;

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const baseMockEvent: Omit<Event, 'requiredDocuments' | 'additionalDocuments'> = {
      id: id,
      title: 'Conferencia de Tecnología 2024',
      description: 'El mayor evento de tecnología del año con ponentes internacionales de renombre. Este evento reunirá a los líderes de la industria, emprendedores e innovadores para compartir conocimientos sobre las últimas tendencias en IA, blockchain, cloud computing y desarrollo web moderno. Incluye sesiones prácticas, networking y exhibición de tecnologías emergentes.',
      startDate: '2024-03-15T09:00:00',
      endDate: '2024-03-15T18:00:00',
      location: 'Centro de Convenciones, Buenos Aires',
      capacity: 500,
      registered: 342,
      price: 250,
      category: 'conferencia',
      requiresLiquorLicense: false,
      status: 'published',
      createdAt: '2024-02-01T10:00:00',
      updatedAt: '2024-02-10T14:30:00',
      organizer: {
        name: 'Tech Events SRL',
        email: 'events@techevents.com'
      }
    };

    // Simulate loading and different events based on ID
    setTimeout(() => {
      if (id === '1') {
        setEvent({
          ...baseMockEvent,
          requiredDocuments: [
            { id: 'rc1', type: 'RC', name: 'Registro de Comercio', required: true, description: 'Registro legal del establecimiento', status: 'verified' },
            { id: 'ap1', type: 'AP', name: 'Autorización de Policía', required: true, description: 'Permiso de autoridades locales', status: 'pending' },
          ],
          additionalDocuments: [
            { id: 'art1', type: 'ART', name: 'ART - Responsabilidad del Trabajo', required: false, description: 'Seguro de accidentes de trabajo', status: 'pending' },
          ],
        });
      } else if (id === '2') {
        setEvent({
          ...baseMockEvent,
          title: 'Workshop de React Avanzado',
          description: 'Taller práctico de React con hooks, context API y nuevas características de React 18.',
          location: 'Coworking Palermo, Buenos Aires',
          capacity: 30,
          registered: 28,
          price: 80,
          category: 'workshop',
          requiredDocuments: [
            { id: 'rc1', type: 'RC', name: 'Registro de Comercio', required: true, description: 'Registro legal del establecimiento', status: 'verified' },
          ],
          additionalDocuments: [],
        });
      } else if (id === '3') {
        setEvent({
          ...baseMockEvent,
          title: 'Fiesta de Año Nuevo',
          description: 'Celebración de fin de año con música en vivo, buffet, open bar y sorpresas.',
          location: 'Salón de Eventos, Córdoba',
          capacity: 200,
          registered: 156,
          price: 150,
          category: 'social',
          requiresLiquorLicense: true,
          requiredDocuments: [
            { id: 'rc1', type: 'RC', name: 'Registro de Comercio', required: true, description: 'Registro legal del establecimiento', status: 'verified' },
            { id: 'ap1', type: 'AP', name: 'Autorización de Policía', required: true, description: 'Permiso de autoridades locales', status: 'verified' },
            { id: 'art1', type: 'ART', name: 'ART - Responsabilidad del Trabajo', required: true, description: 'Seguro de accidentes de trabajo', status: 'verified' },
            { id: 'art2', type: 'ART', name: 'ART - Responsabilidad Civil', required: true, description: 'Seguro de responsabilidad civil', status: 'pending' },
          ],
          additionalDocuments: [],
        });
      } else if (id === '6') {
        setEvent({
          ...baseMockEvent,
          title: 'Feria gastronómica italiana',
          description: 'Celebración de la auténtica cocina italiana con chefs internacionales, vinos selectos y música en vivo. Incluye demostraciones de cocina, degustaciones de pasta artesanal, pizzas de horno de leña y postres típicos.',
          location: 'Usina del Arte, Buenos Aires',
          capacity: 1200,
          registered: 892,
          price: 0,
          category: 'feria',
          requiresLiquorLicense: true,
          requiredDocuments: [
            { id: 'rc1', type: 'RC', name: 'Registro de Comercio', required: true, description: 'Registro legal del establecimiento', status: 'verified' },
            { id: 'ap1', type: 'AP', name: 'Autorización de Policía', required: true, description: 'Permiso de autoridades locales', status: 'verified' },
            { id: 'art1', type: 'ART', name: 'ART - Responsabilidad del Trabajo', required: true, description: 'Seguro de accidentes de trabajo', status: 'pending' },
            { id: 'art2', type: 'ART', name: 'ART - Responsabilidad Civil', required: true, description: 'Seguro de responsabilidad civil', status: 'pending' },
            { id: 'ss1', type: 'SS', name: 'Servicios Sanitarios', required: true, description: 'Permiso de servicios e higiene', status: 'verified' },
          ],
          additionalDocuments: [],
        });
      } else {
        setEvent(null);
      }
    }, 500);
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Documentos
              </button>
              <button
                onClick={() => setActiveTab('providers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'providers'
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
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                doc.type === 'RC' ? 'bg-red-100 text-red-800' :
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
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  doc.type === 'RC' ? 'bg-red-100 text-red-800' :
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
                    {/* Provider 1: Branca */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedProvider(expandedProvider === 'branca' ? null : 'branca')}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-black mb-2">Branca</h4>
                            <p className="text-sm text-gray-600">Proveedor de bebidas alcohólicas</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>📞 contact@branca.com</span>
                              <span>📱 +54 9 11 2345-6789</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="px-3 py-1 text-sm text-black bg-gray-100 rounded-md hover:bg-gray-200">
                              Editar
                            </button>
                            <button className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700">
                              Eliminar
                            </button>
                            <button className="px-2 py-1 text-sm text-black">
                              {expandedProvider === 'branca' ? '▲' : '▼'}
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progreso de documentos</span>
                            <span>75% (3/4)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Asistentes</span>
                            <span>3 asistentes</span>
                          </div>
                        </div>
                      </div>
                      
                      {expandedProvider === 'branca' && (
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                          <h5 className="font-medium text-black mb-4">Asistentes de Branca</h5>
                          <div className="space-y-3">
                            {Array.from({ length: 3 }, (_, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      {String.fromCharCode(65 + i)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm text-black">Asistente {i + 1}</div>
                                    <div className="text-xs text-gray-600">asistente{i + 1}@branca.com</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Confirmado
                                  </span>
                                  <button
                                    onClick={() => handlePrintCredential({
                                      id: `assist-${i + 1}`,
                                      name: `Asistente ${i + 1}`,
                                      email: `asistente${i + 1}@branca.com`,
                                      position: 'Asistente'
                                    }, 'Branca')}
                                    className="px-2 py-1 text-xs text-white bg-black rounded-md hover:bg-gray-800"
                                  >
                                    🖨️ Imprimir
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2 p-6 border-t border-gray-200">
                        <h5 className="font-medium text-black text-sm">Documentos requeridos:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                            <span className="text-sm text-black">RC - Registro de Comercio</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verificado</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                            <span className="text-sm text-black">AP - Autorización Policía</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verificado</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                            <span className="text-sm text-black">SS - Servicios Sanitarios</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verificado</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                            <span className="text-sm text-black">ART - Responsabilidad Civil</span>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pendiente</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Provider 2: Catering Italiano */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedProvider(expandedProvider === 'catering' ? null : 'catering')}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-black mb-2">Catering Italiano</h4>
                            <p className="text-sm text-gray-600">Servicio de catering y comida italiana</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>📞 info@cateringitaliano.com</span>
                              <span>📱 +54 9 11 3456-7890</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="px-3 py-1 text-sm text-black bg-gray-100 rounded-md hover:bg-gray-200">
                              Editar
                            </button>
                            <button className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700">
                              Eliminar
                            </button>
                            <button className="px-2 py-1 text-sm text-black">
                              {expandedProvider === 'catering' ? '▲' : '▼'}
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progreso de documentos</span>
                            <span>50% (2/4)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Asistentes</span>
                            <span>4 asistentes</span>
                          </div>
                        </div>
                      </div>
                      
                      {expandedProvider === 'catering' && (
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                          <h5 className="font-medium text-black mb-4">Asistentes de Catering Italiano</h5>
                          <div className="space-y-3">
                            {Array.from({ length: 4 }, (_, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      {String.fromCharCode(68 + i)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm text-black">Asistente {i + 1}</div>
                                    <div className="text-xs text-gray-600">asistente{i + 1}@cateringitaliano.com</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Confirmado
                                  </span>
                                  <button
                                    onClick={() => handlePrintCredential({
                                      id: `assist-${i + 4}`,
                                      name: `Asistente ${i + 1}`,
                                      email: `asistente${i + 1}@cateringitaliano.com`,
                                      position: 'Asistente'
                                    }, 'Catering Italiano')}
                                    className="px-2 py-1 text-xs text-white bg-black rounded-md hover:bg-gray-800"
                                  >
                                    🖨️ Imprimir
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2 p-6 border-t border-gray-200">
                        <h5 className="font-medium text-black text-sm">Documentos requeridos:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                            <span className="text-sm text-black">RC - Registro de Comercio</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verificado</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                            <span className="text-sm text-black">AP - Autorización Policía</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verificado</span>
                          </div>
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