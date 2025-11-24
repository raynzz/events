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
        console.warn(`Request to ${endpoint} returned ${response.status}:`, JSON.stringify(error));
        return null;
    }

    if (response.status === 204) return null;
    return response.json();
}

export async function GET() {
    console.log('🚀 Starting Full Migration: Expositores/Integrantes -> Providers/TeamMembers...');

    try {
        // 1. Ensure Schema (Add missing fields)
        console.log('--- Ensuring Schema ---');

        // Providers: stand_number
        await request('/fields/providers', 'POST', {
            field: 'stand_number',
            type: 'string',
            meta: { interface: 'input', width: 'half', note: 'Número de Stand (Migrado)' }
        });

        // Team Members: dni, birth_date
        await request('/fields/team_members', 'POST', {
            field: 'dni',
            type: 'string',
            meta: { interface: 'input', width: 'half', note: 'DNI (Migrado)' }
        });
        await request('/fields/team_members', 'POST', {
            field: 'birth_date',
            type: 'date',
            meta: { interface: 'datetime', width: 'half', note: 'Fecha de Nacimiento (Migrado)' }
        });


        // 2. Fetch Source Data
        console.log('--- Fetching Source Data ---');
        const expositoresRes = await request('/items/expositores?limit=-1');
        const expositores = expositoresRes?.data || [];

        const integrantesRes = await request('/items/Integrantes?limit=-1');
        const integrantes = integrantesRes?.data || [];

        console.log(`Found ${expositores.length} expositores and ${integrantes.length} integrantes.`);

        const results = {
            expositores_processed: 0,
            integrantes_processed: 0,
            providers_created: 0,
            team_members_created: 0,
            errors: [] as string[]
        };

        // Map old Expositores ID -> New Providers ID
        const providerIdMap = new Map<number, number>();

        // 3. Migrate Expositores -> Providers
        for (const expo of expositores) {
            results.expositores_processed++;
            const name = expo.Marca || `${expo.Nombre} ${expo.Apellido}`;
            const contactName = `${expo.Nombre} ${expo.Apellido}`;

            console.log(`Processing Expositor: ${name} (ID: ${expo.id})`);

            // 3.1 Create Provider
            const providerPayload = {
                name: name,
                description: expo.Notas,
                email: expo.email,
                phone: expo.telefono,
                contact_name: contactName,
                requires_liquor_license: expo.Permiso_bebidas || false,
                stand_number: expo.Stand ? String(expo.Stand) : null,
            };

            const providerRes = await request('/items/providers', 'POST', providerPayload);

            if (providerRes?.data) {
                results.providers_created++;
                const newProviderId = providerRes.data.id;
                providerIdMap.set(expo.id, newProviderId);

                // 3.2 Create "Primary Contact" Team Member
                if (contactName) {
                    const memberPayload = {
                        name: contactName,
                        role: expo.Cargo || 'Contacto Principal',
                        provider: newProviderId,
                        // Expositor doesn't have DNI/BirthDate in the main table usually, but if they did we'd map it
                    };

                    const memberRes = await request('/items/team_members', 'POST', memberPayload);
                    if (memberRes?.data) {
                        results.team_members_created++;
                    }
                }
            } else {
                results.errors.push(`Failed to create provider for Expositor ID ${expo.id}: ${name}`);
            }
        }

        // 4. Migrate Integrantes -> Team Members
        for (const integrante of integrantes) {
            results.integrantes_processed++;
            const fullName = `${integrante.Nombre} ${integrante.Apellido}`;
            const oldProviderId = integrante.Perteneciente;

            console.log(`Processing Integrante: ${fullName} (Belongs to Old ID: ${oldProviderId})`);

            if (!oldProviderId) {
                results.errors.push(`Integrante ${fullName} has no 'Perteneciente' ID.`);
                continue;
            }

            const newProviderId = providerIdMap.get(oldProviderId);

            if (!newProviderId) {
                results.errors.push(`Could not find new Provider ID for Integrante ${fullName} (Old Provider ID: ${oldProviderId})`);
                continue;
            }

            const memberPayload = {
                name: fullName,
                role: 'Integrante', // Default role since Integrantes doesn't seem to have a 'Cargo' field based on schema
                provider: newProviderId,
                dni: integrante.DNI,
                birth_date: integrante.Fecha_nacimiento
            };

            const memberRes = await request('/items/team_members', 'POST', memberPayload);
            if (memberRes?.data) {
                results.team_members_created++;
            } else {
                results.errors.push(`Failed to create team member for Integrante: ${fullName}`);
            }
        }

        return NextResponse.json({
            message: '🎉 Full Migration completed!',
            results
        });

    } catch (error: any) {
        console.error('❌ Migration failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
