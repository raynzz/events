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

// Configuración de Directus
const directusUrl = process.env.DIRECTUS_URL || 'https://rayner-seguros.6vlrrp.easypanel.host';
const directusToken = process.env.DIRECTUS_TOKEN || '';

// Headers base para las peticiones
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
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
  return data;
};

export const logout = async () => {
  const response = await fetch(`${directusUrl}/auth/logout`, {
    method: 'POST',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  
  return response.json();
};

export const refresh = async () => {
  const response = await fetch(`${directusUrl}/auth/refresh`, {
    method: 'POST',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Refresh failed');
  }
  
  const data = await response.json();
  return data;
};

// Funciones de usuario
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${directusUrl}/users/me`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
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

// Funciones genéricas para items
export const readItems = async <T>(collection: string, params?: any) => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.keys(params).forEach(key => {
      searchParams.append(key, JSON.stringify(params[key]));
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
      searchParams.append(key, JSON.stringify(params[key]));
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
  }
  
  return response.json();
};

// Hook personalizado para manejar la autenticación
export const useAuth = () => {
  const isAuthenticated = () => {
    return !!directusToken;
  };

  return {
    isAuthenticated,
    login,
    logout,
    refresh,
    getCurrentUser,
  };
};

// Contexto de autenticación para Next.js
export const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (directusToken) {
    headers['Authorization'] = `Bearer ${directusToken}`;
  }
  
  return headers;
};