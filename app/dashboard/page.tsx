'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import FluidSimulation3D from '@/components/FluidSimulation3D';
import DataVisualization3D from '@/components/DataVisualization3D';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Si el usuario está cargando, no hacemos nada
    if (loading) return;
    
    // Verificar si estamos en modo demo
    if (typeof window !== 'undefined') {
      const demoMode = localStorage.getItem('demo_mode') === 'true';
      setIsDemoMode(demoMode);
      
      // Limpiar el flag después de usarlo
      if (demoMode) {
        localStorage.removeItem('demo_mode');
      }
    }
  }, [loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Determinar si es modo invitado o usuario autenticado
  const isGuestMode = !user;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-black">
                Events Platform
              </Link>
              <nav className="ml-6 flex space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-black text-sm font-medium text-black"
                >
                  Dashboard
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-black hover:border-gray-300"
                >
                  Eventos
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-black hover:border-gray-300"
                >
                  Perfil
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/events/create"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                + Nuevo Evento
              </Link>
              
              <div className="relative">
                <button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-black focus:outline-none">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {isGuestMode || isDemoMode ? '👤' : (user?.first_name?.[0] || user?.email?.[0] || 'U')}
                    </span>
                  </div>
                  <span className="hidden md:block">
                    {isGuestMode ? 'Invitado' : isDemoMode ? 'Usuario Demo' : user?.first_name || user?.email}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden z-50">
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Configuración
                    </Link>
                    <div className="border-t border-gray-100"></div>
                    {isGuestMode ? (
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Iniciar sesión
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Cerrar sesión
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6">
              Panel de Control
            </h2>
            
            {/* Main content area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Stats */}
              <div className="lg:col-span-2 space-y-8">

                {/* Demo 3D Visualization - Only shown in demo mode */}
                {isDemoMode && (
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🌊 Simulación de Fluidos 3D</h3>
                      <div className="h-64 rounded-lg overflow-hidden bg-black/5">
                        <FluidSimulation3D />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Visualización de partículas con comportamiento fluido dinámico
                      </p>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Visualización de Datos con Shaders</h3>
                      <div className="h-64 rounded-lg overflow-hidden bg-black/5">
                        <DataVisualization3D />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Geometría 3D animada con shaders personalizados en tiempo real
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-black mb-4">Acciones Rápidas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/events/create">
                      <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mb-3">
                          <span className="text-white text-sm">+</span>
                        </div>
                        <h4 className="font-medium text-black">Nuevo Evento</h4>
                        <p className="text-sm text-gray-600 mt-1">Crear un evento nuevo</p>
                      </div>
                    </Link>
                    
                    <Link href="/events">
                      <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mb-3">
                          <span className="text-white text-sm">📅</span>
                        </div>
                        <h4 className="font-medium text-black">Ver Eventos</h4>
                        <p className="text-sm text-gray-600 mt-1">Todos tus eventos</p>
                      </div>
                    </Link>
                    
                    <Link href="/events/calendar">
                      <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mb-3">
                          <span className="text-white text-sm">📆</span>
                        </div>
                        <h4 className="font-medium text-black">Calendario</h4>
                        <p className="text-sm text-gray-600 mt-1">Vista mensual</p>
                      </div>
                    </Link>
                    
                    <Link href="/analytics">
                      <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mb-3">
                          <span className="text-white text-sm">📊</span>
                        </div>
                        <h4 className="font-medium text-black">Análisis</h4>
                        <p className="text-sm text-gray-600 mt-1">Estadísticas</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-black mb-4">Actividad Reciente</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-black">Evento "Conferencia Tech" creado</p>
                          <p className="text-sm text-gray-500">Hace 2 horas</p>
                        </div>
                      </div>
                      <Link href="/events/1" className="text-sm text-black hover:text-gray-700 underline">
                        Ver detalles
                      </Link>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-black">Nuevo registro en "Workshop de React"</p>
                          <p className="text-sm text-gray-500">Hace 5 horas</p>
                        </div>
                      </div>
                      <Link href="/events/2" className="text-sm text-black hover:text-gray-700 underline">
                        Ver detalles
                      </Link>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-black">Recordatorio: "Meetup de Desarrollo"</p>
                          <p className="text-sm text-gray-500">Mañana a las 18:00</p>
                        </div>
                      </div>
                      <Link href="/events/3" className="text-sm text-black hover:text-gray-700 underline">
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column - Guest Notice or additional info */}
              <div className="space-y-6">
                {/* Guest Notice */}
                {isGuestMode && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Modo Invitado:</strong> Estás viendo una versión de demostración del dashboard.
                      <Link href="/login" className="underline ml-1">Inicia sesión</Link> para acceder a todas las funcionalidades.
                    </p>
                  </div>
                )}

                {/* Demo Notice */}
                {isDemoMode && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>🚀 Modo Demo 3D:</strong> Disfruta de visualizaciones 3D interactivas con simulación de fluidos y shaders avanzados.
                    </p>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-black mb-4">Resumen Rápido</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Eventos este mes</span>
                      <span className="text-sm font-medium text-black">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Asistentes totales</span>
                      <span className="text-sm font-medium text-black">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tasa de asistencia</span>
                      <span className="text-sm font-medium text-black">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Próximo evento</span>
                      <span className="text-sm font-medium text-black">Hoy</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}