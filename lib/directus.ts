// lib/directus.ts

// 1. Exportamos el tipo de usuario (Si tienes un archivo .types, puedes eliminar esta interfaz)
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  status: 'active' | 'inactive' | 'invited' | 'deleted';
  last_access?: string;
  token?: string;
  avatar?: string;
  theme?: 'light' | 'dark';
}

// 2. Importar los módulos correctos: createDirectus y extensiones
import { createDirectus, rest, authentication, Storage } from '@directus/sdk';

// Configuración:
// Usamos NEXT_PUBLIC_DIRECTUS_URL para que esté disponible en el cliente (Browser)
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://rayner-seguros.6vlrrp.easypanel.host';

// 3. Implementación de almacenamiento simple (localStorage)
// Necesitamos un objeto que simule el storage para que el SDK guarde los tokens
const customStorage: Storage = {
    get: (key) => {
        if (typeof window !== 'undefined') {
            return window.localStorage.getItem(key);
        }
        return null;
    },
    set: (key, value) => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, value);
        }
    },
    delete: (key) => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
        }
    },
};

// 4. Inicializar la instancia de Directus con el patrón correcto:
const directus = createDirectus<User>(directusUrl)
  .with(rest()) // Habilitar peticiones REST
  .with(authentication('json', { storage: customStorage })); // Habilitar autenticación con storage

/**
 * Iniciar sesión: Llama a /auth/login, guarda los tokens en localStorage.
 */
export async function login(email: string, password: string) {
  try {
    const result = await directus.auth.login({ email, password });
    
    // Leer el perfil del usuario autenticado
    const user = await directus.users.read('me'); 
    
    return { session: result, user: user };
  } catch (error) {
    console.error('Directus Login Failed:', error);
    // Re-lanza un error más amigable para la UI
    throw new Error('Login failed. Check credentials or Directus permissions.');
  }
}

/**
 * Obtener el usuario actual: Usa el token de localStorage. El SDK maneja el refresco.
 */
export async function getCurrentUser() {
  try {
    // Si hay un token de sesión válido, lee el perfil del usuario.
    const user = await directus.users.read('me'); 
    return user;
  } catch (error) {
    // La sesión ha expirado o es inválida
    return null;
  }
}

/**
 * Cerrar sesión: Llama a /auth/logout y limpia localStorage.
 */
export async function logout() {
  await directus.auth.logout();
}

/**
 * Hook de autenticación: Verifica si existe un token de sesión.
 */
export const useAuth = () => {
    // La lógica de autenticación se basa en si existe el token en el almacenamiento local
    const isAuthenticated = () => {
        if (typeof window === 'undefined') return false;
        // El SDK guarda el token de acceso bajo la clave "directus_access_token" por defecto.
        return !!localStorage.getItem('directus_access_token');
    };

    return {
        isAuthenticated,
        login,
        logout,
        getCurrentUser,
    };
};

// Exportar la instancia de Directus para otras peticiones (ej. leer items, aunque es mejor envolverlas)
export { directus };