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
const directusUrl = 'https://rayner-seguros.6vlrrp.easypanel.host';
const directusToken = '0bGJAHZnl24NIQ4l8v_BUcFXhBKAikwu';

/**
 * Función para obtener los headers de autorización.
 * Prioriza el token dinámico del usuario (de localStorage) para peticiones de sesión.
 */
const getHeaders = (useUserToken = true, fallbackToStatic = true) => {
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

  // 2. Si no hay token de usuario dinámico y se permite fallback, usar el token estático
  if (fallbackToStatic && directusToken) {
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
  const baseUrl = directusUrl;
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
  // Intentar diferentes nombres de campo de relación
  const possibleFields = ['evento', 'event', 'events_id', 'event_id'];
  let lastError = null;
  
  for (const field of possibleFields) {
    try {
      console.log(`Trying to create provider with field: ${field}`);
      const response = await fetch(`${directusUrl}/items/proveedores`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...providerData,
          [field]: providerData.evento, // Usar el campo correcto
          status: providerData.status || 'draft'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Provider created successfully with field: ${field}`);
        return data;
      } else {
        const error = await response.json();
        lastError = error;
        console.log(`Error with field ${field}:`, error);
      }
    } catch (error) {
      console.log(`Exception with field ${field}:`, error);
      lastError = error;
    }
  }
  
  // Si ningún campo funcionó, lanzar el último error
  throw new Error(`Failed to create provider. Tried fields: ${possibleFields.join(', ')}. Last error: ${lastError?.errors?.[0]?.message || lastError}`);
};

// Read providers for a specific event
export const readEventProviders = async (eventId: string) => {
  // Intentar diferentes nombres de campo de relación
  const possibleFields = ['evento', 'event', 'events_id', 'event_id'];
  
  for (const field of possibleFields) {
    try {
      console.log(`Trying to fetch providers with field: ${field}`);
      const response = await fetch(
        `${directusUrl}/items/proveedores?filter[${field}][_eq]=${eventId}&sort=sort,date_created&fields=*`,
        {
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      if (data.data && data.data.length > 0) {
        console.log(`Found providers using field: ${field}`);
        return data.data;
      }
    } catch (error) {
      console.log(`Error with field ${field}:`, error);
      continue;
    }
  }
  
  // Si ningún campo funcionó, lanzar un error
  throw new Error(`Failed to read event providers. Tried fields: ${possibleFields.join(', ')}`);
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

// ============================================
// INTEGRANTES MANAGEMENT
// ============================================

// ============================================
// NUEVA ESTRUCTURA DE DATOS - MIGRACIÓN COMPLETA
// ============================================
// Tipo para eventos (actualizado para nueva estructura)
export interface Evento {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  date_created: string;
  date_updated: string;
  user_created: number;
  user_updated: number;
  
  // Relaciones
  participantes?: EventoParticipante[];
  requisitos?: EventoRequisito[];
}

// Tipo para proveedores (catálogo general)
export interface Proveedor {
  id: number;
  nombre: string;
  descripcion?: string;
  email?: string;
  telefono?: string;
  contacto?: string;
  rubro?: string;
  status: 'active' | 'inactive';
  date_created: string;
  date_updated: string;
  user_created: number;
  user_updated: number;
}

// Tipo para eventos_participantes (relación evento-proveedor)
export interface EventoParticipante {
  id: number;
  evento_id: number;
  proveedor_id: number;
  status: 'pending' | 'approved' | 'rejected';
  fecha_asignacion: string;
  notas?: string;
  hash_publico?: string; // Para enlace externo
  date_created: string;
  date_updated: string;
  user_created: number;
  user_updated: number;
  
  // Relaciones
  evento?: Evento;
  proveedor?: Proveedor;
  integrantes?: Integrante[];
  requisitos?: EventoRequisito[];
}

// Tipo para eventos_requisitos (requisitos disponibles)
export interface EventoRequisito {
  id: number;
  Nombre: string; // ← Campo correcto con mayúscula
  descripcion?: string;
  detalle?: string; // ← Campo correcto
  suma_asegurada?: number;
  es_global: boolean;
  evento_id?: number; // null para requisitos globales
  status: 'active' | 'inactive';
  date_created: string;
  date_updated: string;
  user_created: number;
  user_updated: number;
  
  // Relaciones
  evento?: Evento;
  participantes?: EventoParticipante[];
}

// Tipo para participantes (integrantes del proveedor en el evento)
export interface Integrante {
  id: number;
  evento_participante_id: number; // Relación con eventos_participantes
  nombre: string;
  apellido: string;
  documento: string;
  fecha_nacimiento: string;
  cargo?: string;
  telefono?: string;
  email?: string;
  status: 'active' | 'inactive';
  sort: number;
  date_created: string;
  date_updated: string;
  user_created: number;
  user_updated: number;
  
  // Relaciones
  evento_participante?: EventoParticipante;
}

// Tipo para la tabla pivot participantes-requisitos
export interface ParticipanteRequisito {
  id: number;
  evento_participante_id: number;
  evento_requisito_id: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fecha_vencimiento?: string;
  documento_adjunto?: string;
  notas_revision?: string;
  date_created: string;
  date_updated: string;
  user_created: number;
  user_updated: number;
  
  // Relaciones
  evento_participante?: EventoParticipante;
  evento_requisito?: EventoRequisito;
}

// Create a new integrante
export const createIntegrante = async (integranteData: {
  nombre: string;
  apellido: string;
  documento: string;
  fecha_nacimiento: string;
  proveedor?: string;
  evento?: string;
  status?: string;
}) => {
  const response = await fetch(`${directusUrl}/items/integrantes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      ...integranteData,
      status: integranteData.status || 'active'
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'Failed to create integrante');
  }

  return response.json();
};

// Read integrantes for a specific provider
export const readProviderIntegrantes = async (providerId: string) => {
  const response = await fetch(
    `${directusUrl}/items/integrantes?filter[proveedor][_eq]=${providerId}&sort=sort,nombre,apellido&fields=*`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to read provider integrantes');
  }

  const data = await response.json();
  return data.data;
};

// Read integrantes for a specific event
export const readEventIntegrantes = async (eventId: string) => {
  const response = await fetch(
    `${directusUrl}/items/integrantes?filter[evento][_eq]=${eventId}&sort=sort,nombre,apellido&fields=*`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to read event integrantes');
  }

  const data = await response.json();
  return data.data;
};

// Read all integrantes
export const readIntegrantes = async (params?: any) => {
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

  const url = `${directusUrl}/items/integrantes${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Read integrantes failed');
  }

  const data = await response.json();
  return data.data;
};

// Update an integrante
export const updateIntegrante = async (id: string, integranteData: Partial<{
  nombre: string;
  apellido: string;
  documento: string;
  fecha_nacimiento: string;
  proveedor?: string;
  evento?: string;
  status: string;
}>) => {
  const response = await fetch(`${directusUrl}/items/integrantes/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(integranteData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'Failed to update integrante');
  }

  return response.json();
};

// Delete an integrante
export const deleteIntegrante = async (id: string) => {
  const response = await fetch(`${directusUrl}/items/integrantes/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'Failed to delete integrante');
  }

  return response.json();
};

// ============================================
// FUNCIONES PARA NUEVA ESTRUCTURA DE DATOS
// ============================================

// Crear participante (instancia de proveedor en evento)
export const createEventParticipant = async (participantData: {
  evento_id: string | number;
  proveedor_id: string | number;
  status?: 'pending' | 'approved' | 'rejected';
  notas?: string;
}) => {
  // Generar hash único para enlace público
  const hash_publico = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
  
  const response = await fetch(`${directusUrl}/items/eventos_participantes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      ...participantData,
      fecha_asignacion: new Date().toISOString(),
      hash_publico,
      status: participantData.status || 'pending'
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'Failed to create event participant');
  }

  return response.json();
};

