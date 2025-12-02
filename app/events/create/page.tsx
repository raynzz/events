'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getEventRequirements } from '@/lib/directus';
import RequirementSelectorModal from '@/components/RequirementSelectorModal';
import GlobalRequirementsSelector from '@/components/GlobalRequirementsSelector';
import HeroDialog from '@/components/ui/hero-dialog';

interface EventData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
}

interface GlobalRequirement {
  id: number;
  nombre: string;
  descripcion?: string;
}

export default function CreateEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | number | null>(null);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [showGlobalRequirementsSelector, setShowGlobalRequirementsSelector] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const [formData, setFormData] = useState<EventData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
  });

  const updateFormData = (field: keyof EventData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep === 1) {
      // Validate basic info before moving to preview
      if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.location) {
        setDialogMessage('Por favor completa todos los campos requeridos');
        setShowErrorDialog(true);
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      // Move to requirements step
      setActiveStep(3);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleGlobalRequirementsSelected = (requirements: any[]) => {
    // Close the global requirements selector
    setShowGlobalRequirementsSelector(false);
    
    // Show success dialog with event completion
    setDialogMessage(`¡Evento creado exitosamente! Se asignaron ${requirements.length} requisito(s) global(es).`);
    setShowSuccessDialog(true);
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // Redirect to event detail page
    if (createdEventId) {
      router.push(`/events/${createdEventId}/dashboard`);
    } else {
      router.push('/events');
    }
  };

  const handleRequirementsModalClose = () => {
    setShowRequirementsModal(false);
  };

  const handleRequirementsAssigned = () => {
    // Requirements assigned successfully, close modal
    handleRequirementsModalClose();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const { createEvent } = await import('@/lib/directus');

      // Map form data to Directus schema - only send fields that exist
      const eventData = {
        title: formData.title,
        description: formData.description,
        start_date: formData.startDate,
        end_date: formData.endDate,
        location: formData.location,
        status: 'draft',
      };

      const result = await createEvent(eventData);

      // Store the created event ID
      setCreatedEventId(result.id);

      // Open global requirements selector
      setShowGlobalRequirementsSelector(true);
    } catch (error) {
      console.error('Error creating event:', error);
      setDialogMessage(`Error al crear el evento: ${error instanceof Error ? error.message : 'Por favor intenta nuevamente.'}`);
      setShowErrorDialog(true);
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
    { id: 3, name: 'Requisitos Globales' },
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
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {activeStep === 2 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-6">Confirmar Información del Evento</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Título</p>
                <p className="mt-1 text-black font-medium">{formData.title}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Descripción</p>
                <p className="mt-1 text-black">{formData.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha de Inicio</p>
                  <p className="mt-1 text-black">{new Date(formData.startDate).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Fecha de Fin</p>
                  <p className="mt-1 text-black">{new Date(formData.endDate).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Ubicación</p>
                <p className="mt-1 text-black">{formData.location}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
              >
                Volver
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creando...' : 'Crear Evento'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Global Requirements */}
        {activeStep === 3 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-6">Requisitos Globales del Evento</h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Ahora puede seleccionar los requisitos globales que aplicarán a este evento. 
                Estos requisitos se aplicarán a todos los proveedores participantes.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Puede modificar estos requisitos más adelante desde el panel de gestión del evento.
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
              >
                Volver
              </button>
              <button
                onClick={() => setShowGlobalRequirementsSelector(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Gestionar Requisitos Globales
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Requirements Selector Modal */}
      {createdEventId && (
        <RequirementSelectorModal
          isOpen={showRequirementsModal}
          onClose={handleRequirementsModalClose}
          participantId={createdEventId}
          onRequirementsAssigned={handleRequirementsAssigned}
        />
      )}

      {/* Global Requirements Selector */}
      {createdEventId && (
        <GlobalRequirementsSelector
          isOpen={showGlobalRequirementsSelector}
          onClose={() => setShowGlobalRequirementsSelector(false)}
          eventId={createdEventId}
          onRequirementsSelected={handleGlobalRequirementsSelected}
        />
      )}

      {/* Success Dialog */}
      <HeroDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title="¡Evento Creado!"
        description={dialogMessage}
        type="success"
      />

      {/* Error Dialog */}
      <HeroDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Error"
        description={dialogMessage}
        type="error"
      />
    </div>
  );
}