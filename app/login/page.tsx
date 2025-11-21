'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '@/components/LoginForm';
import React from 'react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Manejo de searchParams con useSearchParams hook
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSkipLogin = () => {
    router.push(callbackUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Para continuar, inicia sesión con tu cuenta
          </p>
        </div>

        <div className="mt-4">
          <button
            onClick={handleSkipLogin}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Continuar como Invitado
          </button>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Accederás al dashboard con datos de demostración
          </p>
        </div>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O</span>
            </div>
          </div>

          <div className="mt-6">
            <LoginForm callbackUrl={callbackUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
