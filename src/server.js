import express from "express";
import cors from "cors";
import 'dotenv/config';
import { authenticateToken } from './middlewares/authentication-middleware.js';
import userRouter from './routers/user-router.js';
import eventRouter from './routers/event-router.js';
import eventLocationRouter from './routers/event-location-router.js';
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
import config from './configs/db-config.js';
import pkg from 'pg';
const { Client } = pkg;
app.use('/api/user', userRouter);
app.use('/api/event', eventRouter);
app.use('/api/event-location', eventLocationRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint no encontrado"
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
