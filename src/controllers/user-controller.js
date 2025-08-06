import { UserService } from '../services/user-service.js';

export class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async register(req, res) {
        try {
            const userData = req.body;
            const newUser = await this.userService.register(userData);
            
            res.status(201).json({
                success: true,
                message: "Usuario registrado exitosamente",
                data: {
                    id: newUser.id,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    username: newUser.username
                }
            });
        } catch (error) {
            console.error('Error en register:', error.message);
                        if (error.message.includes("El username ya está en uso")) {
                res.status(400).json({
                    success: false,
                    message: "El email ya está registrado"
                });
            } else if (error.message.includes("El nombre debe tener") || 
                       error.message.includes("El apellido debe tener") ||
                       error.message.includes("El email es inválido") ||
                       error.message.includes("La contraseña debe tener")) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error interno del servidor al registrar usuario"
                });
            }
        }
    }

    async login(req, res) {
        try {
            const credentials = req.body;
            const result = await this.userService.login(credentials);
            res.status(200).json(result);
        } catch (error) {
            if (error.message === "El email es inválido") {
                res.status(400).json({
                    success: false,
                    message: error.message,
                    token: ""
                });
            } else if (error.message === "Usuario o clave inválida") {
                res.status(401).json({
                    success: false,
                    message: error.message,
                    token: ""
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error interno del servidor",
                    token: ""
                });
                console.log(error);
            }
        }
    }
} 