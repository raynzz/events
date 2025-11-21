'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';

interface DocumentRequirement {
  id: string;
  type: 'RC' | 'AP' | 'ART' | 'SS' | 'CUSTOM';
  name: string;
  required: boolean;
  description: string;
  status: 'pending' | 'uploaded' | 'verified';
  uploadUrl?: string;
}

interface Provider {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  contactName: string;
  documents: DocumentRequirement[];
}

export default function AddProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const id = use(params).id;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    contactName: ''
  });

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [customDocuments, setCustomDocuments] = useState<Array<{id: string, name: string, description: string}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomDocumentForm, setShowCustomDocumentForm] = useState(false);
  const [newCustomDocument, setNewCustomDocument] = useState({
    name: '',
    description: ''
  });

  // Obtener información del evento para determinar documentos requeridos
  const eventRequiresLiquorLicense = id === '3' || id === '6'; // Ejemplo: eventos con venta de licores

  // Documentos disponibles según el tipo de evento
  const availableDocuments = [
    {
      id: 'rc',
      type: 'RC' as const,
      name: 'Registro de Comercio',
      description: 'Registro legal del establecimiento',
      required: true
    },
    {
      id: 'ap',
      type: 'AP' as const,
      name: 'Autorización de Policía',
      description: 'Permiso de autoridades locales',
      required: true
    },
    {
      id: 'art-work',
      type: 'ART' as const,
      name: 'ART - Responsabilidad del Trabajo',
      description: 'Seguro de accidentes de trabajo',
      required: eventRequiresLiquorLicense
    },
    {
      id: 'art-civil',
      type: 'ART' as const,
      name: 'ART - Responsabilidad Civil',
      description: 'Seguro de responsabilidad civil',
      required: eventRequiresLiquorLicense
    },
    {
      id: 'ss',
      type: 'SS' as const,
      name: 'Servicios Sanitarios',
      description: 'Permiso de servicios e higiene',
      required: eventRequiresLiquorLicense
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  const handleCustomDocumentInputChange = (field: string, value: string) => {
    setNewCustomDocument(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addCustomDocument = () => {
    if (!newCustomDocument.name.trim()) {
      alert('Por favor ingrese un nombre para el documento');
      return;
    }

    const customDoc = {
      id: `custom-${Date.now()}`,
      name: newCustomDocument.name.trim(),
      description: newCustomDocument.description.trim()
    };

    setCustomDocuments(prev => [...prev, customDoc]);
    setNewCustomDocument({ name: '', description: '' });
    setShowCustomDocumentForm(false);
  };

  const removeCustomDocument = (id: string) => {
    setCustomDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validación básica
      if (!formData.name || !formData.email || !formData.contactName) {
        alert('Por favor complete los campos obligatorios');
        return;
      }

      // Filtrar documentos seleccionados y crear array de documentos
      const documents: DocumentRequirement[] = [
        ...availableDocuments
          .filter(doc => selectedDocuments.includes(doc.id))
          .map(doc => ({
            id: `${doc.id}-${Date.now()}`,
            type: doc.type,
            name: doc.name,
            required: doc.required,
            description: doc.description,
            status: 'pending' as const
          })),
        ...customDocuments.map(customDoc => ({
          id: customDoc.id,
          type: 'CUSTOM' as const,
          name: customDoc.name,
          required: false,
          description: customDoc.description,
          status: 'pending' as const
        }))
      ];

      const providerData = {
        ...formData,
        documents
      };

      // En una aplicación real, aquí se llamaría a la API
      console.log('Agregando proveedor:', providerData);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Proveedor "${formData.name}" agregado exitosamente!`);
      
      // Redirigir de vuelta al detalle del evento
      router.push(`/events/${id}`);
    } catch (error) {
      console.error('Error al agregar proveedor:', error);
      alert('Error al agregar el proveedor. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/events/${id}`} className="text-xl font-bold text-black">
                ← Volver al Evento
              </Link>
            </div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-black">Agregar Nuevo Proveedor</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica del proveedor */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-black mb-6">Información del Proveedor</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contacto Principal *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Selección de documentos */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-black mb-6">Documentos Requeridos</h2>
            
            <p className="text-sm text-gray-600 mb-4">
              Seleccione los documentos que este proveedor necesita para el evento.
            </p>

            <div className="space-y-3">
              {availableDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDocuments.includes(doc.id)
                      ? 'border-black bg-black bg-opacity-5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleDocumentToggle(doc.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => handleDocumentToggle(doc.id)}
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-black">
                          {doc.name}
                          {doc.required && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Obligatorio
                            </span>
                          )}
                        </h4>
                      </div>
                      <p className="text-sm text-black mt-1">{doc.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Documentos personalizados */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-black">Documentos Personalizados</h3>
                <button
                  type="button"
                  onClick={() => setShowCustomDocumentForm(!showCustomDocumentForm)}
                  className="px-3 py-1 text-sm text-black bg-gray-100 rounded-md hover:bg-gray-200 flex items-center space-x-1"
                >
                  <span>{showCustomDocumentForm ? 'Cancelar' : 'Agregar Documento'}</span>
                  <svg className={`w-4 h-4 transform transition-transform ${showCustomDocumentForm ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {showCustomDocumentForm && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Documento *
                      </label>
                      <input
                        type="text"
                        value={newCustomDocument.name}
                        onChange={(e) => handleCustomDocumentInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Ej: Seguro de mercancías"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={newCustomDocument.description}
                        onChange={(e) => handleCustomDocumentInputChange('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Descripción del documento"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomDocumentForm(false)}
                      className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={addCustomDocument}
                      className="px-3 py-1 text-sm text-white bg-black rounded-md hover:bg-gray-800"
                    >
                      Agregar Documento
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de documentos personalizados agregados */}
              {customDocuments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">Documentos personalizados agregados:</p>
                  {customDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-black">{doc.name}</h4>
                        {doc.description && (
                          <p className="text-sm text-black mt-1">{doc.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCustomDocument(doc.id)}
                        className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar documento"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Link href={`/events/${id}`}>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Agregar Proveedor'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}