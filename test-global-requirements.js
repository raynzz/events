// test-global-requirements.js
// Script para diagnosticar problemas con los requisitos globales

const directusUrl = 'https://rayner-seguros.6vlrrp.easypanel.host';
const directusToken = '0bGJAHZnl24NIQ4l8v_BUcFXhBKAikwu';

async function testGlobalRequirements() {
  console.log('🔍 Iniciando diagnóstico de requisitos globales...\n');
  
  try {
    // Test 1: Verificar conexión básica
    console.log('📡 Test 1: Verificando conexión a Directus...');
    const healthResponse = await fetch(`${directusUrl}/server/health`);
    console.log('✅ Conexión exitosa:', healthResponse.status);
    
    // Test 2: Obtener todos los requisitos
    console.log('\n📋 Test 2: Obteniendo todos los requisitos...');
    const allRequirementsResponse = await fetch(
      `${directusUrl}/items/eventos_requisitos?fields=*`,
      {
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!allRequirementsResponse.ok) {
      throw new Error(`HTTP ${allRequirementsResponse.status}`);
    }
    
    const allRequirementsData = await allRequirementsResponse.json();
    console.log('✅ Total de requisitos encontrados:', allRequirementsData.data?.length || 0);
    
    // Test 3: Obtener solo requisitos globales
    console.log('\n🌐 Test 3: Obteniendo requisitos globales...');
    const globalRequirementsResponse = await fetch(
      `${directusUrl}/items/eventos_requisitos?filter[status][_eq]=active&filter[es_global][_eq]=true&sort=nombre&fields=*`,
      {
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!globalRequirementsResponse.ok) {
      throw new Error(`HTTP ${globalRequirementsResponse.status}`);
    }
    
    const globalRequirementsData = await globalRequirementsResponse.json();
    console.log('✅ Total de requisitos globales encontrados:', globalRequirementsData.data?.length || 0);
    
    // Test 4: Mostrar detalles de requisitos globales
    if (globalRequirementsData.data && globalRequirementsData.data.length > 0) {
      console.log('\n📝 Detalles de requisitos globales:');
      globalRequirementsData.data.forEach((req, index) => {
        console.log(`  ${index + 1}. ID: ${req.id}`);
        console.log(`     Nombre: ${req.Nombre || req.nombre}`);
        console.log(`     Descripción: ${req.descripcion || 'Sin descripción'}`);
        console.log(`     Es global: ${req.es_global}`);
        console.log(`     Estado: ${req.status}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️ No se encontraron requisitos globales');
      console.log('💡 Sugerencia: Crea un requisito global usando la interfaz');
    }
    
    // Test 5: Verificar estructura de la tabla
    console.log('\n🏗️ Test 5: Verificando estructura de la tabla...');
    console.log('Tabla: eventos_requisitos');
    console.log('Campos esperados: id, Nombre, descripcion, es_global, status');
    
    if (allRequirementsData.data && allRequirementsData.data.length > 0) {
      const sampleReq = allRequirementsData.data[0];
      console.log('Campos encontrados en el primer registro:');
      Object.keys(sampleReq).forEach(key => {
        console.log(`  - ${key}: ${typeof sampleReq[key]}`);
      });
    }
    
    console.log('\n🎉 Diagnóstico completado');
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar el diagnóstico
testGlobalRequirements();