// Obtener participantes de un evento
export const getEventParticipants = async (eventId: string | number) => {
  const response = await fetch(
    `${directusUrl}/items/eventos_participantes?filter[evento_id][_eq]=${eventId}&sort=date_created&fields=*`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to read event participants');
  }

  const data = await response.json();
  return data.data;
};

// Asignar requisitos a un participante
export const assignRequirementsToParticipant = async (
  participantId: string | number,
  requirementIds: (string | number)[]
) => {
  const assignments = requirementIds.map(reqId => ({
    evento_participante_id: participantId,
    evento_requisito_id: reqId,
    estado: 'pendiente'
  }));

  const response = await fetch(`${directusUrl}/items/participantes_requisitos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(assignments),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'Failed to assign requirements');
  }

  return response.json();
};

// Obtener requisitos de un evento (globales + específicos)
export const getEventRequirements = async (eventId?: string | number) => {
  let url = `${directusUrl}/items/eventos_requisitos?filter[status][_eq]=active&sort=es_global,nombre`;
  
  if (eventId) {
    // Obtener requisitos globales + específicos del evento
    url += `&filter[evento_id][_in]=${eventId},`;
  }

  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to read event requirements');
  }

  const data = await response.json();
  return data.data;
};

// Obtener solo requisitos globales
export const getGlobalRequirements = async () => {
  try {
    console.log('🔍 Obteniendo requisitos globales...');
    
    // URL de la consulta
    const queryUrl = `${directusUrl}/items/eventos_requisitos?filter[status][_eq]=active&filter[es_global][_eq]=true&sort=nombre&fields=*`;
    console.log('📡 URL de consulta:', queryUrl);
    
    const response = await fetch(queryUrl, {
      headers: getHeaders(),
    });

    console.log('📨 Respuesta status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en respuesta:', errorText);
      throw new Error(`Failed to read global requirements: HTTP ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Datos de requisitos globales recibidos:', data);
    console.log('📋 Total de requisitos globales encontrados:', data.data?.length || 0);
    
    return data.data || [];
  } catch (error) {
    console.error('💥 Error en getGlobalRequirements:', error);
    // En lugar de lanzar error, devolver array vacío para no romper la UI
    return [];
  }
};

