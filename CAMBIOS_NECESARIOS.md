Hola,

He intentado implementar los cambios solicitados pero hay problemas con las herramientas de edición de archivos. Los archivos se están corrompiendo al intentar modificarlos.

Te voy a explicar exactamente qué cambios necesitas hacer manualmente para que funcione:

## 1. Modificar `lib/directus.ts`

### Agregar campo `responsable` a la función `createEvent` (línea 366-392):

Cambia la interfaz de `createEvent` para incluir el campo `responsable`:

```typescript
export const createEvent = async (eventData: {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number;
  price: number;
  requires_liquor_license: boolean;
  status?: string;
  responsable?: string; // <-- AGREGAR ESTA LÍNEA
}) => {
  // ... resto del código igual
};
```

### Agregar nueva función `readUserEvents` (después de la función `createEvent`, línea 393):

```typescript
// Read events filtered by user
export const readUserEvents = async (userId: string) => {
  const response = await fetch(`${directusUrl}/items/events?filter[responsable][_eq]=${userId}&sort=-date_created&fields=*`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to read user events');
  }

  const data = await response.json();
  return data.data;
};
```

## 2. Modificar `app/events/create/page.tsx`

En la función `handleSubmit` (línea 59-91), agregar el campo `responsable` al objeto `eventData`:

```typescript
const eventData = {
  title: formData.title,
  description: formData.description,
  start_date: formData.startDate,
  end_date: formData.endDate,
  location: formData.location,
  capacity: formData.capacity,
  price: formData.price,
  requires_liquor_license: formData.requiresLiquorLicense,
  status: 'draft',
  responsable: user.id, // <-- AGREGAR ESTA LÍNEA
};
```

También agregar una validación al inicio de `handleSubmit`:

```typescript
// Verificar que el usuario esté logueado
if (!user?.id) {
  alert('Debes estar logueado para crear un evento');
  return;
}
```

## 3. Modificar `app/events/page.tsx`

En el `useEffect` que carga los eventos (línea 27-61), cambiar para usar `readUserEvents`:

```typescript
useEffect(() => {
  const fetchEvents = async () => {
    try {
      // Solo cargar eventos si el usuario está logueado
      if (!user?.id) {
        setEvents([]);
        return;
      }

      const { readUserEvents } = await import('@/lib/directus');
      const data = await readUserEvents(user.id);

      const mappedEvents: Event[] = data.map((item: any) => ({
        id: item.id,
        title: item.name,
        description: item.description,
        startDate: item.start_date,
        endDate: item.end_date,
        location: item.location,
        capacity: item.capacity,
        price: item.price,
        category: 'conferencia',
        requiresLiquorLicense: item.requires_liquor_license,
        status: item.status,
        createdAt: item.date_created
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  fetchEvents();
}, [user]); // <-- CAMBIAR LA DEPENDENCIA DE [] a [user]
```

## Verificación en Directus

Antes de hacer estos cambios, verifica en tu Directus que:
1. El campo `responsable` existe en la colección `events`
2. Tiene una relación many-to-one con `directus_users`
3. El nombre del campo es exactamente `responsable`

¿Quieres que te ayude a verificar esto primero o prefieres hacer los cambios manualmente?
