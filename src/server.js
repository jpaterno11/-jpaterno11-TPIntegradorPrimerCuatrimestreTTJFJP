import express from "express";
import cors from "cors";
import config from './configs/db-config.js';
import pkg from 'pg';

const { Client } = pkg;
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/event', async (req, res) => {
    const { limit = 15, offset = 0 } = req.query;

    try {
        const client = new Client(config);
        await client.connect();
        const totalResult = await client.query('SELECT COUNT(*) FROM events');
        const total = parseInt(totalResult.rows[0].count);
        const sql = `
            SELECT 
                e.id,
                e.name as nombre,
                e.description as descripcion,
                e.start_date as fecha_del_evento,
                e.duration_in_minutes as duracion_en_minutos,
                e.price as precio,
                e.enabled_for_enrollment as habilitado_para_inscribirse,
                e.max_assistance as capacidad_max,
                json_build_object(
                    'id', u.id,
                    'first_name', u.first_name,
                    'last_name', u.last_name,
                    'username', u.username
                ) as usuario_creador_del_evento,
                json_build_object(
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
                ) as Úbicacion
            FROM events e
            JOIN users u ON e.id_creator_user = u.id
            JOIN event_locations el ON e.id_event_location = el.id
            JOIN locations l ON el.id_location = l.id
            JOIN provinces p ON l.id_province = p.id
            ORDER BY e.id
            LIMIT $1 OFFSET $2`;
        const result = await client.query(sql, [limit, offset]);
        await client.end();
        const response = {
            respuestas: result.rows,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                nextPage: (offset + limit < total) ? `/api/event?limit=${limit}&offset=${parseInt(offset) + parseInt(limit)}` : null,
                total: total
            }
        };
        res.status(200).json(response);
    } catch (error) {
        res.status(500).send("(Internal Server Error) error: " + error.message);
    }
});


app.get('/api/alumnos/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) {
        return res.status(400).send("El ID debe ser numérico.");
    }

    try {
        const client = new Client(config);
        await client.connect();
        const sql = 'SELECT * FROM alumnos WHERE id = $1';
        const result = await client.query(sql, [id]);
        await client.end();

        if (result.rows.length === 0) {
            return res.status(404).send("No existe un alumno con ese ID.");
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).send("(Internal Server Error) error: " + error.message);
    }
});

app.post('/api/alumnos', async (req, res) => {
    const { nombre, apellido, id_curso, fecha_nacimiento, hace_deportes } = req.body;

    try {
        const client = new Client(config);
        await client.connect();
        const sql = `
            INSERT INTO alumnos (nombre, apellido, id_curso, fecha_nacimiento, hace_deportes)
            VALUES ($1, $2, $3, $4, $5)
        `;
        const values = [nombre, apellido, id_curso, fecha_nacimiento, hace_deportes];
        await client.query(sql, values);
        await client.end();

        res.status(201).send("Alumno creado correctamente.");
    } catch (error) {
        res.status(500).send("(Internal Server Error) error: " + error.message);
    }
});

app.put('/api/alumnos', async (req, res) => {
    const { id, nombre, apellido, id_curso, fecha_nacimiento, hace_deportes } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).send("El ID debe ser numérico y estar presente.");
    }

    try {
        const client = new Client(config);
        await client.connect();
        const sql = `
            UPDATE alumnos
            SET nombre = $1, apellido = $2, id_curso = $3, fecha_nacimiento = $4, hace_deportes = $5
            WHERE id = $6
        `;
        const values = [nombre, apellido, id_curso, fecha_nacimiento, hace_deportes, id];
        const result = await client.query(sql, values);
        await client.end();

        if (result.rowCount === 0) {
            return res.status(404).send("No existe un alumno con ese ID.");
        }

        res.status(201).send("Alumno actualizado correctamente.");
    } catch (error) {
        res.status(500).send("(Internal Server Error) error: " + error.message);
    }
});

app.delete('/api/alumnos/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) {
        return res.status(400).send("El ID debe ser numérico.");
    }

    try {
        const client = new Client(config);
        await client.connect();
        const sql = 'DELETE FROM alumnos WHERE id = $1';
        const result = await client.query(sql, [id]);
        await client.end();

        if (result.rowCount === 0) {
            return res.status(404).send("No existe un alumno con ese ID.");
        }

        res.status(200).send("Alumno eliminado correctamente.");
    } catch (error) {
        res.status(500).send("(Internal Server Error) error: " + error.message);
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
