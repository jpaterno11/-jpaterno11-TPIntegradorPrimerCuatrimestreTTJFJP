import { EventLocationService } from '../services/event-location-service.js';

export class EventLocationController {
    constructor() {
        this.eventLocationService = new EventLocationService();
    }

    async getAllLocations(req, res) {
        try {
            const { limit = 15, offset = 0 } = req.query;
            const userId = req.user.id;
            
            const locations = await this.eventLocationService.getAllLocationsByUser(
                userId, 
                parseInt(limit), 
                parseInt(offset)
            );
            res.status(200).json(locations);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error interno del servidor"
            });
        }
    }

    async getLocationById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            const location = await this.eventLocationService.getLocationById(parseInt(id), userId);
            res.status(200).json(location);
        } catch (error) {
            if (error.message.includes("no encontrada") || error.message.includes("no autorizada")) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error interno del servidor"
                });
            }
        }
    }

    async createLocation(req, res) {
        try {
            const locationData = req.body;
            const userId = req.user.id;
            
            const newLocation = await this.eventLocationService.createLocation(locationData, userId);
            res.status(201).json({
                success: true,
                message: "Ubicación creada exitosamente",
                data: newLocation
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateLocation(req, res) {
        try {
            const { id } = req.params;
            const locationData = req.body;
            const userId = req.user.id;
            
            const updatedLocation = await this.eventLocationService.updateLocation(
                parseInt(id), 
                locationData, 
                userId
            );
            res.status(200).json({
                success: true,
                message: "Ubicación actualizada exitosamente",
                data: updatedLocation
            });
        } catch (error) {
            if (error.message.includes("no encontrada") || error.message.includes("no autorizada")) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
        }
    }

    async deleteLocation(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            await this.eventLocationService.deleteLocation(parseInt(id), userId);
            res.status(200).json({
                success: true,
                message: "Ubicación eliminada exitosamente"
            });
        } catch (error) {
            if (error.message.includes("no encontrada") || error.message.includes("no autorizada")) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
        }
    }
} 