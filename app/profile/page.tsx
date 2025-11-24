'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, getAssetUrl } from '@/lib/directus';
import Avatar from '@/components/Avatar';

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Permitir acceso a invitados y usuarios autenticados
    if (loading) return;
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // En una aplicación real, aquí se llamaría a la API
      console.log('Actualizando usuario:', formData);

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualizar el contexto de autenticación
      if (updateUser) {
        await updateUser({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email
        });
      }

      setSaveSuccess(true);
      setIsEditing(false);

      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || ''
      });
    }
    setIsEditing(false);
    setSaveSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Mostrar perfil de invitado
    return <GuestProfilePage />;
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'organizer':
        return 'Organizador';
      case 'provider':
        return 'Proveedor';
      default:
        return 'Usuario';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'organizer':
        return 'bg-blue-100 text-blue-800';
      case 'provider':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get avatar URL from Directus
  const avatarUrl = getAssetUrl(user.avatar);
  const initials = user.first_name && user.last_name
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
    : 'U';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-black flex items-center">
                ← Volver al Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-black">Perfil de Usuario</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {/* Profile Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <Avatar
                src={avatarUrl}
                alt={`${user.first_name} ${user.last_name}`}
                size="lg"
                fallbackText={initials}
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-black">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleText(user.role)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Miembro desde {formatDate(user.last_access)}
                  </span>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                >
                  Editar Perfil
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {saveSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">
                      Perfil actualizado exitosamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isEditing ? (
              // Edit Form
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
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

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            ) : (
              // View Mode
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre Completo</h3>
                    <p className="text-lg text-black">{user.first_name} {user.last_name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                    <p className="text-lg text-black">{user.email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Rol</h3>
                    <p className="text-lg text-black">{getRoleText(user.role)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Último Acceso</h3>
                    <p className="text-lg text-black">{formatDate(user.last_access)}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-black mb-4">Configuración de Cuenta</h3>
                  <div className="space-y-3">
                    <Link href="/change-password" className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-black">Cambiar Contraseña</h4>
                          <p className="text-sm text-gray-600">Actualiza tu contraseña de acceso</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>

                    <div className="block p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-800">Cerrar Sesión</h4>
                          <p className="text-sm text-red-600">Salir de tu cuenta actual</p>
                        </div>
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Componente para perfil de invitado
function GuestProfilePage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-black flex items-center">
                ← Volver al Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-black">Perfil de Invitado</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {/* Guest Profile Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-2xl">👤</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-black">Invitado</h2>
                <p className="text-gray-600">Sin autenticar</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Modo Invitado
                  </span>
                  <span className="text-sm text-gray-500">
                    Acceso limitado a funciones de demostración
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Profile Content */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Account Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Estado de la Cuenta</h3>
                <p className="text-blue-800">
                  Estás navegando como invitado. Para acceder a todas las funcionalidades de la plataforma,
                  necesitas crear una cuenta o iniciar sesión.
                </p>
              </div>

              {/* Available Features for Guests */}
              <div>
                <h3 className="text-lg font-medium text-black mb-4">Funciones Disponibles como Invitado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-black mb-2">📊 Visualización de Dashboard</h4>
                    <p className="text-sm text-gray-600">Accede a una vista previa del dashboard con datos de demostración</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-black mb-2">👁️ Exploración de Eventos</h4>
                    <p className="text-sm text-gray-600">Navega por eventos de ejemplo y conoce la plataforma</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-black mb-2">🎯 Demostraciones 3D</h4>
                    <p className="text-sm text-gray-600">Prueba visualizaciones 3D interactivas con simulación de fluidos</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-black mb-2">📋 Documentación de Ayuda</h4>
                    <p className="text-sm text-gray-600">Accede a documentación y guías de la plataforma</p>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-black mb-4">Acciones de Cuenta</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleLogin}
                    className="w-full p-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-between"
                  >
                    <div className="text-left">
                      <h4 className="font-medium">Iniciar Sesión</h4>
                      <p className="text-sm text-gray-300">Accede a tu cuenta existente</p>
                    </div>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </button>

                  <button
                    onClick={handleRegister}
                    className="w-full p-4 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div className="text-left">
                      <h4 className="font-medium">Crear Cuenta</h4>
                      <p className="text-sm text-gray-600">Regístrate para acceder a todas las funciones</p>
                    </div>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </button>

                  <Link href="/demo" className="block w-full p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-black">Ver Demo Completa</h4>
                        <p className="text-sm text-gray-600">Explora todas las funcionalidades de demostración</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Platform Info */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-black mb-4">Sobre HOP Events</h3>
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p>
                    HOP Events es la plataforma integral para la gestión de eventos con enfoque en seguridad,
                    cumplimiento normativo y acreditaciones. Ofrecemos herramientas avanzadas para organizar
                    eventos seguros y eficientes.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li>✅ Gestión de pólizas de seguros para eventos</li>
                    <li>✅ Sistema de acreditaciones digital</li>
                    <li>✅ Cumplimiento normativo automatizado</li>
                    <li>✅ Visualizaciones 3D interactivas</li>
                    <li>✅ Colaboración en tiempo real</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}