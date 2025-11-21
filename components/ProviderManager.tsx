'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DocumentRequirement {
  id: string;
  type: 'RC' | 'AP' | 'ART' | 'OTRO';
  name: string;
  required: boolean;
  description: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  documentStatus: {
    [documentId: string]: 'pending' | 'uploaded' | 'verified';
  };
}

interface Provider {
  id: string;
  name: string;
  description: string;
  requiresLiquorLicense: boolean;
  requiredDocuments: DocumentRequirement[];
  teamMembers: TeamMember[];
}

interface ProviderManagerProps {
  providers: Provider[];
  onProvidersChange: (providers: Provider[]) => void;
}

export default function ProviderManager({ providers, onProvidersChange }: ProviderManagerProps) {
  const { user } = useAuth();
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '',
    description: '',
    requiresLiquorLicense: false,
    requiredDocuments: [] as DocumentRequirement[]
  });
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  const documentTemplates: DocumentRequirement[] = [
    { id: 'rc1', type: 'RC', name: 'Registro de Comercio', required: false, description: 'Registro legal del establecimiento' },
    { id: 'ap1', type: 'AP', name: 'Autorización de Policía', required: false, description: 'Permiso de autoridades locales' },
    { id: 'art1', type: 'ART', name: 'ART - Responsabilidad del Trabajo', required: false, description: 'Seguro de accidentes de trabajo' },
    { id: 'rc2', type: 'RC', name: 'Registro de Espectáculos Públicos', required: false, description: 'Registro para eventos públicos' },
    { id: 'ap2', type: 'AP', name: 'Autorización de Bomberos', required: false, description: 'Certificado de seguridad contra incendios' },
    { id: 'art2', type: 'ART', name: 'ART - Responsabilidad Civil', required: false, description: 'Seguro de responsabilidad civil' },
    { id: 'rc3', type: 'RC', name: 'Registro de Alimentos y Bebidas', required: false, description: 'Permiso para venta de alimentos' },
  ];

  const addProvider = () => {
    if (newProvider.name.trim()) {
      const provider: Provider = {
        id: `provider-${Date.now()}`,
        name: newProvider.name.trim(),
        description: newProvider.description.trim(),
        requiresLiquorLicense: newProvider.requiresLiquorLicense,
        requiredDocuments: newProvider.requiredDocuments,
        teamMembers: []
      };
      
      onProvidersChange([...providers, provider]);
      setNewProvider({
        name: '',
        description: '',
        requiresLiquorLicense: false,
        requiredDocuments: []
      });
      setIsAddingProvider(false);
    }
  };

  const removeProvider = (providerId: string) => {
    onProvidersChange(providers.filter(p => p.id !== providerId));
    if (selectedProvider?.id === providerId) {
      setSelectedProvider(null);
    }
  };

  const addDocumentToProvider = (document: DocumentRequirement) => {
    setNewProvider(prev => ({
      ...prev,
      requiredDocuments: [...prev.requiredDocuments, { ...document, required: false }]
    }));
  };

  const removeDocumentFromProvider = (documentId: string) => {
    setNewProvider(prev => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter(doc => doc.id !== documentId)
    }));
  };

  const addTeamMember = () => {
    if (newMemberName.trim() && selectedProvider) {
      const member: TeamMember = {
        id: `member-${Date.now()}`,
        name: newMemberName.trim(),
        role: newMemberRole.trim() || 'Integrante',
        documentStatus: {}
      };

      const updatedProviders = providers.map(provider => {
        if (provider.id === selectedProvider.id) {
          return {
            ...provider,
            teamMembers: [...provider.teamMembers, member]
          };
        }
        return provider;
      });

      onProvidersChange(updatedProviders);
      setSelectedProvider(updatedProviders.find(p => p.id === selectedProvider.id) || null);
      setNewMemberName('');
      setNewMemberRole('');
      setIsAddingMember(false);
    }
  };

  const removeTeamMember = (providerId: string, memberId: string) => {
    const updatedProviders = providers.map(provider => {
      if (provider.id === providerId) {
        return {
          ...provider,
          teamMembers: provider.teamMembers.filter(member => member.id !== memberId)
        };
      }
      return provider;
    });

    onProvidersChange(updatedProviders);
    if (selectedProvider?.id === providerId) {
      setSelectedProvider(updatedProviders.find(p => p.id === providerId) || null);
    }
  };

  const updateDocumentStatus = (providerId: string, memberId: string, documentId: string, status: 'pending' | 'uploaded' | 'verified') => {
    const updatedProviders = providers.map(provider => {
      if (provider.id === providerId) {
        return {
          ...provider,
          teamMembers: provider.teamMembers.map(member => {
            if (member.id === memberId) {
              return {
                ...member,
                documentStatus: {
                  ...member.documentStatus,
                  [documentId]: status
                }
              };
            }
            return member;
          })
        };
      }
      return provider;
    });

    onProvidersChange(updatedProviders);
    if (selectedProvider?.id === providerId) {
      setSelectedProvider(updatedProviders.find(p => p.id === providerId) || null);
    }
  };

  const getDocumentStatusColor = (status: 'pending' | 'uploaded' | 'verified') => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'uploaded': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionPercentage = (provider: Provider) => {
    if (provider.teamMembers.length === 0) return 0;
    
    const totalDocuments = provider.requiredDocuments.length;
    if (totalDocuments === 0) return 100;
    
    let completedDocuments = 0;
    provider.teamMembers.forEach(member => {
      Object.values(member.documentStatus).forEach(status => {
        if (status === 'verified') completedDocuments++;
      });
    });
    
    return Math.round((completedDocuments / (provider.teamMembers.length * totalDocuments)) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Botón para agregar proveedor */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-black">Gestión de Proveedores</h3>
        <button
          onClick={() => setIsAddingProvider(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
        >
          + Agregar Proveedor
        </button>
      </div>

      {/* Formulario para agregar proveedor */}
      {isAddingProvider && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-black mb-4">Nuevo Proveedor</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Proveedor *</label>
              <input
                type="text"
                value={newProvider.name}
                onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ej: Branca"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={newProvider.description}
                onChange={(e) => setNewProvider(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black h-20"
                placeholder="Descripción del proveedor"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="liquorLicense"
                checked={newProvider.requiresLiquorLicense}
                onChange={(e) => setNewProvider(prev => ({ ...prev, requiresLiquorLicense: e.target.checked }))}
                className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <label htmlFor="liquorLicense" className="ml-2 text-sm text-gray-700">
                Requiere permiso de venta de bebidas
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Documentos Requeridos</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documentTemplates.map((doc) => (
                  <div key={doc.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id={`doc-${doc.id}`}
                      checked={newProvider.requiredDocuments.some(d => d.id === doc.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          addDocumentToProvider(doc);
                        } else {
                          removeDocumentFromProvider(doc.id);
                        }
                      }}
                      className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <label htmlFor={`doc-${doc.id}`} className="ml-3 text-sm text-black">
                      {doc.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingProvider(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={addProvider}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                Agregar Proveedor
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de proveedores */}
        <div className="lg:col-span-1">
          <div className="space-y-3">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedProvider?.id === provider.id
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedProvider(provider)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-black">{provider.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                    {provider.requiresLiquorLicense && (
                      <span className="inline-flex items-center mt-2 text-xs text-orange-600">
                        🍷 Venta de bebidas
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProvider(provider.id);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ×
                  </button>
                </div>
                
                {/* Progreso de documentos */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progreso</span>
                    <span>{getCompletionPercentage(provider)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-black h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getCompletionPercentage(provider)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalles del proveedor seleccionado */}
        <div className="lg:col-span-2">
          {selectedProvider ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-black">{selectedProvider.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedProvider.description}</p>
                </div>
                <button
                  onClick={() => setIsAddingMember(true)}
                  className="px-3 py-1 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                >
                  + Integrante
                </button>
              </div>

              {/* Formulario para agregar integrante */}
              {isAddingMember && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-md font-medium text-black mb-3">Nuevo Integrante</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Ej: Ana Lucia"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                      <input
                        type="text"
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Ej: Chef, Ayudante, etc."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setIsAddingMember(false)}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={addTeamMember}
                      className="px-3 py-1 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                    >
                      Agregar Integrante
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de integrantes */}
              <div>
                <h4 className="text-md font-medium text-black mb-4">Integrantes ({selectedProvider.teamMembers.length})</h4>
                
                {selectedProvider.teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay integrantes agregados
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedProvider.teamMembers.map((member) => (
                      <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-medium text-black">{member.name}</h5>
                            <p className="text-sm text-gray-600">{member.role}</p>
                          </div>
                          <button
                            onClick={() => removeTeamMember(selectedProvider.id, member.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            ×
                          </button>
                        </div>

                        {/* Estado de documentos del integrante */}
                        <div>
                          <h6 className="text-sm font-medium text-black mb-3">Estado de Documentos</h6>
                          {selectedProvider.requiredDocuments.length === 0 ? (
                            <p className="text-sm text-gray-500">No se requieren documentos para este proveedor</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {selectedProvider.requiredDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                                        doc.type === 'RC' ? 'bg-red-100 text-red-800' :
                                        doc.type === 'AP' ? 'bg-purple-100 text-purple-800' :
                                        doc.type === 'ART' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {doc.type}
                                      </span>
                                      <span className="text-sm font-medium text-black">{doc.name}</span>
                                    </div>
                                  </div>
                                  <select
                                    value={member.documentStatus[doc.id] || 'pending'}
                                    onChange={(e) => updateDocumentStatus(
                                      selectedProvider.id,
                                      member.id,
                                      doc.id,
                                      e.target.value as 'pending' | 'uploaded' | 'verified'
                                    )}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black"
                                  >
                                    <option value="pending">Pendiente</option>
                                    <option value="uploaded">Subido</option>
                                    <option value="verified">Verificado</option>
                                  </select>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">👥</div>
              <p>Selecciona un proveedor para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}