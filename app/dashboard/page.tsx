'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirección ya manejada en useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  Events Platform
                </Link>
              </div>
              <nav className="ml-6 flex space-x-8">
                <Link 
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium text-gray-900"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/events"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Eventos
                </Link>
                <Link 
                  href="/profile"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Perfil
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                Bienvenido, {user.first_name || user.email}
              </span>
              <Link
                href="/login"
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Cerrar sesión
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Panel de Control</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">E</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Eventos Creados</p>
                    <p className="text-2xl font-semibold text-blue-900">12</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">P</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Eventos Participados</p>
                    <p className="text-2xl font-semibold text-green-900">8</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">A</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Asistentes Totales</p>
                    <p className="text-2xl font-semibold text-purple-900">156</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/events/create">
                  <div className="bg-indigo-50 p-4 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
                      <span className="text-white text-sm">+</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Nuevo Evento</h4>
                    <p className="text-sm text-gray-600 mt-1">Crear un evento nuevo</p>
                  </div>
                </Link>
                
                <Link href="/events">
                  <div className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-3">
                      <span className="text-white text-sm">📅</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Ver Eventos</h4>
                    <p className="text-sm text-gray-600 mt-1">Todos tus eventos</p>
                  </div>
                </Link>
                
                <Link href="/events/calendar">
                  <div className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                      <span className="text-white text-sm">📆</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Calendario</h4>
                    <p className="text-sm text-gray-600 mt-1">Vista mensual</p>
                  </div>
                </Link>
                
                <Link href="/analytics">
                  <div className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mb-3">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Análisis</h4>
                    <p className="text-sm text-gray-600 mt-1">Estadísticas</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Evento "Conferencia Tech" creado</p>
                      <p className="text-sm text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  <Link href="/events/1" className="text-sm text-indigo-600 hover:text-indigo-800">
                    Ver detalles
                  </Link>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Nuevo registro en "Workshop de React"</p>
                      <p className="text-sm text-gray-500">Hace 5 horas</p>
                    </div>
                  </div>
                  <Link href="/events/2" className="text-sm text-indigo-600 hover:text-indigo-800">
                    Ver detalles
                  </Link>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Recordatorio: "Meetup de Desarrollo"</p>
                      <p className="text-sm text-gray-500">Mañana a las 18:00</p>
                    </div>
                  </div>
                  <Link href="/events/3" className="text-sm text-indigo-600 hover:text-indigo-800">
                    Ver detalles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}