'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    // Trigger animations on mount
    setIsVisible(true);
    
    // Auto-rotate features
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Gestión Inteligente",
      description: "Crea y organiza eventos con herramientas avanzadas de automatización",
      icon: "🚀"
    },
    {
      title: "Seguridad y Cumplimiento",
      description: "Gestión de pólizas de seguros y acreditaciones para eventos",
      icon: "🛡️"
    },
    {
      title: "Colaboración Fluida",
      description: "Trabaja en equipo con herramientas de colaboración integradas",
      icon: "🤝"
    },
    {
      title: "Gestión de Documentos",
      description: "Sistema integral de manejo de documentos y permisos",
      icon: "📋"
    }
  ];

  const stats = [
    { number: "1000+", label: "Eventos Seguros" },
    { number: "50K+", label: "Acreditaciones" },
    { number: "98%", label: "Cumplimiento" },
    { number: "24/7", label: "Soporte" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center transition-colors duration-300">
                <span className="text-white dark:text-black font-bold text-sm">H</span>
              </div>
              <h1 className="text-xl font-bold text-black dark:text-white transition-colors duration-300">HOP Events</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <h2 className="text-4xl md:text-5xl font-light mb-6 leading-tight">
                La plataforma para gestionar
                <br />
                <span className="font-normal">eventos seguros</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed transition-colors duration-300">
                Soluciones integrales para la gestión de pólizas de seguros, 
                acreditaciones y cumplimiento normativo en eventos.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/demo"
                  className="group relative px-8 py-4 text-lg font-semibold text-white bg-black dark:bg-blue-600 rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center space-x-2">
                    <span>Ver Demo</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                
                <Link
                  href="/dashboard"
                  className="group relative px-8 py-4 text-lg font-semibold text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center space-x-2">
                    <span>Ir al Dashboard</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>

            {/* Empty container - removed fluid animation */}
            <div className="h-96 bg-gray-50 dark:bg-gray-800 rounded-2xl transition-colors duration-300"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center group"
              >
                <div className="text-4xl md:text-5xl font-light mb-2 group-hover:scale-110 transition-transform duration-300 text-gray-900 dark:text-white">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-light mb-4 text-gray-900 dark:text-white transition-colors duration-300">
              Características 
              <span className="font-normal">esenciales</span>
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-300">
              Descubre la plataforma que transforma la gestión de seguridad y cumplimiento en eventos
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-12 h-12 bg-black dark:bg-blue-600 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-medium mb-2 text-gray-900 dark:text-white transition-colors duration-300">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed transition-colors duration-300">
                  {feature.description.split('. ')[0]}.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 dark:text-gray-400 transition-colors duration-300">
            <p className="text-lg mb-2">HOP Events - Seguridad y cumplimiento para eventos extraordinarios</p>
            <p className="text-sm">&copy; 2024. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}