'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AddDocumentModal from '@/components/AddDocumentModal';

interface DocumentRequirement {
  id: string;
  type: 'RC' | 'AP' | 'ART' | 'OTRO';
  name: string;
  required: boolean;
  description: string;
}

interface EventData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  price: number;
  category: string;
  requiresLiquorLicense: boolean;
  requiredDocuments: DocumentRequirement[];
  additionalDocuments: DocumentRequirement[];
}

export default function CreateEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [previewData, setPreviewData] = useState<EventData | null>(null);
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<EventData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    capacity: 100,
    price: 0,
    category: '',
    requiresLiquorLicense: false,
    requiredDocuments: [
      { id: 'rc1', type: 'RC', name: 'Registro de Comercio', required: true, description: 'Registro legal del establecimiento' },
      { id: 'ap1', type: 'AP', name: 'Autorización de Policía', required: true, description: 'Permiso de autoridades locales' },
    ],
    additionalDocuments: []
  });

  // Document templates
  const documentTemplates: DocumentRequirement[] = [
    { id: 'art1', type: 'ART', name: 'ART - Responsabilidad del Trabajo', required: false, description: 'Seguro de accidentes de trabajo' },
    { id: 'rc2', type: 'RC', name: 'Registro de Espectáculos Públicos', required: false, description: 'Registro para eventos públicos' },
    { id: 'ap2', type: 'AP', name: 'Autorización de Bomberos', required: false, description: 'Certificado de seguridad contra incendios' },
    { id: 'art2', type: 'ART', name: 'ART - Responsabilidad Civil', required: false, description: 'Seguro de responsabilidad civil' },
    { id: 'rc3', type: 'RC', name: 'Registro de Alimentos y Bebidas', required: false, description: 'Permiso para venta de alimentos' },
  ];

  const handleInputChange = (field: keyof EventData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addDocument = (document: DocumentRequirement) => {
    setFormData(prev => ({
      ...prev,
      additionalDocuments: [...prev.additionalDocuments, { ...document, id: `${document.type.toLowerCase()}-${Date.now()}` }]
    }));
  };

  const removeDocument = (id: string) => {
    setFormData(prev => ({
      ...prev,
      additionalDocuments: prev.additionalDocuments.filter(doc => doc.id !== id)
    }));
  };

  const handleAddCustomDocument = (document: {
    id: string;
    name: string;
    description: string;
    type: 'RC' | 'AP' | 'ART' | 'OTRO';
  }) => {
    setFormData(prev => ({
      ...prev,
      additionalDocuments: [...prev.additionalDocuments, { ...document, required: false }]
    }));
  };

  const handlePreview = () => {
    setPreviewData(formData);
    setActiveStep(3);
  };

  const handleSubmit = async () => {
    try {
      // Aquí iría la lógica para guardar el evento en la base de datos
      console.log('Guardando evento:', formData);
      
      // Simular guardado
      setTimeout(() => {
        router.push('/events');
      }, 1000);
    } catch (error) {
      console.error('Error al crear evento:', error);
    }
  };

  const steps = [
    { id: 1, name: 'Información Básica' },
    { id: 2, name: 'Documentos Requeridos' },
    { id: 3, name: 'Vista Previa' }
  ];

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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black">Crear Nuevo Evento</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex justify-center">
          <ol className="flex items-center space-x-2 sm:space-x-4">
            {steps.map((step, index) => (
              <li key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  activeStep >= step.id 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.id}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  activeStep >= step.id ? 'text-black' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-4 sm:ml-8 h-0.5 w-8 sm:w-16 ${
                    activeStep > step.id ? 'bg-black' : 'bg-gray-200'
                  }`}></div>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Step 1: Basic Information */}
        {activeStep === 1 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-6">Información Básica del Evento</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Ej: Conferencia de Tecnología 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black h-32"
                  placeholder="Descripción detallada del evento..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad *
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="conferencia">Conferencia</option>
                    <option value="workshop">Workshop</option>
                    <option value="networking">Networking</option>
                    <option value="social">Evento Social</option>
                    <option value="cultural">Evento Cultural</option>
                    <option value="deportivo">Evento Deportivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Dirección completa del evento"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="liquorLicense"
                  checked={formData.requiresLiquorLicense}
                  onChange={(e) => handleInputChange('requiresLiquorLicense', e.target.checked)}
                  className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <label htmlFor="liquorLicense" className="ml-2 text-sm text-gray-700">
                  Este evento requiere venta de licores (habilitará documentos adicionales)
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                Continuar a Documentos
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Document Requirements */}
        {activeStep === 2 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-6">Documentos Requeridos</h2>
            
            <div className="space-y-6">
              {/* Documentos Base - Sección informativa clara */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-blue-900">Documentos Base Obligatorios</h3>
                    <p className="text-sm text-blue-700">
                      Estos documentos son requeridos para todos los eventos y no pueden ser eliminados.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.requiredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center p-3 bg-white rounded-lg border border-blue-200">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        doc.type === 'RC' ? 'bg-red-100 text-red-800' :
                        doc.type === 'AP' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {doc.type}
                      </span>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-black">{doc.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {formData.requiresLiquorLicense && (
                <>
                  {/* Documentos para Venta de Licores - Sección informativa */}
                  <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"></path>
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-orange-900">Documentos para Venta de Licores</h3>
                        <p className="text-sm text-orange-700">
                          Se requieren documentos adicionales para autorizar la venta de bebidas alcohólicas.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documentTemplates.filter(doc => doc.type === 'ART').map((doc) => (
                        <div key={doc.id} className="p-4 bg-white rounded-lg border border-orange-200">
                          <div className="flex items-center mb-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              doc.type === 'RC' ? 'bg-red-100 text-red-800' :
                              doc.type === 'AP' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {doc.type}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-black mb-1">{doc.name}</h4>
                          <p className="text-xs text-gray-500">{doc.description}</p>
                          <button
                            onClick={() => addDocument(doc)}
                            className="mt-3 inline-flex items-center text-xs text-orange-600 hover:text-orange-800 font-medium"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Agregar documento
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Documentos Adicionales - Sección de selección */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-green-900">Documentos Adicionales Opcionales</h3>
                    <p className="text-sm text-green-700">
                      Selecciona documentos adicionales para mayor seguridad legal en tu evento.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentTemplates.filter(doc => !formData.requiredDocuments.some(req => req.type === doc.type)).map((doc) => (
                    <div key={doc.id} className="p-4 bg-white rounded-lg border border-green-200 hover:border-green-400 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              doc.type === 'RC' ? 'bg-red-100 text-red-800' :
                              doc.type === 'AP' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {doc.type}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-black mb-1">{doc.name}</h4>
                          <p className="text-xs text-gray-500">{doc.description}</p>
                        </div>
                        <button
                          onClick={() => addDocument(doc)}
                          className="ml-3 p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                          title="Agregar documento"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Botón outline para agregar documento personalizado */}
                  <div
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer bg-gray-50"
                    onClick={() => setIsAddDocumentModalOpen(true)}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                      </div>
                      <h4 className="text-sm font-medium text-gray-600 text-center">Agregar Documento Personalizado</h4>
                      <p className="text-xs text-gray-500 text-center mt-1">Crea un nuevo tipo de documento</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Additional Documents */}
              {formData.additionalDocuments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-black mb-4">Documentos Seleccionados</h3>
                  <div className="space-y-4">
                    {formData.additionalDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-start justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doc.type === 'RC' ? 'bg-red-100 text-red-800' :
                            doc.type === 'AP' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {doc.type}
                          </span>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-black">{doc.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          × Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                ← Anterior
              </button>
              <button
                onClick={handlePreview}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                Ver Vista Previa →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {activeStep === 3 && previewData && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-6">Vista Previa del Evento</h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-2xl font-bold text-black">{previewData.title}</h3>
                <p className="text-gray-600 mt-2">{previewData.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-black mb-2">Información del Evento</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Ubicación:</span> {previewData.location}</div>
                    <div><span className="text-gray-600">Capacidad:</span> {previewData.capacity} personas</div>
                    <div><span className="text-gray-600">Precio:</span> ${previewData.price}</div>
                    <div><span className="text-gray-600">Categoría:</span> {previewData.category}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-black mb-2">Fechas</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Inicio:</span> {new Date(previewData.startDate).toLocaleString()}</div>
                    <div><span className="text-gray-600">Fin:</span> {new Date(previewData.endDate).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-black mb-4">Documentos Requeridos</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Documentos Obligatorios</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {previewData.requiredDocuments.map((doc) => (
                        <li key={doc.id}>• {doc.name} ({doc.type})</li>
                      ))}
                    </ul>
                  </div>

                  {previewData.additionalDocuments.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">Documentos Adicionales</h5>
                      <ul className="text-sm text-green-800 space-y-1">
                        {previewData.additionalDocuments.map((doc) => (
                          <li key={doc.id}>• {doc.name} ({doc.type})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {previewData.requiresLiquorLicense && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-900 mb-2">⚠️ Venta de Licores</h4>
                  <p className="text-sm text-orange-700">
                    Este evento está autorizado para venta de bebidas alcohólicas. Se requerirán documentos adicionales durante el evento.
                  </p>
                </div>
              )}
            </div>

            {/* Modal para agregar documento personalizado */}
            <AddDocumentModal
              isOpen={isAddDocumentModalOpen}
              onClose={() => setIsAddDocumentModalOpen(false)}
              onAdd={handleAddCustomDocument}
            />

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                ← Editar
              </button>
              <div className="space-x-4">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Descartar
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                >
                  Crear Evento
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}