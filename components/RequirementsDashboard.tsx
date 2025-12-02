'use client';

import { useState } from 'react';
import RequirementsManager from './RequirementsManager';
import RequirementAssignmentModal from './RequirementAssignmentModal';
import { useAuth } from '@/contexts/AuthContext';

interface RequirementsDashboardProps {
  eventId: string | number;
  participants?: any[];
  onUpdate?: () => void;
}

export default function RequirementsDashboard({ eventId, participants = [], onUpdate }: RequirementsDashboardProps) {
  const { user } = useAuth();
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | number | null>(null);

  const handleAssignRequirements = (participantId?: string | number) => {
    if (participantId) {
      setSelectedParticipant(participantId);
    } else {
      setSelectedParticipant(null);
    }
    setShowAssignmentModal(true);
  };

  const handleRequirementsAssigned = () => {
    onUpdate?.();
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Gestión de Requisitos</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => handleAssignRequirements()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              + Asignar Requisitos
            </button>
          </div>
        </div>

        {/* Participant Requirements Quick View */}
        {participants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.slice(0, 6).map((participant) => (
              <div key={participant.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-black">
                      {participant.proveedor?.nombre || `Participante ${participant.id}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {participant.requisitos?.length || 0} requisitos
                    </p>
                  </div>
                  <button
                    onClick={() => handleAssignRequirements(participant.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Gestionar
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${participant.completionPercentage || 0}%`
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {participant.completionPercentage || 0}% completado
                </div>

                {/* Quick Status */}
                {participant.requisitos && participant.requisitos.length > 0 && (
                  <div className="mt-2 flex space-x-1">
                    {participant.requisitos.slice(0, 3).map((req: any) => (
                      <span
                        key={req.id}
                        className={`inline-block w-2 h-2 rounded-full ${
                          req.estado === 'aprobado' ? 'bg-green-500' :
                          req.estado === 'pendiente' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                      />
                    ))}
                    {participant.requisitos.length > 3 && (
                      <span className="text-xs text-gray-400">+{participant.requisitos.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {participants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">👥</div>
            <p>No hay participantes registrados para este evento</p>
            <p className="text-sm">Los requisitos se pueden asignar una vez que se agreguen participantes</p>
          </div>
        )}
      </div>

      {/* Full Requirements Management */}
      <RequirementsManager 
        eventId={eventId} 
        onUpdate={onUpdate}
      />

      {/* Requirement Assignment Modal */}
      <RequirementAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        eventId={eventId}
        participantId={selectedParticipant || undefined}
        onRequirementsAssigned={handleRequirementsAssigned}
      />
    </div>
  );
}