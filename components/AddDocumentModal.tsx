'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (document: {
    id: string;
    name: string;
    description: string;
    type: 'RC' | 'AP' | 'ART' | 'OTRO';
  }) => void;
}

export default function AddDocumentModal({ isOpen, onClose, onAdd }: AddDocumentModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'OTRO' as 'RC' | 'AP' | 'ART' | 'OTRO'
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.name.trim() && formData.description.trim()) {
      onAdd({
        id: `custom-${Date.now()}`,
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type
      });
      setFormData({ name: '', description: '', type: 'OTRO' });
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black">Agregar Documento Personalizado</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Documento *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              required
            >
              <option value="RC">RC - Registro de Comercio</option>
              <option value="AP">AP - Autorización de Policía</option>
              <option value="ART">ART - Aseguramiento de Riesgos del Trabajo</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Documento *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Permiso de Ambientación"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Corta *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descripción breve del documento requerido"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
            >
              Agregar Documento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}