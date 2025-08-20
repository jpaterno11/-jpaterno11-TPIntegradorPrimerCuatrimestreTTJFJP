import config from '../configs/db-config.js';
import pkg from 'pg';
const { Client } = pkg;

export class EventRepository {
    async findAll(filters = {}) {
        const client = new Client(config);
        try {
            await client.connect();
            
            let whereClause = 'WHERE 1=1';
            const params = [];
            let paramIndex = 1;

            if (filters.name) {
                whereClause += ` AND e.name ILIKE $${paramIndex}`;
                params.push(`%${filters.name}%`);
                paramIndex++;
            }

            if (filters.startdate) {
                whereClause += ` AND DATE(e.start_date) = $${paramIndex}`;
                params.push(filters.startdate);
                paramIndex++;
            }

            if (filters.tag) {
                whereClause += ` AND EXISTS (
                    SELECT 1 FROM event_tags et 
                    JOIN tags t ON et.id_tag = t.id 
                    WHERE et.id_event = e.id AND t.name ILIKE $${paramIndex}
                )`;
                params.push(`%${filters.tag}%`);
                paramIndex++;
            }

            const query = `
                SELECT 
                    e.id,
                    e.name,
                    e.description,
                    e.start_date,
                    e.duration_in_minutes,
                    e.price,
                    e.enabled_for_enrollment,
                    e.max_assistance,
                    CASE WHEN u.id IS NULL THEN NULL ELSE json_build_object(
                        'id', u.id,
                        'first_name', u.first_name,
                        'last_name', u.last_name,
                        'username', u.username
                    ) END as creator_user,
                    CASE WHEN el.id IS NULL THEN NULL ELSE json_build_object(
                        'id', el.id,
                        'name', el.name,
                        'full_address', el.full_address,
                        'latitude', el.latitude,
                        'longitude', el.longitude,
                        'max_capacity', el.max_capacity,
                        'location', json_build_object(
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
                        )
                    ) END as event_location
                FROM events e
                LEFT JOIN users u ON e.id_creator_user = u.id
                LEFT JOIN event_locations el ON e.id_event_location = el.id
                LEFT JOIN locations l ON el.id_location = l.id
                LEFT JOIN provinces p ON l.id_province = p.id
                ${whereClause}
                ORDER BY e.id
            `;
            
            const result = await client.query(query, params);

            // Get tags for each event
            const eventsWithTags = await Promise.all(
                result.rows.map(async (event) => {
                    const tagsQuery = `
                        SELECT t.id, t.name 
                        FROM event_tags et 
                        JOIN tags t ON et.id_tag = t.id 
                        WHERE et.id_event = $1
                    `;
                    const tagsResult = await client.query(tagsQuery, [event.id]);
                    return {
                        ...event,
                        tags: tagsResult.rows
                    };
                })
            );

            return eventsWithTags;
        } finally {
            await client.end();
        }
    }

    async findById(id) {
        const client = new Client(config);
        try {
            await client.connect();
            
            const query = `
                SELECT 
                    e.*,
                    json_build_object(
                        'id', u.id,
                        'first_name', u.first_name,
                        'last_name', u.last_name,
                        'username', u.username
                    ) as creator_user,
                    json_build_object(
                        'id', el.id,
                        'name', el.name,
                        'full_address', el.full_address,
                        'latitude', el.latitude,
                        'longitude', el.longitude,
                        'max_capacity', el.max_capacity,
                        'id_creator_user', el.id_creator_user,
                        'location', json_build_object(
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
                        ),
                        'creator_user', json_build_object(
                            'id', elu.id,
                            'first_name', elu.first_name,
                            'last_name', elu.last_name,
                            'username', elu.username
                        )
                    ) as event_location
                FROM events e
                JOIN users u ON e.id_creator_user = u.id
                JOIN event_locations el ON e.id_event_location = el.id
                JOIN users elu ON el.id_creator_user = elu.id
                JOIN locations l ON el.id_location = l.id
                JOIN provinces p ON l.id_province = p.id
                WHERE e.id = $1
            `;
            
            const result = await client.query(query, [id]);
            if (result.rows.length === 0) return null;

            const event = result.rows[0];

            // Get tags
            const tagsQuery = `
                SELECT t.id, t.name 
                FROM event_tags et 
                JOIN tags t ON et.id_tag = t.id 
                WHERE et.id_event = $1
            `;
            const tagsResult = await client.query(tagsQuery, [id]);
            event.tags = tagsResult.rows;

            return event;
        } finally {
            await client.end();
        }
    }

