import { useEffect, useState } from 'react';

interface Session {
  accessToken: string;
  refreshToken: string;
  expires: number;
}

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar la sesión desde localStorage al montar el componente
  useEffect(() => {
    const loadSession = () => {
      // Solo ejecutar en el cliente
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        const savedSession = localStorage.getItem('directus_session');
        if (savedSession) {
          const parsedSession = JSON.parse(savedSession);
          
          // Verificar si la sesión ha expirado
          const now = Date.now();
          if (parsedSession.expires > now) {
            setSession(parsedSession);
          } else {
            // La sesión ha expirado, limpiarla
            localStorage.removeItem('directus_session');
            localStorage.removeItem('directus_token');
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
        localStorage.removeItem('directus_session');
        localStorage.removeItem('directus_token');
      } finally {
        setLoading(false);
      }
    };

    // Cargar después de que el componente se monte en el cliente
    loadSession();
  }, []);

  // Guardar la sesión en localStorage
  const saveSession = (newSession: Session) => {
    setSession(newSession);
    if (typeof window !== 'undefined') {
      localStorage.setItem('directus_session', JSON.stringify(newSession));
      localStorage.setItem('directus_token', newSession.accessToken);
    }
  };

  // Limpiar la sesión
  const clearSession = () => {
    setSession(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('directus_session');
      localStorage.removeItem('directus_token');
    }
  };

  // Verificar si la sesión es válida
  const isValid = () => {
    if (!session) return false;
    
    const now = Date.now();
    return session.expires > now;
  };

  // Obtener el tiempo restante de la sesión en segundos
  const getTimeLeft = () => {
    if (!session) return 0;
    
    const now = Date.now();
    return Math.max(0, Math.floor((session.expires - now) / 1000));
  };

  // Refrescar la sesión (esto se implementaría con la API de Directus)
  const refreshSession = async () => {
    try {
      // Aquí iría la lógica para refrescar el token usando el refreshToken
      // Por ahora, simulamos que la sesión se refresca extendiendo su tiempo de vida
      if (session && typeof window !== 'undefined') {
        const newSession = {
          ...session,
          expires: Date.now() + (24 * 60 * 60 * 1000), // 24 horas más
        };
        saveSession(newSession);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      clearSession();
      throw error;
    }
  };

  return {
    session,
    loading,
    saveSession,
    clearSession,
    isValid,
    getTimeLeft,
    refreshSession,
  };
};