'use client';

import { useAuth } from '@/contexts/AuthContext';
import IntegratedProviderAssignment from '@/components/IntegratedProviderAssignment';
import Link from 'next/link';

export default function EventProvidersPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/events/${params.id}/dashboard`} className="text-xl font-bold text-black">
                ← Volver al Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-black">Gestión de Proveedores</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-black">
              Evento ID: {params.id}
            </h2>
            <p className="text-gray-600 mt-1">
              Asigna proveedores al evento y gestiona sus requisitos
            </p>
          </div>
          
          {/* Integrated Provider Assignment Workflow */}
          <IntegratedProviderAssignment 
            eventId={params.id} 
            onComplete={() => console.log('Provider assignment completed')}
          />
        </div>
      </main>
    </div>
  );
}