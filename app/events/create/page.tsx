'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getEventRequirements, getGlobalRequirements, createGlobalRequirement, assignRequirementsToParticipant } from '@/lib/directus';
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

  const [selectedGlobalRequirements, setSelectedGlobalRequirements] = useState<string[]>([]);
  const [availableGlobalRequirements, setAvailableGlobalRequirements] = useState<any[]>([]);
  const [showCreateGlobalRequirement, setShowCreateGlobalRequirement] = useState(false);
  const [newRequirement, setNewRequirement] = useState({
    nombre: '',
    descripcion: '',
    detalle_clausulas: '',
    suma_asegurada: ''
  });

  // Load global requirements on component mount
  useEffect(() => {
    loadGlobalRequirements();
  }, []);

  const loadGlobalRequirements = async () => {
    try {
      const globalReqs = await getGlobalRequirements();
      setAvailableGlobalRequirements(globalReqs);
    } catch (error) {
      console.error('Error loading global requirements:', error);
    }
  };

  const handleCreateGlobalRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRequirement.nombre.trim()) {
      setDialogMessage('El nombre del requisito es obligatorio');
      setShowErrorDialog(true);
      return;
    }

    try {
      const createdRequirement = await createGlobalRequirement({
        nombre: newRequirement.nombre,
        descripcion: newRequirement.descripcion || undefined,
        detalle_clausulas: newRequirement.detalle_clausulas || undefined,
        suma_asegurada: newRequirement.suma_asegurada ? parseFloat(newRequirement.suma_asegurada) : undefined
      });

      // Add to available requirements and select it
      const newReq = createdRequirement.data;
      setAvailableGlobalRequirements(prev => [...prev, newReq]);
      setSelectedGlobalRequirements(prev => [...prev, newReq.id.toString()]);

      // Reset form
      setNewRequirement({
        nombre: '',
        descripcion: '',
        detalle_clausulas: '',
        suma_asegurada: ''
      });
      setShowCreateGlobalRequirement(false);

      setDialogMessage('¡Requisito global creado y seleccionado exitosamente!');
      setShowSuccessDialog(true);
      
    } catch (error) {
      console.error('Error creating global requirement:', error);
      setDialogMessage(`Error al crear requisito: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setShowErrorDialog(true);
    }
  };

  const toggleGlobalRequirement = (requirementId: string) => {
    setSelectedGlobalRequirements(prev => {
      if (prev.includes(requirementId)) {
        return prev.filter(id => id !== requirementId);
      } else {
        return [...prev, requirementId];
      }
    });
  };

  const updateFormData = (field: keyof EventData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate basic info before moving to confirmation
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.location) {
      setDialogMessage('Por favor completa todos los campos requeridos');
      setShowErrorDialog(true);
      return;
    }
    setActiveStep(2);
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
      // Fallback: redirect to events list
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

      const { createEvent, createEventParticipant } = await import('@/lib/directus');

      // Map form data to Directus schema - only send fields that exist
      const eventData = {
        title: formData.title,
        description: formData.description,
        start_date: formData.startDate,
        end_date: formData.endDate,
        location: formData.location,
        status: 'draft',
      };

      // Create the event
      const result = await createEvent(eventData);
      const createdEventId = result.id;

      // Store the created event ID
      setCreatedEventId(createdEventId);

      // If there are selected global requirements, create a temporary participant to hold them
      if (selectedGlobalRequirements.length > 0) {
        // Create a temporary participant entry for the event to hold global requirements
        const tempParticipant = await createEventParticipant({
          evento_id: createdEventId.toString(),
          proveedor_id: 'temp-global-requirements', // Temporary identifier
          status: 'pending'
        });

        // Assign global requirements to the event through the temporary participant
        await assignRequirementsToParticipant(tempParticipant.id, selectedGlobalRequirements);
      }

      // Show success dialog
      setDialogMessage(`¡Evento creado exitosamente! Se asignaron ${selectedGlobalRequirements.length} requisito(s) global(es).`);
      setShowSuccessDialog(true);
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
    { id: 1, name: 'Datos del Evento y Requisitos' },
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

        {/* Step 1: Event Data and Global Requirements */}
        {activeStep === 1 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-6">Datos del Evento y Requisitos Globales</h2>

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

            {/* Global Requirements Selection */}
            <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-semibold text-black mb-4">Requisitos Globales</h3>
              <p className="text-gray-600 mb-4">
                Selecciona los requisitos globales que aplicarán a este evento. Estos requisitos se aplicarán a todos los proveedores participantes.
              </p>

              {availableGlobalRequirements.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg mb-6">
                  <div className="text-4xl mb-2">🌐</div>
                  <p className="text-gray-600 mb-4">No hay requisitos globales disponibles</p>
                  <button
                    onClick={() => setShowCreateGlobalRequirement(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Crear Primer Requisito Global
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {availableGlobalRequirements.map((req) => (
                    <div
                      key={req.id}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedGlobalRequirements.includes(req.id.toString())
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleGlobalRequirement(req.id.toString())}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={selectedGlobalRequirements.includes(req.id.toString())}
                            onChange={() => toggleGlobalRequirement(req.id.toString())}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{req.nombre}</h4>
                          {req.descripcion && (
                            <p className="text-sm text-gray-600 mt-1">{req.descripcion}</p>
                          )}
                          {req.suma_asegurada && (
                            <p className="text-sm text-blue-600 mt-1">
                              💰 Suma asegurada: ${req.suma_asegurada.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create New Global Requirement */}
              {showCreateGlobalRequirement && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-green-800">Crear Nuevo Requisito Global</h4>
                    <button
                      onClick={() => setShowCreateGlobalRequirement(false)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleCreateGlobalRequirement} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Requisito *
                      </label>
                      <input
                        type="text"
                        required
                        value={newRequirement.nombre}
                        onChange={(e) => setNewRequirement(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ej: Seguro de Responsabilidad Civil"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={newRequirement.descripcion}
                        onChange={(e) => setNewRequirement(prev => ({ ...prev, descripcion: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
                        placeholder="Descripción detallada del requisito"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Suma Asegurada
                        </label>
                        <input
                          type="number"
                          value={newRequirement.suma_asegurada}
                          onChange={(e) => setNewRequirement(prev => ({ ...prev, suma_asegurada: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowCreateGlobalRequirement(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
                      >
                        Crear Requisito Global
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {!showCreateGlobalRequirement && availableGlobalRequirements.length > 0 && (
                <button
                  onClick={() => setShowCreateGlobalRequirement(true)}
                  className="w-full px-4 py-3 text-sm font-medium text-blue-600 border-2 border-blue-200 border-dashed rounded-lg hover:bg-blue-50 transition-colors"
                >
                  + Crear Nuevo Requisito Global
                </button>
              )}
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

              {/* Selected Global Requirements */}
              {selectedGlobalRequirements.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-black mb-4">Requisitos Globales Seleccionados</h3>
                  <div className="space-y-3">
                    {selectedGlobalRequirements.map((reqId) => {
                      const req = availableGlobalRequirements.find(r => r.id.toString() === reqId);
                      if (!req) return null;
                      
                      return (
                        <div key={req.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-900">{req.nombre}</h4>
                              {req.descripcion && (
                                <p className="text-sm text-blue-700 mt-1">{req.descripcion}</p>
                              )}
                              {req.suma_asegurada && (
                                <p className="text-sm text-blue-600 mt-1">
                                  💰 Suma asegurada: ${req.suma_asegurada.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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