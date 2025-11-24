import { NextResponse } from 'next/server';

const DIRECTUS_URL = 'https://rayner-seguros.6vlrrp.easypanel.host';
const ADMIN_TOKEN = 'VVnbHPcI1S_BkjM7jG8xN7qXnLCq2O8V';

async function request(endpoint: string, method = 'GET', body: any = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
    };

    const options: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    };

    const response = await fetch(`${DIRECTUS_URL}${endpoint}`, options);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        // Ignore "collection already exists" or "field already exists" errors
        if (error.errors && (error.errors[0]?.code === 'RECORD_NOT_UNIQUE' || error.errors[0]?.code === 'INVALID_PAYLOAD')) {
            return null;
        }
        // If status is 403/401, throw error
        if (response.status === 401 || response.status === 403) {
            throw new Error(`Authentication failed: ${response.status}`);
        }
        // For other errors, just log and continue (idempotency)
        console.warn(`Request to ${endpoint} returned ${response.status}:`, JSON.stringify(error));
        return null;
    }

    if (response.status === 204) return null;
    return response.json();
}

async function createCollection(name: string, note: string) {
    console.log(`Creating collection "${name}"...`);
    await request('/collections', 'POST', {
        collection: name,
        schema: {},
        meta: {
            icon: 'box',
            note: note,
            hidden: false,
            singleton: false,
            archive_field: 'status',
            archive_app_filter: true,
            archive_value: 'archived',
            unarchive_value: 'draft',
            sort_field: 'date_created'
        }
    });
}

async function createField(collection: string, field: string, type: string, meta: any = {}, schema: any = {}) {
    console.log(`Creating field "${field}" in "${collection}"...`);
    await request(`/fields/${collection}`, 'POST', {
        field,
        type,
        meta: { ...meta, field },
        schema
    });
}

async function createM2OField(collection: string, field: string, relatedCollection: string) {
    console.log(`Creating M2O field "${field}" in "${collection}" -> "${relatedCollection}"...`);
    await request(`/fields/${collection}`, 'POST', {
        field,
        type: 'integer',
        meta: {
            interface: 'select-dropdown-m2o',
            special: ['m2o'],
            required: false
        },
        schema: {
            is_primary_key: false
        }
    });

    await request('/relations', 'POST', {
        collection: collection,
        field: field,
        related_collection: relatedCollection,
        schema: {
            on_delete: 'SET NULL'
        }
    });
}

