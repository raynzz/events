'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si el usuario está cargando, no hacemos nada
    if (loading) return;
    
    // Si el usuario está autenticado, lo redirigimos al dashboard
    if (user) {
      router.push('/dashboard');
    }
    // Si no está autenticado, se queda en la home pública
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

  // Si el usuario está autenticado, no renderizamos nada porque ya lo redirigimos
  if (user) {
    return null;
  }

  // Si no está autenticado, redirigimos a la home pública
  return router.push('/home');
}
