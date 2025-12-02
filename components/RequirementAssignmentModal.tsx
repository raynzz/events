'use client';

import { useState, useEffect } from 'react';
import {
  EventoRequisito,
  EventoParticipante,
  getEventRequirements,
  getEventParticipants,
  getParticipantRequirements,
  assignRequirementsToParticipant
} from '@/lib/directus';

interface RequirementAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | number;
  participantId?: string | number;
  onRequirementsAssigned?: () => void;
}

interface ParticipantWithRequirements extends EventoParticipante {
  requisitos?: any[];
  completionPercentage?: number;
}

export default function RequirementAssignmentModal({
  isOpen,
  onClose,
  eventId,
  participantId,
  onRequirementsAssigned
}: RequirementAssignmentModalProps) {
  const [requirements, setRequirements] = useState<EventoRequisito[]>([]);
  const [participants, setParticipants] = useState<ParticipantWithRequirements[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string | number>(participantId || '');
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, eventId]);

  useEffect(() => {
    if (selectedParticipant) {
      loadParticipantRequirements(selectedParticipant);
    }
  }, [selectedParticipant]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [requirementsData, participantsData] = await Promise.all([
        getEventRequirements(eventId),
        getEventParticipants(eventId)
      ]);

      setRequirements(requirementsData);
      setParticipants(participantsData);

      if (participantId) {
        setSelectedParticipant(participantId);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadParticipantRequirements = async (participantId: string | number) => {
    try {
      const participantRequirements = await getParticipantRequirements(participantId);
      const requirementIds = participantRequirements.map(pr => pr.evento_requisito_id.toString());
      setSelectedRequirements(requirementIds);
    } catch (error) {
      console.error('Error loading participant requirements:', error);
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
    
    if (!selectedParticipant) {
      alert('Por favor selecciona un participante');
      return;
    }

    if (selectedRequirements.length === 0) {
      alert('Por favor selecciona al menos un requisito');
      return;
    }

    try {
      setIsLoading(true);
      await assignRequirementsToParticipant(selectedParticipant, selectedRequirements);
      alert(`Se asignaron ${selectedRequirements.length} requisito(s) al participante`);
      
      onClose();
      onRequirementsAssigned?.();
    } catch (error) {
      console.error('Error assigning requirements:', error);
      alert('Error al asignar requisitos');
    } finally {
      setIsLoading(false);
    }
  };

  const getParticipantById = (id: string | number) => {
    return participants.find(p => p.id.toString() === id.toString());
  };

  const getRequirementsByType = () => {
    const global = requirements.filter(req => req.es_global);
    const eventSpecific = requirements.filter(req => !req.es_global);
    return { global, eventSpecific };
  };

  if (!isOpen) return null;

  const { global, eventSpecific } = getRequirementsByType();
  const currentParticipant = getParticipantById(selectedParticipant);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Asignar Requisitos a Participantes</h2>
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
              <p className="mt-2 text-gray-600">Cargando...</p>
            </div>
          ) : (
            <form onSubmit={handleAssignRequirements} className="space-y-6">
              
              {/* Participant Selection */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-black mb-3">Seleccionar Participante</h3>
                <select
                  value={selectedParticipant}
                  onChange={(e) => setSelectedParticipant(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar participante...</option>
                  {participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      {participant.proveedor?.nombre || `Participante ${participant.id}`}
                    </option>
                  ))}
                </select>

                {currentParticipant && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-sm text-gray-600">
                      <strong>Ya tiene asignados:</strong> {currentParticipant.requisitos?.length || 0} requisitos
                    </p>
                  </div>
                )}
              </div>

              {/* Global Requirements */}
              {global.length > 0 && (
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
                    {global.map((req) => (
                      <div
                        key={req.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRequirements.includes(req.id.toString())
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleRequirementToggle(req.id.toString())}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <input
                              type="checkbox"
                              checked={selectedRequirements.includes(req.id.toString())}
                              onChange={() => handleRequirementToggle(req.id.toString())}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-black">{req.nombre}</h4>
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

              {/* Event Specific Requirements */}
              {eventSpecific.length > 0 && (
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
                    {eventSpecific.map((req) => (
                      <div
                        key={req.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRequirements.includes(req.id.toString())
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleRequirementToggle(req.id.toString())}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <input
                              type="checkbox"
                              checked={selectedRequirements.includes(req.id.toString())}
                              onChange={() => handleRequirementToggle(req.id.toString())}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-black">{req.nombre}</h4>
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

              {/* Summary */}
              {selectedRequirements.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Requisitos Seleccionados ({selectedRequirements.length})
                  </h4>
                  <div className="text-sm text-blue-700">
                    {selectedRequirements.map(reqId => {
                      const req = requirements.find(r => r.id.toString() === reqId);
                      return req ? (
                        <div key={reqId} className="flex items-center space-x-2">
                          <span>{req.es_global ? '🌐' : '🎯'}</span>
                          <span>{req.nombre}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
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
                  disabled={isLoading || !selectedParticipant || selectedRequirements.length === 0}
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