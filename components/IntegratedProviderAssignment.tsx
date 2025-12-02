'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Proveedor, 
  EventoParticipante,
  EventoRequisito,
  getAllProviders, 
  getEventParticipants,
  createEventParticipant,
  createItem,
  getEventRequirements,
  assignRequirementsToParticipant
} from '@/lib/directus';
import RequirementAssignmentModal from '@/components/RequirementAssignmentModal';

// Tipo para usuarios del Avatar Group
interface User {
  id: string | number;
  image?: string;
  name: string;
}

// Componente Avatar simulado siguiendo el patrón de HeroUI
const Avatar = ({ src, alt, className = '', children }: {
  src?: string;
  alt?: string;
  className?: string;
  children?: any;
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt || ''} 
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
          {children || '?'}
        </div>
      )}
    </div>
  );
};

// Componente AvatarGroup siguiendo el patrón de HeroUI
const AvatarGroup = ({ users = [], maxDisplay = 3, className = '' }: {
  users?: User[];
  maxDisplay?: number;
  className?: string;
}) => {
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {/* Mostrar usuarios visibles */}
      {displayUsers.map((user) => (
        <Avatar 
          src={user.image} 
          alt={user.name}
          className="ring-2 ring-white w-8 h-8 md:w-10 md:h-10"
        >
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </Avatar>
      ))}
      
      {/* Mostrar contador si hay más usuarios */}
      {remainingCount > 0 && (
        <Avatar className="ring-2 ring-white w-8 h-8 md:w-10 md:h-10 bg-gray-100">
          <span className="text-xs font-medium text-gray-600">
            +{remainingCount}
          </span>
        </Avatar>
      )}
      
      {/* Si no hay usuarios, mostrar avatar con + */}
      {users.length === 0 && (
        <Avatar className="ring-2 ring-white w-8 h-8 md:w-10 md:h-10 bg-gray-100">
          <span className="text-xs font-medium text-gray-600">+</span>
        </Avatar>
      )}
    </div>
  );
};

// Componente AlertDialog siguiendo el patrón de HeroUI
interface AlertDialogProps {
  children: React.ReactNode;
}

interface AlertDialogContainerProps {
  children: React.ReactNode;
}

