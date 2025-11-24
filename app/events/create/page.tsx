'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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
}

export default function CreateEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  });

  const updateFormData = (field: keyof EventData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep === 1) {
      // Validate basic info before moving to preview
      if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.location) {
        alert('Por favor completa todos los campos requeridos');
        return;
      }
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const { createEvent } = await import('@/lib/directus');

      // Map form data to Directus schema - only send fields that exist
      const eventData = {
        name: formData.title,
        description: formData.description,
        start_date: formData.startDate,
        end_date: formData.endDate,
        location: formData.location,
        capacity: formData.capacity,
        price: formData.price,
        requires_liquor_license: formData.requiresLiquorLicense,
        status: 'draft',
      };

      const result = await createEvent(eventData);

      // Show success message
      alert('¡Evento creado exitosamente!');

      // Redirect to events list
      router.push(`/events`);
    } catch (error) {
      console.error('Error creating event:', error);
      alert(`Error al crear el evento: ${error instanceof Error ? error.message : 'Por favor intenta nuevamente.'}`);
    } finally {
      setIsSubmitting(false);
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

  const steps = [
    { id: 1, name: 'Información Básica' },
    { id: 2, name: 'Confirmar' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black mb-2 inline-block">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-black">Crear Nuevo Evento</h1>
          <p className="mt-2 text-gray-600">Complete la información para crear su evento</p>
        </div>

        {/* Progress Steps */}
        <nav aria-label="Progress" className="mb-8">
          <ol className="flex items-center">
            {steps.map((step, index) => (
              <li key={step.id} className="flex items-center">
                <div className={`flex items-center ${activeStep >= step.id ? 'text-black' : 'text-gray-400'}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${activeStep >= step.id ? 'border-black bg-black text-white' : 'border-gray-300'
                    }`}>
                    {step.id}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${activeStep >= step.id ? 'text-black' : 'text-gray-500'}`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`ml-4 sm:ml-8 h-0.5 w-8 sm:w-16 ${activeStep > step.id ? 'bg-black' : 'bg-gray-200'}`}></div>
                  )}
                </div>
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
                  onChange={(e) => updateFormData('title', e.target.value)}
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
                  onChange={(e) => updateFormData('description', e.target.value)}
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
                    onChange={(e) => updateFormData('startDate', e.target.value)}
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
                    onChange={(e) => updateFormData('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Ej: Centro de Convenciones, Sala A"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => updateFormData('capacity', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFormData('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="conferencia">Conferencia</option>
                  <option value="taller">Taller</option>
                  <option value="networking">Networking</option>
                  <option value="social">Social</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="liquorLicense"
                  checked={formData.requiresLiquorLicense}
                  onChange={(e) => updateFormData('requiresLiquorLicense', e.target.checked)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="liquorLicense" className="ml-2 block text-sm text-gray-700">
                  Requiere licencia de licor
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview and Submit */}
        {activeStep === 2 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-6">Confirmar Información</h2>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-sm font-medium text-gray-500">Título</h3>
                <p className="mt-1 text-lg text-black">{formData.title}</p>
              </div>

              <div className="border-b pb-4">
                <h3 className="text-sm font-medium text-gray-500">Descripción</h3>
                <p className="mt-1 text-black">{formData.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de Inicio</h3>
                  <p className="mt-1 text-black">{new Date(formData.startDate).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de Fin</h3>
                  <p className="mt-1 text-black">{new Date(formData.endDate).toLocaleString()}</p>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="text-sm font-medium text-gray-500">Ubicación</h3>
                <p className="mt-1 text-black">{formData.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Capacidad</h3>
                  <p className="mt-1 text-black">{formData.capacity} personas</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Precio</h3>
                  <p className="mt-1 text-black">${formData.price}</p>
                </div>
              </div>

              {formData.category && (
                <div className="border-b pb-4">
                  <h3 className="text-sm font-medium text-gray-500">Categoría</h3>
                  <p className="mt-1 text-black capitalize">{formData.category}</p>
                </div>
              )}

              <div className="border-b pb-4">
                <h3 className="text-sm font-medium text-gray-500">Licencia de Licor</h3>
                <p className="mt-1 text-black">{formData.requiresLiquorLicense ? 'Sí' : 'No'}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
              >
                Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creando evento...' : 'Crear Evento'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}