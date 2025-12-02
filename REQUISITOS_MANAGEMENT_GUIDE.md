# Guía de Gestión de Requisitos - Fase 5

## Resumen

Se ha implementado un sistema completo de gestión de requisitos para eventos que permite manejar requisitos globales y específicos, asignarlos a participantes, y hacer seguimiento del cumplimiento.

## Componentes Implementados

### 1. RequirementsManager (`components/RequirementsManager.tsx`)
**Componente principal** que proporciona una interfaz completa con 4 pestañas:

#### 📊 Pestaña Resumen
- **Vista general** de todos los requisitos del evento
- **Estadísticas**:
  - Total de requisitos
  - Requisitos globales vs específicos
  - Requisitos cumplidos vs asignados
- **Progreso por participante** con barras de visualización

#### ⚙️ Pestaña Gestionar
- **Lista de requisitos** organizados por tipo:
  - 🌐 Requisitos Globales (aplican a todos los eventos)
  - 🎯 Requisitos Específicos del Evento
- **Asignación visual** a participantes con estado de cada requisito
- **Creación de nuevos requisitos** mediante modal

#### 📋 Pestaña Cumplimiento
- **Selector de participante** para ver estado detallado
- **Gestión de estados** de requisitos:
  - ⏳ Pendiente
  - ✅ Aprobado
  - ❌ Rechazado
- **Barra de progreso** individual por participante
- **Notas de revisión** para cada requisito

#### 📈 Pestaña Reportes
- **Estadísticas de cumplimiento**:
  - Participantes Completos
  - En Progreso
  - Sin Iniciar
- **Tabla detallada** con:
  - Nombre del participante
  - Total de requisitos asignados
  - Requisitos completados
  - Porcentaje de progreso
  - Estado general

### 2. RequirementAssignmentModal (`components/RequirementAssignmentModal.tsx`)
**Modal de asignación** que permite:
- **Selección de participante** del evento
- **Asignación masiva** de requisitos
- **Visualización separada** de requisitos globales y específicos
- **Resumen de selección** antes de confirmar

### 3. RequirementsDashboard (`components/RequirementsDashboard.tsx`)
**Componente de integración** que:
- Proporciona **vista rápida** de participantes y sus requisitos
- **Botones de acción** para asignación rápida
- **Mini barras de progreso** por participante
- **Integración completa** con RequirementsManager

### 4. Integración con Dashboard Principal
Se agregó una **tercera pestaña "Requisitos"** al dashboard del evento que incluye todo el sistema de gestión.

## Funcionalidades Principales

### ✅ Gestión de Requisitos Globales vs Específicos
- **Requisitos Globales**: Se crean una vez y aplican a todos los eventos
- **Requisitos Específicos**: Se crean por evento individual
- **Visualización diferenciada** con iconos y etiquetas distintivas

### ✅ Asignación a Participantes
- **Asignación individual** por participante
- **Asignación masiva** a múltiples participantes
- **Prevención de duplicados** - no asigna dos veces el mismo requisito

### ✅ Seguimiento de Cumplimiento
- **Estados por requisito**: Pendiente, Aprobado, Rechazado
- **Cálculo automático** de porcentajes de cumplimiento
- **Vista de progreso** individual y general

### ✅ Reportes y Análisis
- **Métricas en tiempo real** de cumplimiento
- **Identificación** de participantes completos, en progreso, o sin iniciar
- **Exportación visual** mediante tablas y gráficos

## Estructura de Datos

### EventoRequisito
```typescript
interface EventoRequisito {
  id: number;
  nombre: string;
  descripcion?: string;
  detalle_clausulas?: string;
  suma_asegurada?: number;
  es_global: boolean;           // true = global, false = específico del evento
  evento_id?: number;           // null para requisitos globales
  status: 'active' | 'inactive';
  // ... timestamps y relaciones
}
```

### ParticipanteRequisito
```typescript
interface ParticipanteRequisito {
  id: number;
  evento_participante_id: number;
  evento_requisito_id: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fecha_vencimiento?: string;
  documento_adjunto?: string;
  notas_revision?: string;
  // ... timestamps y relaciones
}
```

## Uso del Sistema

### 1. Acceder a la Gestión de Requisitos
1. Ir al dashboard del evento (`/events/[id]/dashboard`)
2. Hacer clic en la pestaña **"Requisitos"**

### 2. Crear un Requisito
1. En la pestaña **"Resumen"**, hacer clic en **"+ Crear Requisito"**
2. Completar el formulario:
   - **Nombre** (obligatorio)
   - **Descripción**
   - **Detalle de Cláusulas**
   - **Suma Asegurada**
   - **Marcar como Global** si debe aplicar a todos los eventos
3. Hacer clic en **"Crear Requisito"**

### 3. Asignar Requisitos a Participantes
1. Hacer clic en **"+ Asignar Requisitos"**
2. **Seleccionar participante** del evento
3. **Marcar requisitos** a asignar (globales y específicos)
4. Confirmar la asignación

### 4. Gestionar Cumplimiento
1. Ir a la pestaña **"Cumplimiento"**
2. **Seleccionar participante** del dropdown
3. **Cambiar estado** de cada requisito según corresponda
4. **Agregar notas** de revisión si es necesario

### 5. Revisar Reportes
1. Ir a la pestaña **"Reportes"**
2. Ver **estadísticas generales** de cumplimiento
3. Revisar **tabla detallada** con progreso por participante

## Características Técnicas

### ✅ Integración con Directus
- **API completa** para gestión de requisitos
- **Tipos TypeScript** definidos para toda la estructura
- **Manejo de errores** robusto
- **Optimización** de consultas

### ✅ Interfaz de Usuario
- **Diseño responsive** para desktop y mobile
- **Iconos intuitivos** para diferenciar tipos de requisitos
- **Colores consistentes** para estados (verde=aprobado, amarillo=pendiente, rojo=rechazado)
- **Animaciones suaves** para transiciones

### ✅ Experiencia de Usuario
- **Navegación por pestañas** intuitiva
- **Carga rápida** con estados de loading
- **Confirmaciones** para acciones importantes
- **Mensajes de error** informativos

## Beneficios Implementados

### 🎯 Para Organizadores de Eventos
- **Centralización** de todos los requisitos del evento
- **Visibilidad completa** del estado de cumplimiento
- **Identificación rápida** de participantes con problemas
- **Reportes automatizados** para toma de decisiones

### 📋 Para Participantes/Proveedores
- **Claridad** sobre qué documentos se requieren
- **Seguimiento** del estado de sus requisitos
- **Notificaciones** visuales de pendientes
- **Transparencia** en el proceso de revisión

### 🔄 Para el Sistema
- **Escalabilidad** mediante requisitos globales
- **Flexibilidad** para requisitos específicos por evento
- **Integridad** de datos mediante validaciones
- **Rendimiento** optimizado con consultas eficientes

## Próximos Pasos Sugeridos

1. **Notificaciones automáticas** por email cuando cambia el estado de requisitos
2. **Dashboard ejecutivo** con métricas agregadas de todos los eventos
3. **Integración con calendarios** para fechas de vencimiento
4. **Firma digital** de documentos directamente en la plataforma
5. **API pública** para que proveedores consulten el estado de sus requisitos

---

## Conclusión

El sistema de gestión de requisitos implementado en la Fase 5 proporciona una solución completa, escalable e intuitiva para manejar los requisitos de eventos. Permite diferenciar entre requisitos globales y específicos, asignarlos eficientemente a participantes, hacer seguimiento del cumplimiento y generar reportes detallados, todo integrado seamlessly con el dashboard existente del evento.