export async function GET() {
    console.log('🚀 Starting Full Directus Schema Setup via API...');

    try {
        // --- 1. Create Collections ---
        const collections = [
            { name: 'events', note: 'Eventos' },
            { name: 'providers', note: 'Proveedores' },
            { name: 'team_members', note: 'Integrantes del Proveedor' },
            { name: 'document_requirements', note: 'Tipos de Documentos' },
            { name: 'provider_documents', note: 'Documentos de Proveedores' },
            { name: 'event_documents', note: 'Documentos Requeridos por Evento' }
        ];

        for (const col of collections) {
            await createCollection(col.name, col.note);
        }

        // --- 2. Create Fields ---

        // 2.1 Events
        await createField('events', 'title', 'string', { interface: 'input', required: true, width: 'full' });
        await createField('events', 'description', 'text', { interface: 'input-multiline', required: true, width: 'full' });
        await createField('events', 'start_date', 'dateTime', { interface: 'datetime', required: true, width: 'half' });
        await createField('events', 'end_date', 'dateTime', { interface: 'datetime', required: true, width: 'half' });
        await createField('events', 'location', 'string', { interface: 'input', required: true, width: 'full' });
        await createField('events', 'capacity', 'integer', { interface: 'input', required: true, width: 'half' });
        await createField('events', 'price', 'decimal', { interface: 'input', width: 'half' });
        await createField('events', 'category', 'string', {
            interface: 'select-dropdown', required: true, width: 'half', options: {
                choices: [
                    { text: 'Conferencia', value: 'conferencia' }, { text: 'Workshop', value: 'workshop' }, { text: 'Networking', value: 'networking' }
                ]
            }
        });
        await createField('events', 'requires_liquor_license', 'boolean', { interface: 'boolean', width: 'half' }, { default_value: false });
        await createField('events', 'status', 'string', {
            interface: 'select-dropdown', width: 'half', options: {
                choices: [
                    { text: 'Borrador', value: 'draft' }, { text: 'Publicado', value: 'published' }, { text: 'Cancelado', value: 'cancelled' }, { text: 'Completado', value: 'completed' }
                ]
            }
        }, { default_value: 'draft' });
        // Relationships
        await createM2OField('events', 'owner', 'directus_users');

        // 2.2 Providers
        await createField('providers', 'name', 'string', { interface: 'input', required: true, width: 'full' });
        await createField('providers', 'description', 'text', { interface: 'input-multiline', width: 'full' });
        await createField('providers', 'email', 'string', { interface: 'input', width: 'half' });
        await createField('providers', 'phone', 'string', { interface: 'input', width: 'half' });
        await createField('providers', 'contact_name', 'string', { interface: 'input', width: 'half' });
        await createField('providers', 'requires_liquor_license', 'boolean', { interface: 'boolean', width: 'half' }, { default_value: false });
        // Relationships
        await createM2OField('providers', 'event', 'events');

        // 2.3 Team Members
        await createField('team_members', 'name', 'string', { interface: 'input', required: true, width: 'full' });
        await createField('team_members', 'role', 'string', { interface: 'input', required: true, width: 'full' });
        // Relationships
        await createM2OField('team_members', 'provider', 'providers');

        // 2.4 Document Requirements
        await createField('document_requirements', 'type', 'string', {
            interface: 'select-dropdown', required: true, width: 'half', options: {
                choices: [
                    { text: 'RC', value: 'RC' }, { text: 'AP', value: 'AP' }, { text: 'ART', value: 'ART' }, { text: 'SS', value: 'SS' }, { text: 'Custom', value: 'CUSTOM' }
                ]
            }
        });
        await createField('document_requirements', 'name', 'string', { interface: 'input', required: true, width: 'half' });
        await createField('document_requirements', 'description', 'text', { interface: 'input-multiline', width: 'full' });
        await createField('document_requirements', 'is_required', 'boolean', { interface: 'boolean', width: 'half' }, { default_value: false });
        await createField('document_requirements', 'category', 'string', { interface: 'input', width: 'half' });

        // 2.5 Provider Documents
        await createField('provider_documents', 'status', 'string', {
            interface: 'select-dropdown', width: 'half', options: {
                choices: [
                    { text: 'Pendiente', value: 'pending' }, { text: 'Subido', value: 'uploaded' }, { text: 'Verificado', value: 'verified' }
                ]
            }
        }, { default_value: 'pending' });
        await createField('provider_documents', 'upload_url', 'string', { interface: 'input', width: 'full' });
        await createField('provider_documents', 'notes', 'text', { interface: 'input-multiline', width: 'full' });
        // Relationships
        await createM2OField('provider_documents', 'team_member', 'team_members');
        await createM2OField('provider_documents', 'document_type', 'document_requirements');

        // 2.6 Event Documents
        await createField('event_documents', 'is_required', 'boolean', { interface: 'boolean', width: 'half' }, { default_value: false });
        // Relationships
        await createM2OField('event_documents', 'event', 'events');
        await createM2OField('event_documents', 'document_type', 'document_requirements');


        // --- 3. Insert Sample Data ---
        console.log('Inserting sample data...');

        // 3.1 Document Requirements
        const docReqs = [
            { type: 'RC', name: 'Registro Civil', is_required: true },
            { type: 'ART', name: 'Seguro ART', is_required: true },
            { type: 'SS', name: 'Seguridad Social', is_required: false }
        ];
        const createdDocReqs = [];
        for (const doc of docReqs) {
            const res = await request('/items/document_requirements', 'POST', doc);
            if (res?.data) createdDocReqs.push(res.data);
        }

        // 3.2 Events
        const events = [
            {
                title: 'Conferencia Tech 2024',
                description: 'Evento anual de tecnología.',
                start_date: '2024-11-01T09:00:00',
                end_date: '2024-11-01T18:00:00',
                location: 'Buenos Aires',
                capacity: 500,
                category: 'conferencia',
                status: 'published'
            }
        ];
        const createdEvents = [];
        for (const evt of events) {
            const res = await request('/items/events', 'POST', evt);
            if (res?.data) createdEvents.push(res.data);
        }

        // 3.3 Link Events to Doc Requirements (Event Documents)
        if (createdEvents.length > 0 && createdDocReqs.length > 0) {
            await request('/items/event_documents', 'POST', {
                event: createdEvents[0].id,
                document_type: createdDocReqs[0].id,
                is_required: true
            });
        }

        // 3.4 Providers
        if (createdEvents.length > 0) {
            const provider = {
                name: 'Catering Deluxe',
                email: 'info@catering.com',
                event: createdEvents[0].id
            };
            const resProv = await request('/items/providers', 'POST', provider);

            // 3.5 Team Members
            if (resProv?.data) {
                const member = {
                    name: 'Juan Perez',
                    role: 'Chef',
                    provider: resProv.data.id
                };
                const resMember = await request('/items/team_members', 'POST', member);

                // 3.6 Provider Documents
                if (resMember?.data && createdDocReqs.length > 0) {
                    await request('/items/provider_documents', 'POST', {
                        team_member: resMember.data.id,
                        document_type: createdDocReqs[0].id,
                        status: 'pending'
                    });
                }
            }
        }

        return NextResponse.json({ message: '🎉 Full Schema Setup completed successfully!' });

    } catch (error: any) {
        console.error('❌ Setup failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
