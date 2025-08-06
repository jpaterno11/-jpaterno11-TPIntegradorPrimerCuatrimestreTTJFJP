import config from '../configs/db-config.js';
import pkg from 'pg';
const { Client } = pkg;

export class UserRepository {
    async findByUsername(username) {
        const client = new Client(config);
        try {
            await client.connect();
            const result = await client.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );
            return result.rows[0];
        } finally {
            await client.end();
        }
    }

    async findById(id) {
        const client = new Client(config);
        try {
            await client.connect();
            const result = await client.query(
                'SELECT * FROM users WHERE id = $1',
                [id]
            );
            return result.rows[0];
        } finally {
            await client.end();
        }
    }

    async create(userData) {
        const client = new Client(config);
        try {
            await client.connect();
            const existingUser = await client.query(
                'SELECT id FROM users WHERE username = $1',
                [userData.username]
            );
            if (existingUser.rows.length > 0) {
                throw new Error("El username ya está en uso");
            }
            const result = await client.query(
                'INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4) RETURNING *',
                [userData.first_name, userData.last_name, userData.username, userData.password]
            );
            return result.rows[0];
        } catch (error) {
            if (error.message === "El username ya está en uso") {
                throw error;
            }
            if (error.code === '23505') {
                if (error.constraint === 'users_username_key') {
                    throw new Error("El username ya está en uso");
                } else {
                    throw new Error("Error de clave duplicada en la base de datos");
                }
            }
            throw new Error("Error al crear el usuario: " + error.message);
        } finally {
            await client.end();
        }
    }

    async checkUsernameExists(username) {
        const client = new Client(config);
        try {
            await client.connect();
            const result = await client.query(
                'SELECT COUNT(*) FROM users WHERE username = $1',
                [username]
            );
            return parseInt(result.rows[0].count) > 0;
        } finally {
            await client.end();
        }
    }
} 