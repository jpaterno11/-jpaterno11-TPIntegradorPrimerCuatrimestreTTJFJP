import config from './src/configs/db-config.js';
import pkg from 'pg';
const { Client } = pkg;

async function debugEvent() {
    const client = new Client(config);
    
    try {
        await client.connect();
        console.log('🔍 Conectando a la base de datos...');
        
        // Verificar eventos existentes
        const events = await client.query('SELECT id, name, id_creator_user FROM events ORDER BY id DESC LIMIT 5');
        
        console.log('📋 Eventos existentes:');
        events.rows.forEach(event => {
            console.log(`  - ID: ${event.id}, Nombre: ${event.name}, Creador: ${event.id_creator_user} (tipo: ${typeof event.id_creator_user})`);
        });
        
        // Verificar usuarios existentes
        const users = await client.query('SELECT id, username, first_name, last_name FROM users ORDER BY id DESC LIMIT 5');
        
        console.log('\n👥 Usuarios existentes:');
        users.rows.forEach(user => {
            console.log(`  - ID: ${user.id}, Username: ${user.username}, Nombre: ${user.first_name} ${user.last_name} (tipo: ${typeof user.id})`);
        });
        
        // Si hay eventos, probar la comparación
        if (events.rows.length > 0) {
            const event = events.rows[0];
            const user = users.rows[0];
            
            console.log('\n🧪 Probando comparación de IDs:');
            console.log(`Evento creador ID: ${event.id_creator_user} (tipo: ${typeof event.id_creator_user})`);
            console.log(`Usuario actual ID: ${user.id} (tipo: ${typeof user.id})`);
            console.log(`Comparación directa: ${event.id_creator_user !== user.id}`);
            console.log(`Comparación con parseInt: ${parseInt(event.id_creator_user) !== parseInt(user.id)}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
        console.log('🔌 Conexión cerrada');
    }
}

debugEvent(); 