interface AlertDialogDialogProps {
  className?: string;
  children: React.ReactNode;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

interface AlertDialogHeadingProps {
  children: React.ReactNode;
}

interface AlertDialogBodyProps {
  children: React.ReactNode;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
}

interface AlertDialogIconProps {
  status?: 'danger' | 'warning' | 'info' | 'success';
  children: React.ReactNode;
}

interface ButtonProps {
  variant?: 'tertiary' | 'danger' | 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  onPress?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

// Componente AlertDialog principal
const AlertDialog = ({ children }: AlertDialogProps) => {
  return <div className="relative">{children}</div>;
};

// Componentes del AlertDialog siguiendo el patrón de HeroUI
const AlertDialogContainer = ({ children }: AlertDialogContainerProps) => {
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">{children}</div>;
};

const AlertDialogDialog = ({ className = '', children }: AlertDialogDialogProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-xl max-w-md w-full ${className}`}>
      {children}
    </div>
  );
};

const AlertDialogHeader = ({ children }: AlertDialogHeaderProps) => {
  return <div className="px-6 py-4 border-b border-gray-200">{children}</div>;
};

const AlertDialogHeading = ({ children }: AlertDialogHeadingProps) => {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>;
};

const AlertDialogBody = ({ children }: AlertDialogBodyProps) => {
  return <div className="px-6 py-4">{children}</div>;
};

const AlertDialogFooter = ({ children }: AlertDialogFooterProps) => {
  return <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">{children}</div>;
};

const AlertDialogIcon = ({ status = 'info', children }: AlertDialogIconProps) => {
  const statusColors = {
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    success: 'text-green-500'
  };
  
  return <div className={`text-2xl ${statusColors[status]}`}>{children}</div>;
};

const Button = ({ variant = 'solid', onPress, children, className = '', disabled = false, type = 'button' }: ButtonProps) => {
  const variantClasses = {
    tertiary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    solid: 'bg-blue-600 text-white hover:bg-blue-700',
    bordered: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
    light: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    flat: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    faded: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
    shadow: 'bg-white text-gray-900 shadow-md hover:shadow-lg',
    ghost: 'text-gray-700 hover:bg-gray-100'
  };

  return (
    <button
      type={type}
      onClick={onPress}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Ejemplo de uso del AlertDialog
const ExampleAlertDialog = () => {
  return (
    <AlertDialog>
      <Button variant="danger">Delete Project</Button>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-[400px]">
          {({close}) => (
            <>
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Delete project permanently?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>
                  This will permanently delete <strong>My Awesome Project</strong> and all of its
                  data. This action cannot be undone.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="tertiary" onPress={close}>
                  Cancel
                </Button>
                <Button variant="danger" onPress={close}>
                  Delete Project
                </Button>
              </AlertDialog.Footer>
            </>
          )}
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog>
  );
};

interface ProviderWithStatus extends Proveedor {
  isAssigned?: boolean;
  assignmentStatus?: 'pending' | 'approved' | 'rejected';
  participantes?: EventoParticipante[];
}

interface IntegratedProviderAssignmentProps {
  eventId: string | number;
  onComplete?: () => void;
}

export default function IntegratedProviderAssignment({ eventId, onComplete }: IntegratedProviderAssignmentProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allProviders, setAllProviders] = useState<ProviderWithStatus[]>([]);
  const [eventParticipants, setEventParticipants] = useState<EventoParticipante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [isCreatingProvider, setIsCreatingProvider] = useState(false);
  const [currentStep, setCurrentStep] = useState<'select' | 'assign' | 'requirements'>('select');
  const [assignedParticipant, setAssignedParticipant] = useState<EventoParticipante | null>(null);
  const [newProvider, setNewProvider] = useState({
    nombre: '',
    descripcion: '',
    email: '',
    telefono: '',
    contacto: '',
    rubro: ''
  });
  const [showRequirementModal, setShowRequirementModal] = useState(false);

  useEffect(() => {
    loadProviders();
  }, [eventId]);

  const loadProviders = async () => {
    setIsLoading(true);
    console.log('🔍 Cargando proveedores para evento:', eventId);
    
    try {
      const [providersData, participantsData] = await Promise.all([
        getAllProviders(),
        getEventParticipants(eventId)
      ]);

      console.log('📋 Proveedores cargados:', providersData?.length || 0);
      console.log('👥 Participantes cargados:', participantsData?.length || 0);

      setAllProviders(providersData || []);
      setEventParticipants(participantsData || []);

      const providersWithStatus = (providersData || []).map((provider: Proveedor) => {
        const participant = (participantsData || []).find((p: EventoParticipante) => p.proveedor_id === provider.id);
        return {
          ...provider,
          isAssigned: !!participant,
          assignmentStatus: participant?.status,
          participantes: participant ? [participant] : []
        };
      });

      setAllProviders(providersWithStatus);
      console.log('✅ Proveedores procesados:', providersWithStatus.length);
    } catch (error) {
      console.error('💥 Error loading providers:', error);
      alert(`Error al cargar proveedores: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setAllProviders([]);
      setEventParticipants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignProvider = async (providerId: string) => {
    setIsAssigning(providerId);
    setCurrentStep('assign');
    
    try {
      const participant = await createEventParticipant({
        evento_id: eventId,
        proveedor_id: providerId,
        status: 'pending'
      });
      
      setAssignedParticipant(participant);
      await loadProviders();
      setCurrentStep('requirements');
      setShowRequirementModal(true);
    } catch (error) {
      console.error('Error assigning provider:', error);
      alert('Error al asignar proveedor');
      setCurrentStep('select');
    } finally {
      setIsAssigning(null);
    }
  };

  const handleCreateProvider = async (e: any) => {
    e.preventDefault();
    
    if (!newProvider.nombre.trim()) {
      alert('El nombre del proveedor es obligatorio');
      return;
    }

    try {
      setIsLoading(true);
      setCurrentStep('assign');
      
      // Create new provider
      const createdProvider = await createItem('proveedores', {
        nombre: newProvider.nombre,
        descripcion: newProvider.descripcion,
        email: newProvider.email,
        telefono: newProvider.telefono,
        contacto: newProvider.contacto,
        rubro: newProvider.rubro,
        status: 'active'
      });

      // Assign to event
      const participant = await createEventParticipant({
        evento_id: eventId,
        proveedor_id: createdProvider.id,
        status: 'pending'
      });

      setNewProvider({
        nombre: '',
        descripcion: '',
        email: '',
        telefono: '',
        contacto: '',
        rubro: ''
      });
      setIsCreatingProvider(false);
      setAssignedParticipant(participant);
      setCurrentStep('requirements');
      setShowRequirementModal(true);
      
      await loadProviders();
      
    } catch (error) {
      console.error('Error creating provider:', error);
      alert('Error al crear proveedor');
      setCurrentStep('select');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequirementsAssigned = () => {
    setShowRequirementModal(false);
    setAssignedParticipant(null);
    setCurrentStep('select');
    onComplete?.();
  };

  const handleSkipRequirements = () => {
    setShowRequirementModal(false);
    setAssignedParticipant(null);
    setCurrentStep('select');
    onComplete?.();
  };

  const getAssignmentButtonText = (provider: ProviderWithStatus) => {
    if (provider.isAssigned) {
      switch (provider.assignmentStatus) {
        case 'approved': return '✓ Asignado';
        case 'pending': return '⏳ Pendiente';
        case 'rejected': return '✗ Rechazado';
        default: return 'Asignado';
      }
    }
    return 'Asignar';
  };

  const isAssignmentDisabled = (provider: ProviderWithStatus) => {
    return provider.isAssigned || isAssigning === provider.id.toString();
  };

  // Función para generar participantes de ejemplo para el Avatar Group
  const getSampleParticipants = (providerId: string | number): User[] => {
    // Datos de ejemplo para demostrar el Avatar Group
    const sampleParticipants: { [key: string]: User[] } = {
      '1': [
        { id: 1, image: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg', name: 'Juan Pérez' },
        { id: 2, image: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg', name: 'María García' },
        { id: 3, image: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg', name: 'Carlos López' },
        { id: 4, image: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg', name: 'Ana Martínez' },
        { id: 5, image: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg', name: 'Luis Rodríguez' },
      ],
      '2': [
        { id: 6, image: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg', name: 'Elena Sánchez' },
        { id: 7, image: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg', name: 'Roberto Silva' },
        { id: 8, image: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg', name: 'Carmen Torres' },
      ],
      '3': [
        { id: 9, image: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg', name: 'Pedro Morales' },
        { id: 10, image: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg', name: 'Sofía Herrera' },
      ],
    };

    // Si el proveedor no tiene participantes de ejemplo, retornar array vacío (mostrará +)
    return sampleParticipants[providerId.toString()] || [];
  };

  const getStepIndicator = () => {
    const steps = [
      { key: 'select', label: 'Seleccionar', icon: '🔍' },
      { key: 'assign', label: 'Asignar', icon: '➕' },
      { key: 'requirements', label: 'Requisitos', icon: '📋' }
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStep);

    return (
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              index <= currentIndex 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-gray-100 border-gray-300 text-gray-400'
            }`}>
              <span className="text-sm">{step.icon}</span>
            </div>
            <span className={`ml-2 text-sm ${
              index <= currentIndex ? 'text-blue-600 font-medium' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-4 ${
                index < currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      {getStepIndicator()}

      {/* Requirement Assignment Modal */}
      {showRequirementModal && assignedParticipant && (
        <RequirementAssignmentModal
          isOpen={showRequirementModal}
          onClose={() => setShowRequirementModal(false)}
          eventId={eventId}
          participantId={assignedParticipant.id}
          onRequirementsAssigned={handleRequirementsAssigned}
        />
      )}

      {/* Skip Requirements Option */}
      {currentStep === 'requirements' && showRequirementModal && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800 mb-4">
            ¿Deseas asignar requisitos ahora o prefieres hacerlo más tarde?
          </p>
          <div className="space-x-4">
            <button
              onClick={() => setShowRequirementModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Asignar Requisitos Ahora
            </button>
            <button
              onClick={handleSkipRequirements}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Asignar Más Tarde
            </button>
          </div>
        </div>
      )}

      {/* Provider Selection/Assignment */}
      {currentStep === 'select' && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-black">Seleccionar Proveedor</h3>
              <button
                onClick={() => setIsCreatingProvider(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                + Crear Nuevo Proveedor
              </button>
            </div>

            {/* Create Provider Form */}
            {isCreatingProvider && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h4 className="text-md font-medium text-black mb-4">Crear Nuevo Proveedor</h4>
                <form onSubmit={handleCreateProvider} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Proveedor *
                      </label>
                      <input
                        type="text"
                        required
                        value={newProvider.nombre}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ej: Empresa ABC"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rubro
                      </label>
                      <input
                        type="text"
                        value={newProvider.rubro}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, rubro: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ej: Catering"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newProvider.email}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="contacto@empresa.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={newProvider.telefono}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, telefono: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="+54 11 1234-5678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Persona de Contacto
                      </label>
                      <input
                        type="text"
                        value={newProvider.contacto}
                        onChange={(e) => setNewProvider(prev => ({ ...prev, contacto: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Juan Pérez"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={newProvider.descripcion}
                      onChange={(e) => setNewProvider(prev => ({ ...prev, descripcion: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
                      placeholder="Descripción del proveedor y servicios"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setIsCreatingProvider(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Creando...' : 'Crear y Asignar'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Providers List */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando proveedores...</p>
                </div>
              ) : allProviders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🏢</div>
                  <p>No hay proveedores en el catálogo</p>
                  <p className="text-sm">Crea el primer proveedor para comenzar</p>
                </div>
              ) : (
                allProviders.map((provider) => (
                  <div key={provider.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-black">{provider.nombre}</h4>
                        {provider.isAssigned && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            provider.assignmentStatus === 'approved' 
                              ? 'bg-green-100 text-green-800'
                              : provider.assignmentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {getAssignmentButtonText(provider)}
                          </span>
                        )}
                      </div>
                      
                      {provider.descripcion && (
                        <p className="text-gray-600 mt-1">{provider.descripcion}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        {provider.rubro && <span>🏢 {provider.rubro}</span>}
                        {provider.email && <span>📧 {provider.email}</span>}
                        {provider.telefono && <span>📞 {provider.telefono}</span>}
                      </div>

                      {/* Avatar Group de Participantes - HeroUI Style */}
                      <div className="mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Participantes:</span>
                          <AvatarGroup 
                            users={getSampleParticipants(provider.id)} 
                            maxDisplay={3}
                            className=""
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {!provider.isAssigned ? (
                        <button
                          onClick={() => handleAssignProvider(provider.id.toString())}
                          disabled={isAssignmentDisabled(provider)}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAssigning === provider.id.toString() ? 'Asignando...' : 'Seleccionar'}
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Ya asignado</span>
                          <Link
                            href={`/events/${eventId}/providers/${provider.participantes?.[0]?.id}`}
                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
                          >
                            Ver Detalle
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Assignment Progress */}
      {currentStep === 'assign' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h3 className="text-lg font-medium text-black mt-4">Asignando proveedor al evento...</h3>
            <p className="text-gray-600 mt-2">Por favor espera mientras se procesa la asignación</p>
          </div>
        </div>
      )}
    </div>
  );
}

export { 
  Avatar, 
  AvatarGroup, 
  AlertDialog, 
  AlertDialogContainer, 
  AlertDialogDialog, 
  AlertDialogHeader, 
  AlertDialogHeading, 
  AlertDialogBody, 
  AlertDialogFooter, 
  AlertDialogIcon, 
  Button,
  ExampleAlertDialog 
};
export type { User };