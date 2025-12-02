'use client';

import { useState, useEffect } from 'react';
import {
  EventoRequisito,
  EventoParticipante,
  ParticipanteRequisito,
  getEventRequirements,
  getEventParticipants,
  getParticipantRequirements,
  assignRequirementsToParticipant,
  updateRequirementDocument,
  createItem,
  updateItem,
  deleteItem
} from '@/lib/directus';

interface RequirementsManagerProps {
  eventId: string | number;
  onUpdate?: () => void;
}

interface ParticipantWithRequirements extends EventoParticipante {
  requisitos?: (ParticipanteRequisito & { evento_requisito?: EventoRequisito })[];
  completionPercentage?: number;
}

export default function RequirementsManager({ eventId, onUpdate }: RequirementsManagerProps) {
  const [requirements, setRequirements] = useState<EventoRequisito[]>([]);
  const [participants, setParticipants] = useState<ParticipantWithRequirements[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'manage' | 'compliance' | 'reports'>('overview');
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantWithRequirements | null>(null);
  const [isCreatingRequirement, setIsCreatingRequirement] = useState(false);
  const [newRequirement, setNewRequirement] = useState({
    nombre: '',
    descripcion: '',
    detalle_clausulas: '',
    suma_asegurada: '',
    es_global: false
  });

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load requirements and participants in parallel
      const [requirementsData, participantsData] = await Promise.all([
        getEventRequirements(eventId),
        getEventParticipants(eventId)
      ]);

      setRequirements(requirementsData);

      // Load requirements for each participant
      const participantsWithRequirements = await Promise.all(
        participantsData.map(async (participant) => {
          const participantRequirements = await getParticipantRequirements(participant.id);
          return {
            ...participant,
            requisitos: participantRequirements
          };
        })
      );

      // Calculate completion percentages
      const participantsWithCompletion = participantsWithRequirements.map(participant => {
        const totalRequirements = participant.requisitos?.length || 0;
        const completedRequirements = participant.requisitos?.filter(pr => pr.estado === 'aprobado').length || 0;
        const completionPercentage = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;
        
        return {
          ...participant,
          completionPercentage
        };
      });

      setParticipants(participantsWithCompletion);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar datos de requisitos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requirementData = {
        nombre: newRequirement.nombre,
        descripcion: newRequirement.descripcion,
        detalle_clausulas: newRequirement.detalle_clausulas,
        suma_asegurada: newRequirement.suma_asegurada ? parseFloat(newRequirement.suma_asegurada) : null,
        es_global: newRequirement.es_global,
        evento_id: newRequirement.es_global ? null : eventId,
        status: 'active'
      };

      await createItem('eventos_requisitos', requirementData);
      
      setNewRequirement({
        nombre: '',
        descripcion: '',
        detalle_clausulas: '',
        suma_asegurada: '',
        es_global: false
      });
      setIsCreatingRequirement(false);
      loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error creating requirement:', error);
      alert('Error al crear requisito');
    }
  };

  const handleUpdateRequirementStatus = async (participantRequirementId: string | number, newStatus: 'pendiente' | 'aprobado' | 'rechazado') => {
    try {
      await updateRequirementDocument(participantRequirementId, {
        estado: newStatus
      });
      loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating requirement status:', error);
      alert('Error al actualizar estado del requisito');
    }
  };

  const getRequirementsOverview = () => {
    const globalRequirements = requirements.filter(req => req.es_global);
    const eventSpecificRequirements = requirements.filter(req => !req.es_global);
    
    return {
      total: requirements.length,
      global: globalRequirements.length,
      eventSpecific: eventSpecificRequirements.length,
      assigned: participants.reduce((total, p) => total + (p.requisitos?.length || 0), 0),
      completed: participants.reduce((total, p) => total + (p.requisitos?.filter(pr => pr.estado === 'aprobado').length || 0), 0)
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprobado': return 'text-green-600 bg-green-100';
      case 'pendiente': return 'text-yellow-600 bg-yellow-100';
      case 'rechazado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprobado': return '✅';
      case 'pendiente': return '⏳';
      case 'rechazado': return '❌';
      default: return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando requisitos...</p>
      </div>
    );
  }

  const overview = getRequirementsOverview();

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Gestión de Requisitos</h2>
          <button
            onClick={() => setIsCreatingRequirement(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            + Crear Requisito
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 border-b">
          {[
            { key: 'overview', label: 'Resumen', icon: '📊' },
            { key: 'manage', label: 'Gestionar', icon: '⚙️' },
            { key: 'compliance', label: 'Cumplimiento', icon: '📋' },
            { key: 'reports', label: 'Reportes', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">📋</div>
                  <div>
                    <p className="text-sm text-blue-600">Total Requisitos</p>
                    <p className="text-2xl font-bold text-blue-800">{overview.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🌐</div>
                  <div>
                    <p className="text-sm text-green-600">Globales</p>
                    <p className="text-2xl font-bold text-green-800">{overview.global}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🎯</div>
                  <div>
                    <p className="text-sm text-purple-600">Específicos</p>
                    <p className="text-2xl font-bold text-purple-800">{overview.eventSpecific}</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">✅</div>
                  <div>
                    <p className="text-sm text-orange-600">Cumplidos</p>
                    <p className="text-2xl font-bold text-orange-800">{overview.completed}/{overview.assigned}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants Progress */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Progreso por Participante</h3>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-black">
                          {participant.proveedor?.nombre || `Participante ${participant.id}`}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {participant.requisitos?.length || 0} requisitos asignados
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-black">
                          {participant.completionPercentage}%
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${participant.completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="space-y-6">
            {/* Requirements List */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Requisitos del Evento</h3>
              
              {/* Global Requirements */}
              {requirements.filter(req => req.es_global).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                    <span className="mr-2">🌐</span>
                    Requisitos Globales
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Aplican a todos los eventos
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {requirements.filter(req => req.es_global).map((req) => (
                      <div key={req.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-black">{req.nombre}</h5>
                            {req.descripcion && (
                              <p className="text-sm text-gray-600 mt-1">{req.descripcion}</p>
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
              {requirements.filter(req => !req.es_global).length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                    <span className="mr-2">🎯</span>
                    Requisitos Específicos del Evento
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      Solo para este evento
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {requirements.filter(req => !req.es_global).map((req) => (
                      <div key={req.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-black">{req.nombre}</h5>
                            {req.descripcion && (
                              <p className="text-sm text-gray-600 mt-1">{req.descripcion}</p>
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
            </div>

            {/* Participant Requirements Assignment */}
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Asignación a Participantes</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {participants.map((participant) => (
                  <div key={participant.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-black">
                        {participant.proveedor?.nombre || `Participante ${participant.id}`}
                      </h4>
                      <span className="text-sm text-gray-600">
                        {participant.requisitos?.length || 0} requisitos
                      </span>
                    </div>
                    
                    {participant.requisitos && participant.requisitos.length > 0 ? (
                      <div className="space-y-2">
                        {participant.requisitos.slice(0, 3).map((pr) => (
                          <div key={pr.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">
                              {pr.evento_requisito?.nombre}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(pr.estado)}`}>
                              {getStatusIcon(pr.estado)} {pr.estado}
                            </span>
                          </div>
                        ))}
                        {participant.requisitos.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{participant.requisitos.length - 3} más...
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No hay requisitos asignados</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-black mb-4">Estado de Cumplimiento</h3>
              
              {/* Participant Selector */}
              <div className="mb-6">
                <select
                  value={selectedParticipant?.id || ''}
                  onChange={(e) => {
                    const participant = participants.find(p => p.id.toString() === e.target.value);
                    setSelectedParticipant(participant || null);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar participante...</option>
                  {participants.map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      {participant.proveedor?.nombre || `Participante ${participant.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedParticipant && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-medium text-black">
                      {selectedParticipant.proveedor?.nombre || `Participante ${selectedParticipant.id}`}
                    </h4>
                    <div className="text-right">
                      <div className="text-lg font-bold text-black">
                        {selectedParticipant.completionPercentage}%
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedParticipant.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedParticipant.requisitos?.map((participantRequirement) => (
                      <div key={participantRequirement.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-black">
                              {participantRequirement.evento_requisito?.nombre}
                            </h5>
                            {participantRequirement.evento_requisito?.descripcion && (
                              <p className="text-sm text-gray-600 mt-1">
                                {participantRequirement.evento_requisito.descripcion}
                              </p>
                            )}
                            {participantRequirement.notas_revision && (
                              <p className="text-sm text-gray-500 mt-1 italic">
                                Notas: {participantRequirement.notas_revision}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <select
                              value={participantRequirement.estado}
                              onChange={(e) => handleUpdateRequirementStatus(
                                participantRequirement.id,
                                e.target.value as 'pendiente' | 'aprobado' | 'rechazado'
                              )}
                              className={`text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${getStatusColor(participantRequirement.estado)}`}
                            >
                              <option value="pendiente">⏳ Pendiente</option>
                              <option value="aprobado">✅ Aprobado</option>
                              <option value="rechazado">❌ Rechazado</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-black mb-4">Reportes y Análisis</h3>
            
            {/* Completion Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-800">
                  {participants.filter(p => p.completionPercentage === 100).length}
                </div>
                <div className="text-sm text-green-600">Participantes Completos</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-800">
                  {participants.filter(p => p.completionPercentage && p.completionPercentage > 0 && p.completionPercentage < 100).length}
                </div>
                <div className="text-sm text-yellow-600">En Progreso</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-800">
                  {participants.filter(p => p.completionPercentage === 0).length}
                </div>
                <div className="text-sm text-red-600">Sin Iniciar</div>
              </div>
            </div>

            {/* Detailed Report */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-black mb-4">Reporte Detallado</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Requisitos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completados
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progreso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((participant) => (
                      <tr key={participant.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {participant.proveedor?.nombre || `Participante ${participant.id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {participant.requisitos?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {participant.requisitos?.filter(pr => pr.estado === 'aprobado').length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${participant.completionPercentage}%` }}
                              ></div>
                            </div>
                            {participant.completionPercentage}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            participant.completionPercentage === 100
                              ? 'bg-green-100 text-green-800'
                              : participant.completionPercentage && participant.completionPercentage > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {participant.completionPercentage === 100
                              ? '✅ Completo'
                              : participant.completionPercentage && participant.completionPercentage > 0
                              ? '⏳ En Progreso'
                              : '❌ Sin Iniciar'
                            }
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Requirement Modal */}
      {isCreatingRequirement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-black">Crear Nuevo Requisito</h3>
                <button
                  onClick={() => setIsCreatingRequirement(false)}
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
                    value={newRequirement.nombre}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                    placeholder="Descripción detallada del requisito"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detalle de Cláusulas
                  </label>
                  <textarea
                    value={newRequirement.detalle_clausulas}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, detalle_clausulas: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                    placeholder="Detalles específicos de las cláusulas"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="es_global"
                    checked={newRequirement.es_global}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, es_global: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="es_global" className="ml-2 text-sm text-gray-700">
                    <strong>Requisito Global</strong> - Aplica a todos los eventos
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsCreatingRequirement(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Crear Requisito
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}