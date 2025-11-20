// lib/directus.ts

import { Directus } from '@directus/sdk';
import { User } from './directus.types'; // Asume que tienes un archivo para tus tipos
                                        // Si no lo tienes, define la interfaz User aquí.

// Configuración:
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://rayner-seguros.6vlrrp.easypanel.host';

// 1. Inicializar la instancia de Directus
// La instancia principal no necesita un token fijo, sino que maneja la sesión del usuario.
const directus = new Directus<User>(directusUrl, {
  // Configuración de almacenamiento (cookies o localStorage) para guardar los tokens
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});

/**
 * Función para iniciar sesión usando el SDK.
 * El SDK maneja automáticamente:
 * 1. La llamada a /auth/login.
 * 2. Guardar el access_token y refresh_token en el storage configurado (localStorage).
 */
export async function login(email: string, password: string) {
  try {
    // El SDK devuelve el objeto de la sesión
    const result = await directus.auth.login({ email, password });
    
    // Opcional: Cargar el perfil del usuario después del login
    const user = await directus.users.me.read();
    
    return { session: result, user: user };
  } catch (error) {
    // Manejo de errores específicos del SDK
    console.error('Directus Login Failed:', error);
    throw new Error('Login failed. Check credentials or Directus permissions.');
  }
}

/**
 * Función para obtener el usuario actual.
 * El SDK automáticamente toma el access_token del storage y lo adjunta.
 * También intenta usar el refresh_token si el access_token ha expirado.
 */
export async function getCurrentUser() {
  try {
    // Si hay un token de sesión válido, lee el perfil del usuario.
    const user = await directus.users.me.read();
    return user;
  } catch (error) {
    // Si la lectura falla (ej. tokens inválidos o expirados), la sesión ha terminado.
    return null;
  }
}

/**
 * Función para cerrar la sesión.
 * El SDK se encarga de llamar a /auth/logout y limpiar el storage.
 */
export async function logout() {
  await directus.auth.logout();
  // Después de hacer logout, el token se limpia automáticamente del storage
}


// Exportar la instancia de Directus para otras peticiones (ej. leer items)
export { directus };