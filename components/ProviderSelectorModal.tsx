'use client';

import React, { useState, useEffect } from 'react';
import { Proveedor, getAllProviders, createEventParticipant } from '@/lib/directus';

interface ProviderSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | number;
  onProviderAssigned: () => void;
}

export default function ProviderSelectorModal({
  isOpen,
  onClose,
  eventId,
  onProviderAssigned
}: ProviderSelectorModalProps) {
  const [providers, setProviders] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const data = await getAllProviders();
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      alert('Error al cargar proveedores del catálogo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProviderId) {
      alert('Debe seleccionar un proveedor');
      return;
    }

    try {
      await createEventParticipant({
        evento_id: eventId,
        proveedor_id: parseInt(selectedProviderId),
        status,
        notas: notas || undefined
      });

      alert('Proveedor asignado exitosamente al evento');
      
      setSelectedProviderId('');
      setStatus('pending');
      setNotas('');
      
      onClose();
      onProviderAssigned();
      
    } catch (error) {
      console.error('Error assigning provider:', error);
      alert('Error al asignar proveedor al evento');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Asignar Proveedor al Evento
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

          <form onSubmit={handleAssignProvider} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Proveedor del Catálogo *
              </label>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando proveedores...</p>
                </div>
              ) : (
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Seleccionar proveedor --</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.nombre} {provider.rubro && `(${provider.rubro})`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pending' | 'approved' | 'rejected')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (Opcional)
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notas adicionales sobre la asignación..."
              />
            </div>

            {selectedProviderId && (() => {
              const selectedProvider = providers.find(p => p.id.toString() === selectedProviderId);
              return selectedProvider ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Información del Proveedor</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Nombre:</strong> {selectedProvider.nombre}</p>
                    {selectedProvider.rubro && <p><strong>Rubro:</strong> {selectedProvider.rubro}</p>}
                    {selectedProvider.contacto && <p><strong>Contacto:</strong> {selectedProvider.contacto}</p>}
                    {selectedProvider.email && <p><strong>Email:</strong> {selectedProvider.email}</p>}
                    {selectedProvider.telefono && <p><strong>Teléfono:</strong> {selectedProvider.telefono}</p>}
                    {selectedProvider.descripcion && <p><strong>Descripción:</strong> {selectedProvider.descripcion}</p>}
                  </div>
                </div>
              ) : null;
            })()}

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedProviderId || isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Asignando...' : 'Asignar Proveedor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}