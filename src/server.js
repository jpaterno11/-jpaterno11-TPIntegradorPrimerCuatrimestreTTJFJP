import express from "express";
import cors from "cors";
import 'dotenv/config';

// Import controllers
import { UserController } from './controllers/user-controller.js';
import { EventController } from './controllers/event-controller.js';
import { EventLocationController } from './controllers/event-location-controller.js';

// Import middleware
import { authenticateToken } from './middlewares/authentication-middleware.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
import config from './configs/db-config.js';
import pkg from 'pg';
const { Client } = pkg;

// Test endpoint to check database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const client = new Client(config);
        await client.connect();
        const result = await client.query('SELECT NOW()');
        await client.end();
        res.json({
            success: true,
            message: "Database connection successful",
            timestamp: result.rows[0].now
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message,
            config: {
                host: config.host,
                database: config.database,
                user: config.user,
                port: config.port
            }
        });
    }
});

// Initialize controllers
const userController = new UserController();
const eventController = new EventController();
const eventLocationController = new EventLocationController();

// User routes (no authentication required)
app.post('/api/user/register', (req, res) => userController.register(req, res));
app.post('/api/user/login', (req, res) => userController.login(req, res));

// Event routes
// Public routes (no authentication required)
app.get('/api/event', (req, res) => eventController.getAllEvents(req, res));
app.get('/api/event/:id', (req, res) => eventController.getEventById(req, res));

// Protected routes (authentication required)
app.post('/api/event', authenticateToken, (req, res) => eventController.createEvent(req, res));
app.put('/api/event/:id', authenticateToken, (req, res) => eventController.updateEvent(req, res));
app.delete('/api/event/:id', authenticateToken, (req, res) => eventController.deleteEvent(req, res));

// Enrollment routes (authentication required)
app.post('/api/event/:id/enrollment', authenticateToken, (req, res) => eventController.enrollInEvent(req, res));
app.delete('/api/event/:id/enrollment', authenticateToken, (req, res) => eventController.unenrollFromEvent(req, res));

// Event location routes (authentication required)
app.get('/api/event-location', authenticateToken, (req, res) => eventLocationController.getAllLocations(req, res));
app.get('/api/event-location/:id', authenticateToken, (req, res) => eventLocationController.getLocationById(req, res));
app.post('/api/event-location', authenticateToken, (req, res) => eventLocationController.createLocation(req, res));
app.put('/api/event-location/:id', authenticateToken, (req, res) => eventLocationController.updateLocation(req, res));
app.delete('/api/event-location/:id', authenticateToken, (req, res) => eventLocationController.deleteLocation(req, res));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint no encontrado"
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log('Environment variables:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_DATABASE:', process.env.DB_DATABASE);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PORT:', process.env.DB_PORT);
});
