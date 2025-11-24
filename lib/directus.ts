// lib/directus.ts

// Exportamos el tipo de usuario de Directus
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

// Configuración de Directus (DIRECTUS_URL puede usarse para peticiones públicas/anónimas)
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL || 'https://rayner-seguros.6vlrrp.easypanel.host';
const directusToken = process.env.DIRECTUS_TOKEN || '0bGJAHZnl24NIQ4l8v_BUcFXhBKAikwu'; // Token estático de Super Admin/API

/**
 * Función para obtener los headers de autorización.
 * Prioriza el token dinámico del usuario (de localStorage) para peticiones de sesión.
 */
const getHeaders = (useUserToken = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 1. Intentar obtener el token de usuario (solo en el lado del cliente)
  if (useUserToken && typeof window !== 'undefined') {
    const userToken = localStorage.getItem('directus_access_token');
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
      return headers; // Usar el token dinámico de sesión
    }
  }

  // 2. Si no hay token de usuario dinámico, usar el token estático (solo para ADMIN/API)
  if (directusToken) {
    headers['Authorization'] = `Bearer ${directusToken}`;
  }

  return headers;
};

// Funciones de autenticación
export const login = async (email: string, password: string) => {
  const response = await fetch(`${directusUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();

  // 🚨 CAMBIO CLAVE: Guardar los tokens dinámicos en localStorage 🚨
  if (typeof window !== 'undefined' && data.data.access_token) {
    localStorage.setItem('directus_access_token', data.data.access_token);
    localStorage.setItem('directus_refresh_token', data.data.refresh_token);
  }

  return data.data;
};

export const logout = async () => {
  const response = await fetch(`${directusUrl}/auth/logout`, {
    method: 'POST',
    // Usar el token dinámico para el logout
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }

  // 🚨 CAMBIO CLAVE: Limpiar los tokens de localStorage 🚨
  if (typeof window !== 'undefined') {
    localStorage.removeItem('directus_access_token');
    localStorage.removeItem('directus_refresh_token');
  }

  return response.json();
};

export const refresh = async (refreshToken: string) => {
  // En este caso, el token refresh debe ser inyectado como un cuerpo de la petición.
  const response = await fetch(`${directusUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Refresh failed');
  }

  const data = await response.json();

  // 🚨 CAMBIO CLAVE: Guardar los nuevos tokens 🚨
  if (typeof window !== 'undefined' && data.data.access_token) {
    localStorage.setItem('directus_access_token', data.data.access_token);
    localStorage.setItem('directus_refresh_token', data.data.refresh_token);
  }

  return data.data;
};

// Función de registro de usuarios
export const register = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  try {
    // Intentar obtener todos los roles disponibles
    const rolesResponse = await fetch(`${directusUrl}/roles`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${directusToken}`,
      },
    });

    let roleId = null;

    if (rolesResponse.ok) {
      const rolesData = await rolesResponse.json();
      console.log('Available roles:', rolesData.data); // Debug

      // Buscar el rol "User" (case insensitive)
      const userRole = rolesData.data?.find((role: any) =>
        role.name?.toLowerCase() === 'user'
      );

      if (userRole) {
        roleId = userRole.id;
      } else if (rolesData.data && rolesData.data.length > 0) {
        // Si no hay rol "User", usar el primer rol disponible que no sea admin
        const nonAdminRole = rolesData.data.find((role: any) =>
          role.name?.toLowerCase() !== 'administrator' &&
          role.name?.toLowerCase() !== 'admin'
        );
        roleId = nonAdminRole?.id || rolesData.data[0].id;
        console.log('Using fallback role:', roleId);
      }
    }

    // Crear el usuario
    const userData: any = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      status: 'active',
    };

    // Solo agregar el rol si se encontró uno
    if (roleId) {
      userData.role = roleId;
    }

    const response = await fetch(`${directusUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${directusToken}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Registration error:', error);
      throw new Error(error.errors?.[0]?.message || 'Registration failed');
    }

    return response.json();
  } catch (error) {
    console.error('Register function error:', error);
    throw error;
  }
};

// Funciones de usuario
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // LLama a getHeaders que ahora usa el token dinámico de localStorage
    const response = await fetch(`${directusUrl}/users/me`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      // Si la respuesta es 401, ya no es solo el token estático, sino una sesión inválida.
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const updateCurrentUser = async (data: Partial<User>) => {
  const response = await fetch(`${directusUrl}/users/me`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Update failed');
  }

  return response.json();
};

// Funciones genéricas para items (Mantener getHeaders() para que use el token de usuario)
export const readItems = async <T>(collection: string, params?: any) => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (key === 'fields' && Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else if (typeof value === 'object' && value !== null) {
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = `${directusUrl}/${collection}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Read items failed');
  }

  const data = await response.json();
  return data.data;
};

export const readItem = async <T>(collection: string, id: string, params?: any) => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (key === 'fields' && Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else if (typeof value === 'object' && value !== null) {
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = `${directusUrl}/${collection}/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Read item failed');
  }

  const data = await response.json();
  return data.data;
};

export const createItem = async <T>(collection: string, data: any) => {
  const response = await fetch(`${directusUrl}/${collection}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Create item failed');
  }

  const result = await response.json();
  return result.data;
};

export const updateItem = async <T>(collection: string, id: string, data: any) => {
  const response = await fetch(`${directusUrl}/${collection}/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Update item failed');
  }

  const result = await response.json();
  return result.data;
};

export const deleteItem = async (collection: string, id: string) => {
  const response = await fetch(`${directusUrl}/${collection}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Delete item failed');
    throw new Error('Delete item failed');
  }

  return response.json();
};

// Helper function to get asset URL
export function getAssetUrl(fileId: string | null | undefined): string | null {
  if (!fileId) return null;

  // Si fileId ya es una URL completa, retornarla
  if (fileId.startsWith('http')) return fileId;

  // Construir la URL del asset
  const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL || directusUrl;
  return `${baseUrl}/assets/${fileId}`;
}

// Upload file to Directus
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${directusUrl}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('directus_access_token') : directusToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'File upload failed');
  }

  const data = await response.json();
  return data.data.id; // Return the file ID
};

// Create a new event
export const createEvent = async (eventData: {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  status?: string;
}) => {
  const response = await fetch(`${directusUrl}/items/eventos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      ...eventData,
      status: eventData.status || 'draft'
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'Failed to create event');
  }

  return response.json();
};

// Read events filtered by user
export const readUserEvents = async (userId: string) => {
  const response = await fetch(`${directusUrl}/items/eventos?filter[user_created][_eq]=${userId}&sort=-date_created&fields=*`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to read user events');
  }

  const data = await response.json();
  return data.data;
};

// ============================================
// PROVIDERS MANAGEMENT
// ============================================

// Create a new provider
export const createProvider = async (providerData: {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  contact_name?: string;
  evento: string; // Event ID
  status?: string;
}) => {
  const response = await fetch(`${directusUrl}/items/proveedores`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      ...providerData,
      status: providerData.status || 'draft'
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'Failed to create provider');
  }

  return response.json();
};

