import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user-repository.js';
import { validateEmail, validatePassword, validateName } from '../helpers/validation-helper.js';

export class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async register(userData) {
        const errors = [];
        
        if (!validateName(userData.first_name)) {
            errors.push("El nombre debe tener al menos 3 caracteres");
        }
        
        if (!validateName(userData.last_name)) {
            errors.push("El apellido debe tener al menos 3 caracteres");
        }
        
        if (!validateEmail(userData.username)) {
            errors.push("El email es inválido");
        }
        
        if (!validatePassword(userData.password)) {
            errors.push("La contraseña debe tener al menos 3 caracteres");
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        const existingUser = await this.userRepository.findByUsername(userData.username);
        if (existingUser) {
            throw new Error("El usuario ya existe");
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Create user
        const newUser = await this.userRepository.create({
            ...userData,
            password: hashedPassword
        });

        return newUser;
    }

    async login(credentials) {
        // Validate email
        if (!validateEmail(credentials.username)) {
            throw new Error("El email es inválido");
        }

        // Find user
        const user = await this.userRepository.findByUsername(credentials.username);
        if (!user) {
            throw new Error("Usuario o clave inválida");
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
            throw new Error("Usuario o clave inválida");
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            success: true,
            message: "",
            token: token
        };
    }

    async findById(id) {
        return await this.userRepository.findById(id);
    }
} 