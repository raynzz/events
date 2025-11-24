/**
 * Script para verificar y crear el rol "User" en Directus
 * 
 * Uso:
 * node scripts/check-roles.js
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://rayner-seguros.6vlrrp.easypanel.host';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '0bGJAHZnl24NIQ4l8v_BUcFXhBKAikwu';

async function checkAndCreateUserRole() {
    try {
        console.log('🔍 Checking existing roles in Directus...\n');

        // Obtener todos los roles
        const rolesResponse = await fetch(`${DIRECTUS_URL}/roles`, {
            headers: {
                'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
            },
        });

        if (!rolesResponse.ok) {
            throw new Error(`Failed to fetch roles: ${rolesResponse.statusText}`);
        }

        const rolesData = await rolesResponse.json();
        console.log('📋 Existing roles:');
        rolesData.data.forEach(role => {
            console.log(`  - ${role.name} (ID: ${role.id})`);
        });

        // Verificar si existe el rol "User"
        const userRole = rolesData.data.find(role =>
            role.name.toLowerCase() === 'user'
        );

        if (userRole) {
            console.log('\n✅ Role "User" already exists!');
            console.log(`   ID: ${userRole.id}`);
            return;
        }

        console.log('\n⚠️  Role "User" not found. Creating it...');

        // Crear el rol "User"
        const createRoleResponse = await fetch(`${DIRECTUS_URL}/roles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
            },
            body: JSON.stringify({
                name: 'User',
                icon: 'person',
                description: 'Standard user role for registered users',
                admin_access: false,
                app_access: true,
            }),
        });

        if (!createRoleResponse.ok) {
            const error = await createRoleResponse.json();
            throw new Error(`Failed to create role: ${JSON.stringify(error)}`);
        }

        const newRole = await createRoleResponse.json();
        console.log('✅ Role "User" created successfully!');
        console.log(`   ID: ${newRole.data.id}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAndCreateUserRole();
