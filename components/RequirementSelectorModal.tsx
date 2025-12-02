'use client';

import React, { useState, useEffect } from 'react';
import { EventoRequisito, getEventRequirements, assignRequirementsToParticipant, getParticipantRequirements } from '@/lib/directus';

interface RequirementSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: string | number;
  onRequirementsAssigned: () => void;
}

interface EventoRequisitoWithSelection extends EventoRequisito {
  selected?: boolean;
  alreadyAssigned?: boolean;
}

export default function RequirementSelectorModal({
  isOpen,
  onClose,
  participantId,
  onRequirementsAssigned
}: RequirementSelectorModalProps) {
  const [requirements, setRequirements] = useState<EventoRequisitoWithSelection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchRequirements();
    }
  }, [isOpen, participantId]);

  const fetchRequirements = async () => {
    setIsLoading(true);
    try {
      // Obtener todos los requisitos disponibles (globales + específicos)
      const availableRequirements = await getEventRequirements();
      
      // Obtener requisitos ya asignados a este participante
      const assignedRequirements = await getParticipantRequirements(participantId);
      const assignedRequirementIds = assignedRequirements.map(pr => pr.evento_requisito_id.toString());
      
      // Combinar con información de selección
      const requirementsWithSelection = availableRequirements.map(req => ({
        ...req,
        selected: assignedRequirementIds.includes(req.id.toString()),
        alreadyAssigned: assignedRequirementIds.includes(req.id.toString())
      }));
      
      setRequirements(requirementsWithSelection);
      
      // Pre-seleccionar los ya asignados
      setSelectedRequirements(assignedRequirementIds);
      
    } catch (error) {
      console.error('Error fetching requirements:', error);
      alert('Error al cargar requisitos del evento');
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

  const handleAssignRequirements = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Obtener solo los nuevos requisitos a asignar
      const currentlyAssigned = requirements.filter(req => req.alreadyAssigned).map(req => req.id.toString());
      const newRequirementsToAssign = selectedRequirements.filter(id => !currentlyAssigned.includes(id));
      
      if (newRequirementsToAssign.length === 0) {
        alert('No hay nuevos requisitos para asignar');
        return;
      }

      await assignRequirementsToParticipant(participantId, newRequirementsToAssign);
      
      alert(`Se asignaron ${newRequirementsToAssign.length} requisito(s) al proveedor`);
      
      // Cerrar modal y notificar al componente padre
      onClose();
      onRequirementsAssigned();
      
    } catch (error) {
      console.error('Error assigning requirements:', error);
      alert('Error al asignar requisitos al proveedor');
    }
  };

  if (!isOpen) return null;

  const globalRequirements = requirements.filter(req => req.es_global);
  const eventSpecificRequirements = requirements.filter(req => !req.es_global);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">
              Gestionar Requisitos del Proveedor
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando requisitos...</p>
            </div>
          ) : (
            <form onSubmit={handleAssignRequirements} className="space-y-6">
              
              {/* Requisitos Globales */}
              {globalRequirements.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-black border-b pb-2 flex-1">
                      Requisitos Globales
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Aplican a todos los eventos
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {globalRequirements.map((req) => (
                      <div
                        key={req.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRequirements.includes(req.id.toString())
                            ? 'border-blue-500 bg-blue-50'
                            : req.alreadyAssigned
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => !req.alreadyAssigned && handleRequirementToggle(req.id.toString())}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <input
                              type="checkbox"
                              checked={selectedRequirements.includes(req.id.toString())}
                              onChange={() => !req.alreadyAssigned && handleRequirementToggle(req.id.toString())}
                              disabled={req.alreadyAssigned}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-black">
                                {req.nombre}
                                {req.alreadyAssigned && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Ya asignado
                                  </span>
                                )}
                              </h4>
                            </div>
                            {req.descripcion && (
                              <p className="text-sm text-gray-600 mt-1">{req.descripcion}</p>
                            )}
                            {req.detalle_clausulas && (
                              <p className="text-sm text-gray-500 mt-1 italic">{req.detalle_clausulas}</p>
                            )}
                            {req.suma_asegurada && (
                              <p className="text-xs text-blue-600 mt-1">
                                Suma asegurada: ${req.suma_asegurada.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requisitos Específicos del Evento */}
              {eventSpecificRequirements.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-black border-b pb-2 flex-1">
                      Requisitos Específicos del Evento
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      Solo para este evento
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {eventSpecificRequirements.map((req) => (
                      <div
                        key={req.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRequirements.includes(req.id.toString())
                            ? 'border-blue-500 bg-blue-50'
                            : req.alreadyAssigned
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => !req.alreadyAssigned && handleRequirementToggle(req.id.toString())}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <input
                              type="checkbox"
                              checked={selectedRequirements.includes(req.id.toString())}
                              onChange={() => !req.alreadyAssigned && handleRequirementToggle(req.id.toString())}
                              disabled={req.alreadyAssigned}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-black">
                                {req.nombre}
                                {req.alreadyAssigned && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Ya asignado
                                  </span>
                                )}
                              </h4>
                            </div>
                            {req.descripcion && (
                              <p className="text-sm text-gray-600 mt-1">{req.descripcion}</p>
                            )}
                            {req.detalle_clausulas && (
                              <p className="text-sm text-gray-500 mt-1 italic">{req.detalle_clausulas}</p>
                            )}
                            {req.suma_asegurada && (
                              <p className="text-xs text-blue-600 mt-1">
                                Suma asegurada: ${req.suma_asegurada.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {requirements.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay requisitos disponibles para este evento.</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || selectedRequirements.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Asignando...' : 'Asignar Requisitos'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}