// Crear requisito global
export const createGlobalRequirement = async (requirementData: {
  Nombre: string; // ← Campo correcto con mayúscula
  descripcion?: string;
  detalle?: string; // ← Campo correcto
  suma_asegurada?: number;
}) => {
  try {
    console.log('🔍 Creando requisito global:', requirementData);
    
    const response = await fetch(`${directusUrl}/items/eventos_requisitos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        Nombre: requirementData.Nombre, // ← Campo correcto con mayúscula
        descripcion: requirementData.descripcion,
        detalle: requirementData.detalle, // ← Campo correcto
        suma_asegurada: requirementData.suma_asegurada,
        es_global: true,
        evento_id: null,
        status: 'active'
      }),
    });

    console.log('📨 Respuesta status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en respuesta:', errorText);
      throw new Error(`Failed to create global requirement: HTTP ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Requisito global creado exitosamente:', data);
    
    return data;
  } catch (error) {
    console.error('💥 Error en createGlobalRequirement:', error);
    throw error;
  }
};

// Obtener requisitos asignados a un participante
export const getParticipantRequirements = async (participantId: string | number) => {
  const response = await fetch(
    `${directusUrl}/items/participantes_requisitos?filter[evento_participante_id][_eq]=${participantId}&fields=*`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to read participant requirements');
  }

  const data = await response.json();
  return data.data;
};

// Crear integrante para un participante
export const createParticipantIntegrante = async (integranteData: {
  evento_participante_id: string | number;
  nombre: string;
  apellido: string;
  documento: string;
  fecha_nacimiento: string;
  cargo?: string;
  telefono?: string;
  email?: string;
}) => {
  const response = await fetch(`${directusUrl}/items/integrantes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      ...integranteData,
      status: 'active'
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'Failed to create integrante');
  }

  return response.json();
};

// Obtener integrantes de un participante
export const getParticipantIntegrantes = async (participantId: string | number) => {
  const response = await fetch(
    `${directusUrl}/items/integrantes?filter[evento_participante_id][_eq]=${participantId}&sort=sort,nombre,apellido`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to read participant integrantes');
  }

  const data = await response.json();
  return data.data;
};

// Buscar participante por hash público
export const getParticipantByHash = async (hash: string) => {
  const response = await fetch(
    `${directusUrl}/items/eventos_participantes?filter[hash_publico][_eq]=${hash}&fields=*`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Participant not found');
  }

  const data = await response.json();
  return data.data?.[0] || null;
};

// Actualizar estado de documento de requisito
export const updateRequirementDocument = async (
  participantRequirementId: string | number,
  documentData: {
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    documento_adjunto?: string;
    notas_revision?: string;
  }
) => {
  const response = await fetch(`${directusUrl}/items/participantes_requisitos/${participantRequirementId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(documentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'Failed to update requirement document');
  }

  return response.json();
};

// Obtener todos los proveedores (catálogo)
export const getAllProviders = async () => {
  console.log('🔍 Cargando todos los proveedores...');
  
  try {
    const response = await fetch(
      `${directusUrl}/items/proveedores?filter[status][_eq]=active&sort=nombre`,
      {
        headers: getHeaders(),
      }
    );

    console.log('📡 Respuesta de proveedores status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en respuesta de proveedores:', errorText);
      throw new Error(`Failed to read providers: HTTP ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Datos de proveedores recibidos:', data);
    console.log('📋 Total de proveedores encontrados:', data.data?.length || 0);
    
    return data.data || [];
  } catch (error) {
    console.error('💥 Error en getAllProviders:', error);
    // En lugar de lanzar error, devolver array vacío para no romper la UI
    return [];
  }
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
