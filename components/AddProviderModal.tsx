'use client';

import { useState } from 'react';
import { use } from 'react';

interface DocumentRequirement {
  id: string;
  type: 'RC' | 'AP' | 'ART' | 'SS';
  name: string;
  required: boolean;
  description: string;
  status: 'pending' | 'uploaded' | 'verified';
  uploadUrl?: string;
}

interface Provider {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  contactName: string;
  documents: DocumentRequirement[];
}

interface AddProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: Omit<Provider, 'id'>) => void;
  eventRequiresLiquorLicense: boolean;
}

export default function AddProviderModal({ 
  isOpen, 
  onClose, 
  onSave, 
  eventRequiresLiquorLicense 
}: AddProviderModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    contactName: ''
  });

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  // Documentos disponibles según el tipo de evento
  const availableDocuments = [
    {
      id: 'rc',
      type: 'RC' as const,
      name: 'Registro de Comercio',
      description: 'Registro legal del establecimiento',
      required: true
    },
    {
      id: 'ap',
      type: 'AP' as const,
      name: 'Autorización de Policía',
      description: 'Permiso de autoridades locales',
      required: true
    },
    {
      id: 'art-work',
      type: 'ART' as const,
      name: 'ART - Responsabilidad del Trabajo',
      description: 'Seguro de accidentes de trabajo',
      required: eventRequiresLiquorLicense
    },
    {
      id: 'art-civil',
      type: 'ART' as const,
      name: 'ART - Responsabilidad Civil',
      description: 'Seguro de responsabilidad civil',
      required: eventRequiresLiquorLicense
    },
    {
      id: 'ss',
      type: 'SS' as const,
      name: 'Servicios Sanitarios',
      description: 'Permiso de servicios e higiene',
      required: eventRequiresLiquorLicense
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name || !formData.email || !formData.contactName) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    // Filtrar documentos seleccionados y crear array de documentos
    const documents: DocumentRequirement[] = availableDocuments
      .filter(doc => selectedDocuments.includes(doc.id))
      .map(doc => ({
        id: `${doc.id}-${Date.now()}`,
        type: doc.type,
        name: doc.name,
        required: doc.required,
        description: doc.description,
        status: 'pending' as const
      }));

    const providerData = {
      ...formData,
      documents
    };

    onSave(providerData);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      email: '',
      phone: '',
      contactName: ''
    });
    setSelectedDocuments([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Agregar Nuevo Proveedor</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica del proveedor */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-black border-b pb-2">
                Información del Proveedor
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contacto Principal *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Selección de documentos */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-black border-b pb-2">
                Documentos Requeridos
              </h3>
              
              <p className="text-sm text-gray-600">
                Seleccione los documentos que este proveedor necesita para el evento.
              </p>

              <div className="space-y-3">
                {availableDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDocuments.includes(doc.id)
                        ? 'border-black bg-black bg-opacity-5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleDocumentToggle(doc.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => handleDocumentToggle(doc.id)}
                          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-black">
                            {doc.name}
                            {doc.required && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                Obligatorio
                              </span>
                            )}
                          </h4>
                        </div>
                        <p className="text-sm text-black mt-1">{doc.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                Agregar Proveedor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}