// Read providers for a specific event
export const readEventProviders = async (eventId: string) => {
  const response = await fetch(
    `${directusUrl}/items/proveedores?filter[evento][_eq]=${eventId}&sort=sort,date_created&fields=*`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to read event providers');
  }

  const data = await response.json();
  return data.data;
};

// Update a provider
export const updateProvider = async (id: string, providerData: Partial<{
  name: string;
  description: string;
  email: string;
  phone: string;
  contact_name: string;
  status: string;
}>) => {
  const response = await fetch(`${directusUrl}/items/proveedores/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(providerData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'Failed to update provider');
  }

  return response.json();
};

// Delete a provider
export const deleteProvider = async (id: string) => {
  const response = await fetch(`${directusUrl}/items/proveedores/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'Failed to delete provider');
  }

  return response.json();
};

// Hook personalizado para manejar la autenticación
export const useAuth = () => {
  // La lógica de autenticación se basa en si existe el token en el almacenamiento local
  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('directus_access_token');
  };

  return {
    isAuthenticated,
    login,
    logout,
    refresh,
    getCurrentUser,
  };
};

// La función getAuthHeaders de abajo es redundante y se ha eliminado
// o se ha integrado en el getHeaders principal.
// Si necesitas un getHeaders solo para el lado del servidor, deberías crear una variante explícita.