    async create(eventData) {
        const client = new Client(config);
        try {
            await client.connect();
            await client.query('BEGIN');

            const result = await client.query(
                `INSERT INTO events (name, description, id_event_location, start_date, 
                duration_in_minutes, price, enabled_for_enrollment, max_assistance, id_creator_user) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
                [eventData.name, eventData.description, eventData.id_event_location, 
                eventData.start_date, eventData.duration_in_minutes, eventData.price, 
                eventData.enabled_for_enrollment, eventData.max_assistance, eventData.id_creator_user]
            );

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            await client.end();
        }
    }

    async update(id, eventData, userId) {
        const client = new Client(config);
        try {
            await client.connect();
            
            // Check if event belongs to user
            const checkQuery = 'SELECT id_creator_user FROM events WHERE id = $1';
            const checkResult = await client.query(checkQuery, [id]);
            
            if (checkResult.rows.length === 0) {
                return null; // Event not found
            }
            
            // Convertir ambos IDs a números para comparación correcta
            const eventCreatorId = parseInt(checkResult.rows[0].id_creator_user);
            const currentUserId = parseInt(userId);
            
            if (eventCreatorId !== currentUserId) {
                throw new Error('No autorizado para editar este evento');
            }

            const result = await client.query(
                `UPDATE events SET name = $1, description = $2, id_event_location = $3, 
                start_date = $4, duration_in_minutes = $5, price = $6, 
                enabled_for_enrollment = $7, max_assistance = $8 
                WHERE id = $9 RETURNING *`,
                [eventData.name, eventData.description, eventData.id_event_location, 
                eventData.start_date, eventData.duration_in_minutes, eventData.price, 
                eventData.enabled_for_enrollment, eventData.max_assistance, id]
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
            
            // Check if event belongs to user
            const checkQuery = 'SELECT id_creator_user FROM events WHERE id = $1';
            const checkResult = await client.query(checkQuery, [id]);
            
            if (checkResult.rows.length === 0) {
                return null; // Event not found
            }
            
            // Convertir ambos IDs a números para comparación correcta
            const eventCreatorId = parseInt(checkResult.rows[0].id_creator_user);
            const currentUserId = parseInt(userId);
            
            if (eventCreatorId !== currentUserId) {
                throw new Error('No autorizado para eliminar este evento');
            }

            // Check if there are enrollments
            const enrollmentQuery = 'SELECT COUNT(*) FROM event_enrollments WHERE id_event = $1';
            const enrollmentResult = await client.query(enrollmentQuery, [id]);
            
            if (parseInt(enrollmentResult.rows[0].count) > 0) {
                throw new Error('No se puede eliminar un evento con participantes registrados');
            }

            const result = await client.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
            return result.rows[0];
        } finally {
            await client.end();
        }
    }

    async getEventLocationCapacity(eventLocationId) {
        const client = new Client(config);
        try {
            await client.connect();
            const result = await client.query(
                'SELECT max_capacity FROM event_locations WHERE id = $1',
                [eventLocationId]
            );
            return result.rows[0]?.max_capacity;
        } finally {
            await client.end();
        }
    }

    async checkEnrollmentExists(eventId, userId) {
        const client = new Client(config);
        try {
            await client.connect();
            const result = await client.query(
                'SELECT COUNT(*) FROM event_enrollments WHERE id_event = $1 AND id_user = $2',
                [eventId, userId]
            );
            return parseInt(result.rows[0].count) > 0;
        } finally {
            await client.end();
        }
    }

    async createEnrollment(eventId, userId) {
        const client = new Client(config);
        try {
            await client.connect();
            const result = await client.query(
                'INSERT INTO event_enrollments (id_event, id_user, registration_date_time) VALUES ($1, $2, NOW()) RETURNING *',
                [eventId, userId]
            );
            return result.rows[0];
        } finally {
            await client.end();
        }
    }

    async deleteEnrollment(eventId, userId) {
        const client = new Client(config);
        try {
            await client.connect();
            const result = await client.query(
                'DELETE FROM event_enrollments WHERE id_event = $1 AND id_user = $2 RETURNING *',
                [eventId, userId]
            );
            return result.rows[0];
        } finally {
            await client.end();
        }
    }

    async getEnrollmentsByEvent(eventId) {
        const client = new Client(config);
        try {
            await client.connect();
            const query = `
                SELECT 
                    json_build_object(
                        'id', u.id,
                        'username', u.username,
                        'first_name', u.first_name,
                        'last_name', u.last_name
                    ) as user,
                    e.attended,
                    e.rating,
                    e.description
                FROM event_enrollments e
                JOIN users u ON e.id_user = u.id
                WHERE e.id_event = $1
            `;
            const result = await client.query(query, [eventId]);
            return result.rows;
        } finally {
            await client.end();
        }
    }
} 