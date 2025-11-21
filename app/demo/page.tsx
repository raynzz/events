'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    // Establecer modo demo en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_mode', 'true');
    }
    
    // Redirigir al dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="text-center max-w-md">
        <div className="relative">
          {/* Elemento 3D animado con CSS */}
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <div className="text-4xl">🚀</div>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur opacity-30 animate-pulse"></div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Accediendo a Demo</h1>
        <p className="text-gray-600 mb-6">
          Estamos preparando tu experiencia de demostración con visualizaciones 3D increíbles...
        </p>
        
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-2 bg-gray-200 rounded-full animate-pulse delay-100"></div>
          <div className="h-2 bg-gray-200 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
}