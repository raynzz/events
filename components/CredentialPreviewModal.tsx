'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CredentialData {
  id: string;
  name: string;
  email: string;
  provider: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  position: string;
}

interface CredentialPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentialData: CredentialData;
}

export default function CredentialPreviewModal({ isOpen, onClose, credentialData }: CredentialPreviewModalProps) {
  const { user } = useAuth();
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setIsPrinting(false);
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-black">Vista Previa de Credencial</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Credencial Preview */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {credentialData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <h4 className="text-xl font-bold">{credentialData.name}</h4>
                <p className="text-blue-100 text-sm">{credentialData.position}</p>
              </div>

              <div className="border-t border-blue-400 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-200 text-xs">PROVEEDOR</span>
                  <span className="text-white font-bold">{credentialData.provider}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-200 text-xs">EVENTO</span>
                  <span className="text-white font-bold text-sm">{credentialData.eventName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200 text-xs">FECHA</span>
                  <span className="text-white font-bold">{formatDate(credentialData.eventDate)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-400 text-center">
                <div className="text-xs text-blue-200 mb-1">ID DE CREDENCIAL</div>
                <div className="text-lg font-mono font-bold tracking-wider">{credentialData.id}</div>
              </div>
            </div>
          </div>

          {/* Participant Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-black mb-3">Información del Participante</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium text-black">{credentialData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-black">{credentialData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Proveedor:</span>
                <span className="font-medium text-black">{credentialData.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Evento:</span>
                <span className="font-medium text-black">{credentialData.eventName}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isPrinting ? 'Imprimiendo...' : 'Imprimir Credencial'}
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-credential, .print-credential * {
            visibility: visible;
          }
          .print-credential {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}