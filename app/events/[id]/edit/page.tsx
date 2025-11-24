'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { readItem, updateItem } from '@/lib/directus';

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  date_created: string;
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = use(params);

  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await readItem('items/eventos', id, { fields: ['*'] });
        setEvent(data);
        setFormData({
          title: data.title,
          description: data.description,
          startDate: data.start_date, // Keep as is for datetime-local input, or format if needed
          endDate: data.end_date,
          location: data.location
        });
      } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!event) return;
    setIsSaving(true);
    try {
      await updateItem('items/eventos', id, {
        title: formData.title,
        description: formData.description,
        start_date: formData.startDate,
        end_date: formData.endDate,
        location: formData.location
      });
      alert('Evento actualizado exitosamente');
      router.push(`/events/${id}`);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error al actualizar el evento');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/events" className="text-xl font-bold text-black">
                  ← Volver a Eventos
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-black mb-2">Evento no encontrado</h2>
            <p className="text-gray-600 mb-6">El evento que buscas no existe o no tienes permiso para editarlo.</p>
            <Link href="/events" className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
              Volver a la lista de eventos
            </Link>
          </div>
        </main>
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
              <Link href={`/events/${id}`} className="text-xl font-bold text-black flex items-center">
                ← Volver al Evento
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-black">Editar Evento</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-black mb-6">Información Básica del Evento</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Evento *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black h-32"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => router.push(`/events/${id}`)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
              disabled={isSaving || !formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.location}
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}