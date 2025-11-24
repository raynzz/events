'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '@/components/LoginForm';
import React, { Suspense } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Manejo de searchParams con useSearchParams hook
  const callbackUrl = searchParams.get('callbackUrl') || '/';

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

        <div className="mt-8">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
    </div >
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
