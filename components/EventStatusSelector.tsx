'use client';

import React from 'react';
import { updateItem } from '@/lib/directus';

interface EventStatusSelectorProps {
  eventId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
  onRefresh?: () => void;
}

const statusOptions = [
  { value: 'draft', label: 'Borrador', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'published', label: 'Publicado', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  { value: 'completed', label: 'Completado', color: 'bg-blue-100 text-blue-800' },
];

export default function EventStatusSelector({ 
  eventId, 
  currentStatus, 
  onStatusChange, 
  onRefresh 
}: EventStatusSelectorProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    setIsLoading(true);
    try {
      console.log(`Updating event ${eventId} status to ${newStatus}`);
      await updateItem('eventos', eventId, { status: newStatus });
      
      setSelectedStatus(newStatus);
      onStatusChange?.(newStatus);
      onRefresh?.();
      
      alert(`Estado actualizado a: ${statusOptions.find(s => s.value === newStatus)?.label}`);
    } catch (error) {
      console.error('Error updating event status:', error);
      alert('Error al actualizar el estado del evento');
    } finally {
      setIsLoading(false);
    }
  };

  const currentStatusOption = statusOptions.find(s => s.value === currentStatus);

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-700">Estado:</span>
      
      {/* Estado actual */}
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatusOption?.color || 'bg-gray-100 text-gray-800'}`}>
        {currentStatusOption?.label || currentStatus}
      </span>
      
      {/* Selector de estado */}
      <select
        value={selectedStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isLoading}
        className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
      )}
    </div>
  );
}