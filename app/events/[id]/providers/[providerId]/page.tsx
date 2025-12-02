'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  EventoParticipante,
  EventoRequisito,
  Integrante,
  ParticipanteRequisito,
  getEventParticipants,
  getParticipantRequirements,
  getParticipantIntegrantes,
  createParticipantIntegrante,
  updateIntegrante,
  deleteIntegrante,
  updateRequirementDocument
} from '@/lib/directus';

interface ProviderDetailProps {
  params: { 
    id: string;
    providerId: string;
  };
}

export default function ProviderDetailPage({ params }: ProviderDetailProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [participant, setParticipant] = useState<EventoParticipante | null>(null);
  const [requirements, setRequirements] = useState<(ParticipanteRequisito & { evento_requisito?: EventoRequisito })[]>([]);
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requirements' | 'members'>('requirements');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    fecha_nacimiento: '',
    cargo: '',
    telefono: '',
    email: ''
  });

  useEffect(() => {
    if (!loading && user) {
      loadProviderData();
    }
  }, [params.id, params.providerId, user, loading]);

  const loadProviderData = async () => {
    setIsLoading(true);
    try {
      // Load participant (provider in event)
      const participants = await getEventParticipants(params.id);
      const participantData = participants.find(p => p.id.toString() === params.providerId);
      
      if (!participantData) {
        throw new Error('Participante no encontrado');
      }

      setParticipant(participantData);

      // Load participant requirements
      const participantRequirements = await getParticipantRequirements(params.providerId);
      setRequirements(participantRequirements);

      // Load participants members (integrantes)
      const participantMembers = await getParticipantIntegrantes(params.providerId);
      setIntegrantes(participantMembers);
    } catch (error) {
      console.error('Error loading provider data:', error);
      alert('Error al cargar datos del proveedor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMember.nombre || !newMember.apellido || !newMember.documento) {
      alert('Los campos nombre, apellido y documento son obligatorios');
      return;
    }

    try {
      await createParticipantIntegrante({
        evento_participante_id: params.providerId,
        ...newMember
      });

      setNewMember({
        nombre: '',
        apellido: '',
        documento: '',
        fecha_nacimiento: '',
        cargo: '',
        telefono: '',
        email: ''
      });
      setIsAddingMember(false);
      await loadProviderData();
      alert('Integrante agregado exitosamente');
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error al agregar integrante');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('¿Está seguro de eliminar este integrante?')) {
      return;
    }

    try {
      await deleteIntegrante(memberId);
      await loadProviderData();
      alert('Integrante eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Error al eliminar integrante');
    }
  };

  const handleUpdateRequirementStatus = async (requirementId: string, newStatus: 'pendiente' | 'aprobado' | 'rechazado') => {
    try {
      await updateRequirementDocument(requirementId, {
        estado: newStatus
      });
      await loadProviderData();
    } catch (error) {
      console.error('Error updating requirement status:', error);
      alert('Error al actualizar estado del requisito');
    }
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

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href={`/events/${params.id}/providers`} className="text-xl font-bold text-black">
                  ← Volver a Proveedores
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-black mb-2">Proveedor no encontrado</h2>
            <p className="text-gray-600 mb-6">El proveedor que buscas no existe o no está asignado a este evento.</p>
            <Link
              href={`/events/${params.id}/providers`}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Volver a proveedores
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/events/${params.id}/providers`} className="text-xl font-bold text-black">
                ← Volver a Proveedores
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-black">Detalle del Proveedor</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-black mb-2">{participant.proveedor?.nombre}</h2>
              {participant.proveedor?.rubro && (
                <p className="text-gray-600 mb-2">Rubro: {participant.proveedor.rubro}</p>
              )}
              {participant.proveedor?.descripcion && (
                <p className="text-gray-600 mb-2">{participant.proveedor.descripcion}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {participant.proveedor?.email && (
                  <span>📧 {participant.proveedor.email}</span>
                )}
                {participant.proveedor?.telefono && (
                  <span>📞 {participant.proveedor.telefono}</span>
                )}
                {participant.proveedor?.contacto && (
                  <span>👤 {participant.proveedor.contacto}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                participant.status === 'approved' ? 'bg-green-100 text-green-800' :
                participant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {participant.status === 'approved' ? '✓ Aprobado' :
                 participant.status === 'pending' ? '⏳ Pendiente' : '✗ Rechazado'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">{requirements.length}</div>
                <div className="text-sm text-blue-600">Requisitos Asignados</div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800">
                  {requirements.filter(r => r.estado === 'aprobado').length}
                </div>
                <div className="text-sm text-green-600">Requisitos Aprobados</div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-800">{integrantes.length}</div>
                <div className="text-sm text-purple-600">Integrantes</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 border-b">
            {[
              { key: 'requirements', label: 'Requisitos', icon: '📋' },
              { key: 'members', label: 'Integrantes', icon: '👥' }
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
          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-black mb-4">Requisitos del Proveedor</h3>
              
              {requirements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📋</div>
                  <p>No hay requisitos asignados a este proveedor</p>
                  <p className="text-sm">Los requisitos se asignan desde la gestión de requisitos del evento</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requirements.map((req) => (
                    <div key={req.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-black">{req.evento_requisito?.nombre}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              req.evento_requisito?.es_global 
                                ? 'bg-gray-100 text-gray-600' 
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {req.evento_requisito?.es_global ? '🌐 Global' : '🎯 Específico'}
                            </span>
                          </div>
                          
                          {req.evento_requisito?.descripcion && (
                            <p className="text-sm text-gray-600 mb-2">{req.evento_requisito.descripcion}</p>
                          )}
                          
                          {req.evento_requisito?.suma_asegurada && (
                            <p className="text-xs text-blue-600 mb-2">
                              Suma asegurada: ${req.evento_requisito.suma_asegurada.toLocaleString()}
                            </p>
                          )}
                          
                          {req.notas_revision && (
                            <p className="text-sm text-gray-500 italic">Notas: {req.notas_revision}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <select
                            value={req.estado}
                            onChange={(e) => handleUpdateRequirementStatus(
                              req.id.toString(),
                              e.target.value as 'pendiente' | 'aprobado' | 'rechazado'
                            )}
                            className={`text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${getStatusColor(req.estado)}`}
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
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-black">Integrantes del Proveedor</h3>
                <button
                  onClick={() => setIsAddingMember(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  + Agregar Integrante
                </button>
              </div>

              {/* Add Member Form */}
              {isAddingMember && (
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h4 className="text-md font-medium text-black mb-4">Nuevo Integrante</h4>
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          required
                          value={newMember.nombre}
                          onChange={(e) => setNewMember(prev => ({ ...prev, nombre: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Apellido *
                        </label>
                        <input
                          type="text"
                          required
                          value={newMember.apellido}
                          onChange={(e) => setNewMember(prev => ({ ...prev, apellido: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Apellido"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Documento *
                        </label>
                        <input
                          type="text"
                          required
                          value={newMember.documento}
                          onChange={(e) => setNewMember(prev => ({ ...prev, documento: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Documento de identidad"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Nacimiento
                        </label>
                        <input
                          type="date"
                          value={newMember.fecha_nacimiento}
                          onChange={(e) => setNewMember(prev => ({ ...prev, fecha_nacimiento: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cargo/Rol
                        </label>
                        <input
                          type="text"
                          value={newMember.cargo}
                          onChange={(e) => setNewMember(prev => ({ ...prev, cargo: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ej: Chef, Camarero, Supervisor"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={newMember.telefono}
                          onChange={(e) => setNewMember(prev => ({ ...prev, telefono: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Teléfono de contacto"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={newMember.email}
                          onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Email de contacto"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsAddingMember(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Agregar Integrante
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Members List */}
              {integrantes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">👥</div>
                  <p>No hay integrantes registrados</p>
                  <p className="text-sm">Agrega los miembros del equipo para este proveedor</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integrantes.map((integrante) => (
                    <div key={integrante.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-black">
                            {integrante.nombre} {integrante.apellido}
                          </h4>
                          {integrante.cargo && (
                            <p className="text-sm text-gray-600">{integrante.cargo}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteMember(integrante.id.toString())}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        {integrante.documento && (
                          <p>📄 {integrante.documento}</p>
                        )}
                        {integrante.fecha_nacimiento && (
                          <p>🎂 {new Date(integrante.fecha_nacimiento).toLocaleDateString()}</p>
                        )}
                        {integrante.telefono && (
                          <p>📞 {integrante.telefono}</p>
                        )}
                        {integrante.email && (
                          <p>📧 {integrante.email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}