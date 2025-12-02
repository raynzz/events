'use client';

import React, { useState, useEffect } from 'react';
import { EventoRequisito, getGlobalRequirements, createGlobalRequirement } from '@/lib/directus';
import HeroDialog from '@/components/ui/hero-dialog';

interface GlobalRequirementsSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | number;
  onRequirementsSelected: (requirements: EventoRequisito[]) => void;
}

interface EventoRequisitoWithSelection extends EventoRequisito {
  selected?: boolean;
}

export default function GlobalRequirementsSelector({
  isOpen,
  onClose,
  eventId,
  onRequirementsSelected
}: GlobalRequirementsSelectorProps) {
  const [requirements, setRequirements] = useState<EventoRequisitoWithSelection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  
  const [newRequirement, setNewRequirement] = useState({
    Nombre: '', // ← Campo correcto con mayúscula
    descripcion: '',
    detalle: '', // ← Campo correcto
    suma_asegurada: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchGlobalRequirements();
    }
  }, [isOpen]);

  const fetchGlobalRequirements = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Iniciando carga de requisitos globales...');
      const globalRequirements = await getGlobalRequirements();
      console.log('📋 Requisitos globales obtenidos:', globalRequirements);
      
      setRequirements(globalRequirements.map(req => ({ ...req, selected: false })));
      setSelectedRequirements([]);
      
      if (globalRequirements.length === 0) {
        console.log('⚠️ No se encontraron requisitos globales en la base de datos');
        setDialogMessage('No se encontraron requisitos globales. Puedes crear uno nuevo.');
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('❌ Error fetching global requirements:', error);
      setDialogMessage(`Error al cargar requisitos globales: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequirementToggle = (requirementId: string) => {
    setSelectedRequirements(prev => {
      if (prev.includes(requirementId)) {
        return prev.filter(id => id !== requirementId);
      } else {
        return [...prev, requirementId];
      }
    });
  };

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRequirement.Nombre.trim()) { // ← Campo correcto con mayúscula
      setDialogMessage('El nombre del requisito es obligatorio');
      setShowErrorDialog(true);
      return;
    }

    try {
      setIsLoading(true);
      
      const createdRequirement = await createGlobalRequirement({
        Nombre: newRequirement.Nombre, // ← Campo correcto con mayúscula
        descripcion: newRequirement.descripcion || undefined,
        detalle: newRequirement.detalle || undefined, // ← Campo correcto
        suma_asegurada: newRequirement.suma_asegurada ? parseFloat(newRequirement.suma_asegurada) : undefined
      });

      // Agregar el nuevo requisito a la lista y seleccionarlo
      const newReqWithSelection = { 
        ...createdRequirement.data, 
        selected: true 
      };
      setRequirements(prev => [...prev, newReqWithSelection]);
      setSelectedRequirements(prev => [...prev, createdRequirement.data.id.toString()]);

      // Reset form
      setNewRequirement({
        Nombre: '', // ← Campo correcto con mayúscula
        descripcion: '',
        detalle: '', // ← Campo correcto
        suma_asegurada: ''
      });
      setShowCreateForm(false);

      setDialogMessage('¡Requisito global creado y seleccionado exitosamente!');
      setShowSuccessDialog(true);
      
    } catch (error) {
      console.error('Error creating global requirement:', error);
      setDialogMessage(`Error al crear requisito: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSelection = () => {
    const selectedReqs = requirements.filter(req => selectedRequirements.includes(req.id.toString()));
    onRequirementsSelected(selectedReqs);
    
    setDialogMessage(`Se asignaron ${selectedReqs.length} requisito(s) global(es) al evento`);
    setShowSuccessDialog(true);
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    if (showCreateForm) {
      setShowCreateForm(false);
    } else {
      onClose();
    }
  };

  if (!isOpen && !showSuccessDialog && !showErrorDialog) return null;

  return (
    <>
      {/* Main Modal */}
      <div 
        className={`fixed inset-0 z-40 flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backdropFilter: 'blur(4px)' }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={isOpen ? onClose : undefined}
        />
        
        {/* Dialog */}
        <div className={`
          relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto
          transform transition-all duration-300 ease-out
          ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}
        `}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-6 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-full flex items-center justify-center text-2xl">
                🌐
              </div>
              <div>
                <h2 className="text-2xl font-bold">Requisitos Globales del Evento</h2>
                <p className="text-blue-100 mt-1">Selecciona los requisitos que aplicarán a todos los proveedores</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando requisitos globales...</p>
              </div>
            ) : showCreateForm ? (
              /* Create Requirement Form */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Crear Nuevo Requisito Global</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreateRequirement} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Requisito *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRequirement.Nombre} // ← Campo correcto con mayúscula
                      onChange={(e) => setNewRequirement(prev => ({ ...prev, Nombre: e.target.value }))} // ← Campo correcto
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                      placeholder="Descripción detallada del requisito"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detalle
                    </label>
                    <textarea
                      value={newRequirement.detalle} // ← Campo correcto
                      onChange={(e) => setNewRequirement(prev => ({ ...prev, detalle: e.target.value }))} // ← Campo correcto
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                      placeholder="Detalles específicos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suma Asegurada
                    </label>
                    <input
                      type="number"
                      value={newRequirement.suma_asegurada}
                      onChange={(e) => setNewRequirement(prev => ({ ...prev, suma_asegurada: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                    >
                      {isLoading ? 'Creando...' : 'Crear Requisito Global'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Requirements List */
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Requisitos Globales Disponibles</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {requirements.length} requisitos globales encontrados
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
                  >
                    + Crear Requisito Global
                  </button>
                </div>

                {requirements.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">📝</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No hay requisitos globales</h4>
                    <p className="text-gray-600 mb-4">Crea el primer requisito global para comenzar</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Crear Primer Requisito
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requirements.map((req) => (
                      <div
                        key={req.id}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedRequirements.includes(req.id.toString())
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => handleRequirementToggle(req.id.toString())}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <input
                              type="checkbox"
                              checked={selectedRequirements.includes(req.id.toString())}
                              onChange={() => handleRequirementToggle(req.id.toString())}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{req.Nombre}</h4> {/* ← Campo correcto con mayúscula */}
                            {req.descripcion && (
                              <p className="text-sm text-gray-600 mt-1">{req.descripcion}</p>
                            )}
                            {req.detalle && ( /* ← Campo correcto */
                              <p className="text-sm text-gray-500 mt-1 italic">{req.detalle}</p>
                            )}
                            {req.suma_asegurada && (
                              <p className="text-sm text-blue-600 mt-1 font-medium">
                                💰 Suma asegurada: ${req.suma_asegurada.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!showCreateForm && requirements.length > 0 && (
            <div className="px-6 pb-6 border-t bg-gray-50 rounded-b-2xl">
              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-gray-600">
                  {selectedRequirements.length} requisito(s) seleccionado(s)
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmSelection}
                    disabled={selectedRequirements.length === 0}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                  >
                    Confirmar Selección ({selectedRequirements.length})
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <HeroDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title="¡Éxito!"
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
    </>
  );
}