import config from '../configs/db-config.js';
import pkg from 'pg';
const { Client } = pkg;

export class EventLocationRepository {
    async findAllByUser(userId, limit = 15, offset = 0) {
        const client = new Client(config);
        try {
            await client.connect();
            
            const countQuery = `
                SELECT COUNT(*) FROM event_locations WHERE id_creator_user = $1
            `;
            const countResult = await client.query(countQuery, [userId]);
            const total = parseInt(countResult.rows[0].count);

            const query = `
                SELECT 
                    el.*,
                    json_build_object(
                        'id', l.id,
                        'name', l.name,
                        'latitude', l.latitude,
                        'longitude', l.longitude,
                        'province', json_build_object(
                            'id', p.id,
                            'name', p.name,
                            'full_name', p.full_name,
                            'latitude', p.latitude,
                            'longitude', p.longitude
                        )
                    ) as location
                FROM event_locations el
                JOIN locations l ON el.id_location = l.id
                JOIN provinces p ON l.id_province = p.id
                WHERE el.id_creator_user = $1
                ORDER BY el.id
                LIMIT $2 OFFSET $3
            `;
            
            const result = await client.query(query, [userId, limit, offset]);

            return {
                collection: result.rows,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: total
                }
            };
        } finally {
            await client.end();
        }
    }

    async findById(id, userId) {
        const client = new Client(config);
        try {
            await client.connect();
            
            const query = `
                SELECT 
                    el.*,
                    json_build_object(
                        'id', l.id,
                        'name', l.name,
                        'latitude', l.latitude,
                        'longitude', l.longitude,
                        'province', json_build_object(
                            'id', p.id,
                            'name', p.name,
                            'full_name', p.full_name,
                            'latitude', p.latitude,
                            'longitude', p.longitude
                        )
                    ) as location
                FROM event_locations el
                JOIN locations l ON el.id_location = l.id
                JOIN provinces p ON l.id_province = p.id
                WHERE el.id = $1 AND el.id_creator_user = $2
            `;
            
            const result = await client.query(query, [id, userId]);
            return result.rows[0] || null;
        } finally {
            await client.end();
        }
    }

    async create(locationData) {
        const client = new Client(config);
        try {
            await client.connect();
            
            // Check if location exists
            const locationCheck = await client.query(
                'SELECT id FROM locations WHERE id = $1',
                [locationData.id_location]
            );
            
            if (locationCheck.rows.length === 0) {
                throw new Error('La ubicación especificada no existe');
            }

            const result = await client.query(
                `INSERT INTO event_locations (name, full_address, id_location, 
                max_capacity, latitude, longitude, id_creator_user) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [locationData.name, locationData.full_address, locationData.id_location, 
                locationData.max_capacity, locationData.latitude, locationData.longitude, 
                locationData.id_creator_user]
            );

            return result.rows[0];
        } finally {
            await client.end();
        }
    }

    async update(id, locationData, userId) {
        const client = new Client(config);
        try {
            await client.connect();
            
            // Check if location belongs to user
            const checkQuery = 'SELECT id_creator_user FROM event_locations WHERE id = $1';
            const checkResult = await client.query(checkQuery, [id]);
            
            if (checkResult.rows.length === 0) {
                return null; // Location not found
            }
            
            if (checkResult.rows[0].id_creator_user !== userId) {
                throw new Error('No autorizado para editar esta ubicación');
            }

            const result = await client.query(
                `UPDATE event_locations SET name = $1, full_address = $2, id_location = $3, 
                max_capacity = $4, latitude = $5, longitude = $6 
                WHERE id = $7 RETURNING *`,
                [locationData.name, locationData.full_address, locationData.id_location, 
                locationData.max_capacity, locationData.latitude, locationData.longitude, id]
            );

            return result.rows[0];
        } finally {
            await client.end();
        }
    }

    async delete(id, userId) {
        const client = new Client(config);
        try {
            await client.connect();
            
            // Check if location belongs to user
            const checkQuery = 'SELECT id_creator_user FROM event_locations WHERE id = $1';
            const checkResult = await client.query(checkQuery, [id]);
            
            if (checkResult.rows.length === 0) {
                return null; // Location not found
            }
            
            if (checkResult.rows[0].id_creator_user !== userId) {
                throw new Error('No autorizado para eliminar esta ubicación');
            }

            // Check if there are events using this location
            const eventCheck = await client.query(
                'SELECT COUNT(*) FROM events WHERE id_event_location = $1',
                [id]
            );
            
            if (parseInt(eventCheck.rows[0].count) > 0) {
                throw new Error('No se puede eliminar una ubicación que está siendo utilizada por eventos');
            }

            const result = await client.query('DELETE FROM event_locations WHERE id = $1 RETURNING *', [id]);
            return result.rows[0];
        } finally {
            await client.end();
        }
    }
} 