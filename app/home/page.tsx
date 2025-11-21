'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import BackgroundAnimation3D from '@/components/BackgroundAnimation3D';

export default function HomePage() {
  const plotlyRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const loadPlotly = async () => {
      // Dynamically import Plotly
      const Plotly = (await import('plotly.js/lib/core')).default;
      await Plotly.register(await import('plotly.js/lib/bar'), await import('plotly.js/lib/pie'));
      
      // Chart 1: Event Growth
      const data1 = [{
        x: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        y: [12, 19, 15, 25, 22, 30],
        type: 'bar',
        marker: {
          color: '#333333',
          line: {
            color: '#000000',
            width: 1
          }
        }
      }];

      const layout1 = {
        title: 'Crecimiento de Eventos',
        font: { color: '#000000' },
        paper_bgcolor: '#FFFFFF',
        plot_bgcolor: '#FFFFFF',
        xaxis: {
          title: 'Meses',
          color: '#000000',
          gridcolor: '#CCCCCC'
        },
        yaxis: {
          title: 'Número de Eventos',
          color: '#000000',
          gridcolor: '#CCCCCC'
        },
        showlegend: false
      };

      if (plotlyRefs[0].current) {
        Plotly.newPlot(plotlyRefs[0].current, data1, layout1, {responsive: true});
      }

      // Chart 2: Event Types Distribution
      const data2 = [{
        values: [35, 25, 20, 20],
        labels: ['Conferencias', 'Workshops', 'Meetups', 'Webinars'],
        type: 'pie',
        marker: {
          colors: ['#333333', '#666666', '#999999', '#CCCCCC']
        }
      }];

      const layout2 = {
        title: 'Distribución de Tipos de Eventos',
        font: { color: '#000000' },
        paper_bgcolor: '#FFFFFF',
        plot_bgcolor: '#FFFFFF',
        showlegend: true
      };

      if (plotlyRefs[1].current) {
        Plotly.newPlot(plotlyRefs[1].current, data2, layout2, {responsive: true});
      }

      // Chart 3: Attendance Trend
      const data3 = [{
        x: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        y: [450, 520, 480, 610, 590, 720],
        type: 'scatter',
        mode: 'lines+markers',
        line: {
          color: '#000000',
          width: 2
        },
        marker: {
          color: '#333333',
          size: 6
        }
      }];

      const layout3 = {
        title: 'Tendencia de Asistencia',
        font: { color: '#000000' },
        paper_bgcolor: '#FFFFFF',
        plot_bgcolor: '#FFFFFF',
        xaxis: {
          title: 'Meses',
          color: '#000000',
          gridcolor: '#CCCCCC'
        },
        yaxis: {
          title: 'Número de Asistentes',
          color: '#000000',
          gridcolor: '#CCCCCC'
        },
        showlegend: false
      };

      if (plotlyRefs[2].current) {
        Plotly.newPlot(plotlyRefs[2].current, data3, layout3, {responsive: true});
      }
    };

    loadPlotly();
  }, []);

  return (
    <div className="min-h-screen bg-white relative">
      <BackgroundAnimation3D />
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Events Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Bienvenido a Events
            <span className="text-indigo-600"> Platform</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            La plataforma perfecta para gestionar y descubrir eventos.
            Crea, organiza y participa en eventos increíbles.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8 space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="rounded-md shadow">
              <Link
                href="/demo"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105"
              >
                🚀 Ver Demo
              </Link>
            </div>
            <div className="rounded-md shadow">
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all duration-300"
              >
                Ir al Dashboard
              </Link>
            </div>
            <div className="rounded-md shadow sm:mt-0">
              <Link
                href="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all duration-300"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">Análisis de Eventos</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Crecimiento de Eventos</h4>
              <div ref={plotlyRefs[0]} className="w-full h-64"></div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Evolución mensual del número de eventos creados en la plataforma.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Distribución de Tipos de Eventos</h4>
              <div ref={plotlyRefs[1]} className="w-full h-64"></div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Porcentaje de eventos por categoría en el último semestre.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Tendencia de Asistencia</h4>
              <div ref={plotlyRefs[2]} className="w-full h-64"></div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Evolución del número total de asistentes a eventos.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">Características</h3>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Eventos</h3>
              <p className="text-gray-600 text-sm">
                Crea, edita y organiza tus eventos con facilidad.
              </p>
              <div className="mt-4 w-full h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-indigo-600 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Participación</h3>
              <p className="text-gray-600 text-sm">
                Descubre y participa en eventos de tu interés.
              </p>
              <div className="mt-4 w-full h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-green-600 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Análisis</h3>
              <p className="text-gray-600 text-sm">
                Obtén insights detallados sobre tus eventos.
              </p>
              <div className="mt-4 w-full h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-purple-600 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 Events Platform. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}