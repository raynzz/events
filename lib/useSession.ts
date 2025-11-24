import { useEffect, useState, useCallback } from 'react';

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
  const saveSession = useCallback((newSession: Session) => {
    setSession(newSession);
    if (typeof window !== 'undefined') {
      localStorage.setItem('directus_session', JSON.stringify(newSession));
      localStorage.setItem('directus_access_token', newSession.accessToken);
    }
  }, []);

  // Limpiar la sesión
  const clearSession = useCallback(() => {
    setSession(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('directus_session');
      localStorage.removeItem('directus_access_token');
    }
  }, []);

  // Verificar si la sesión es válida
  const isValid = useCallback(() => {
    // Primero verificar si hay un token directo en localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('directus_access_token');
      if (token) {
        // Si hay token, verificar si hay sesión con expiración
        if (session) {
          const now = Date.now();
          return session.expires > now;
        }
        // Si hay token pero no sesión, asumir que es válido
        return true;
      }
    }

    // Si no hay token directo, verificar la sesión
    if (!session) return false;

    const now = Date.now();
    return session.expires > now;
  }, [session]);

  // Obtener el tiempo restante de la sesión en segundos
  const getTimeLeft = useCallback(() => {
    if (!session) return 0;

    const now = Date.now();
    return Math.max(0, Math.floor((session.expires - now) / 1000));
  }, [session]);

  // Refrescar la sesión (esto se implementaría con la API de Directus)
  const refreshSession = useCallback(async () => {
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
  }, [session, saveSession, clearSession]);

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