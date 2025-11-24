# Cambios para Filtrar Eventos por Usuario

## Paso 1: Modificar `lib/directus.ts`

### 1.1 Agregar campo `Responsable` a la función `createEvent`

Busca la línea 375 y agrega `Responsable?: string;` después de `status?: string;`:

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
  Responsable?: string; // <-- AGREGAR ESTA LÍNEA
}) => {
```

### 1.2 Agregar función `readUserEvents`

Después de la función `createEvent` (después de la línea 392, antes de la línea 394), agrega esta nueva función:

```typescript
// Read events filtered by user
export const readUserEvents = async (userId: string) => {
  const response = await fetch(`${directusUrl}/items/events?filter[Responsable][_eq]=${userId}&sort=-date_created&fields=*`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to read user events');
  }

  const data = await response.json();
  return data.data;
};
```

## Paso 2: Modificar `app/events/create/page.tsx`

### 2.1 Agregar validación de usuario

En la función `handleSubmit` (línea 59), justo después de `setIsSubmitting(true);`, agrega:

```typescript
// Verificar que el usuario esté logueado
if (!user?.id) {
  alert('Debes estar logueado para crear un evento');
  setIsSubmitting(false);
  return;
}
```

### 2.2 Agregar campo Responsable al eventData

En el objeto `eventData` (alrededor de la línea 66-75), agrega `Responsable: user.id,` después de `status: 'draft',`:

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
  Responsable: user.id, // <-- AGREGAR ESTA LÍNEA
};
```

## Paso 3: Modificar `app/events/page.tsx`

### 3.1 Cambiar la función fetchEvents

Reemplaza todo el contenido del `useEffect` (líneas 28-61) con este código:

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
}, [user]); // <-- IMPORTANTE: Cambiar la dependencia de [] a [user]
```

## Resumen de Cambios

1. **lib/directus.ts**: Agregado campo `Responsable` opcional y función `readUserEvents`
2. **app/events/create/page.tsx**: Validación de usuario y asignación de `Responsable` al crear evento
3. **app/events/page.tsx**: Filtrado de eventos por usuario logueado

Una vez hechos estos cambios, los eventos se crearán con el usuario responsable y la lista mostrará solo los eventos del usuario logueado.
