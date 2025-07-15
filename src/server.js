import express from "express";
import cors from "cors";
import config from './configs/db-config.js';
import pkg from 'pg';

const { Client } = pkg;
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Importar controladores desde la nueva arquitectura
// const eventController = require('./controllers/event-controller');
// const userController = require('./controllers/user-controller');
// const eventLocationController = require('./controllers/event-location-controller');

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
                    'nombre', u.first_name,
                    'apellido', u.last_name,
                    'email', u.username
                ) as usuario_creador_del_evento,
                json_build_object(
                    'id', el.id,
                    'nombre', el.name,
                    'direccion', el.full_address,
                    'latitude', el.latitude,
                    'longitude', el.longitude,
                    'capacidad_maxima', el.max_capacity,
                    'location', json_build_object(
                        'id', l.id,
                        'nombre', l.name,
                        'latitude', l.latitude,
                        'longitude', l.longitude,
                        'provincia', json_build_object(
                            'id', p.id,
                            'nombre', p.name,
                            'nombre_completo', p.full_name,
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

app.get('/api/event', async (req, res) => {
    const { nombre, startdate } = req.query;
    
})


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
