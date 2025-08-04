import { EventService } from '../services/event-service.js';

export class EventController {
    constructor() {
        this.eventService = new EventService();
    }

    async getAllEvents(req, res) {
        try {
            const { limit = 15, offset = 0, name, startdate, tag } = req.query;
            const filters = { name, startdate, tag };
            
            console.log('Getting events with filters:', filters);
            const events = await this.eventService.getAllEvents(parseInt(limit), parseInt(offset), filters);
            res.status(200).json(events);
        } catch (error) {
            console.error('Error in getAllEvents:', error);
            res.status(500).json({
                success: false,
                message: "Error interno del servidor",
                error: error.message
            });
        }
    }

    async getEventById(req, res) {
        try {
            const { id } = req.params;
            const event = await this.eventService.getEventById(parseInt(id));
            res.status(200).json(event);
        } catch (error) {
            console.error('Error in getEventById:', error);
            if (error.message === "Evento no encontrado") {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error interno del servidor",
                    error: error.message
                });
            }
        }
    }

    async createEvent(req, res) {
        try {
            const eventData = req.body;
            const userId = req.user.id;
            
            const newEvent = await this.eventService.createEvent(eventData, userId);
            res.status(201).json({
                success: true,
                message: "Evento creado exitosamente",
                data: newEvent
            });
        } catch (error) {
            console.error('Error in createEvent:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateEvent(req, res) {
        try {
            const { id } = req.params;
            const eventData = req.body;
            const userId = req.user.id;
            
            const updatedEvent = await this.eventService.updateEvent(parseInt(id), eventData, userId);
            res.status(200).json({
                success: true,
                message: "Evento actualizado exitosamente",
                data: updatedEvent
            });
        } catch (error) {
            console.error('Error in updateEvent:', error);
            if (error.message.includes("no encontrado") || error.message.includes("no autorizado")) {
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

    async deleteEvent(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            await this.eventService.deleteEvent(parseInt(id), userId);
            res.status(200).json({
                success: true,
                message: "Evento eliminado exitosamente"
            });
        } catch (error) {
            console.error('Error in deleteEvent:', error);
            if (error.message.includes("no encontrado") || error.message.includes("no autorizado")) {
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

    async enrollInEvent(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            await this.eventService.enrollInEvent(parseInt(id), userId);
            res.status(201).json({
                success: true,
                message: "Inscripción realizada exitosamente"
            });
        } catch (error) {
            console.error('Error in enrollInEvent:', error);
            if (error.message === "Evento no encontrado") {
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

    async unenrollFromEvent(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            
            await this.eventService.unenrollFromEvent(parseInt(id), userId);
            res.status(200).json({
                success: true,
                message: "Desinscripción realizada exitosamente"
            });
        } catch (error) {
            console.error('Error in unenrollFromEvent:', error);
            if (error.message === "Evento no encontrado") {
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

    async getEventEnrollments(req, res) {
        try {
            const { id } = req.params;
            const enrollments = await this.eventService.getEventEnrollments(parseInt(id));
            res.status(200).json({
                collection: enrollments
            });
        } catch (error) {
            console.error('Error in getEventEnrollments:', error);
            if (error.message === "Evento no encontrado") {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Error interno del servidor",
                    error: error.message
                });
            }
        }
    }
} 