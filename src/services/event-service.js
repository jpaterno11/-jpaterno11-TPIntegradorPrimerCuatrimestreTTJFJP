import { EventRepository } from '../repositories/event-repository.js';
import { validateEventData } from '../helpers/validation-helper.js';

export class EventService {
    constructor() {
        this.eventRepository = new EventRepository();
    }

    async getAllEvents(limit, offset, filters) {
        return await this.eventRepository.findAll(limit, offset, filters);
    }

    async getEventById(id) {
        const event = await this.eventRepository.findById(id);
        if (!event) {
            throw new Error("Evento no encontrado");
        }
        return event;
    }

    async createEvent(eventData, userId) {
        const errors = validateEventData(eventData);
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        const locationCapacity = await this.eventRepository.getEventLocationCapacity(eventData.id_event_location);
        if (eventData.max_assistance > locationCapacity) {
            throw new Error("La capacidad máxima del evento no puede superar la capacidad de la ubicación");
        }
        const eventWithCreator = {
            ...eventData,
            id_creator_user: userId
        };

        return await this.eventRepository.create(eventWithCreator);
    }

    async updateEvent(id, eventData, userId) {
        const errors = validateEventData(eventData);
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        const locationCapacity = await this.eventRepository.getEventLocationCapacity(eventData.id_event_location);
        if (eventData.max_assistance > locationCapacity) {
            throw new Error("La capacidad máxima del evento no puede superar la capacidad de la ubicación");
        }

        const updatedEvent = await this.eventRepository.update(id, eventData, userId);
        if (!updatedEvent) {
            throw new Error("Evento no encontrado o no autorizado para editar");
        }

        return updatedEvent;
    }

    async deleteEvent(id, userId) {
        const deletedEvent = await this.eventRepository.delete(id, userId);
        if (!deletedEvent) {
            throw new Error("Evento no encontrado o no autorizado para eliminar");
        }

        return deletedEvent;
    }

    async enrollInEvent(eventId, userId) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new Error("Evento no encontrado");
        }
        if (!event.enabled_for_enrollment) {
            throw new Error("El evento no está habilitado para inscripciones");
        }
        const eventDate = new Date(event.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (eventDate <= today) {
            throw new Error("No se puede inscribir a un evento que ya pasó o es hoy");
        }
        const isEnrolled = await this.eventRepository.checkEnrollmentExists(eventId, userId);
        if (isEnrolled) {
            throw new Error("Ya estás registrado en este evento");
        }
        const enrollments = await this.eventRepository.getEnrollmentsByEvent(eventId);
        if (enrollments.length >= event.max_assistance) {
            throw new Error("El evento ha alcanzado su capacidad máxima");
        }

        return await this.eventRepository.createEnrollment(eventId, userId);
    }

    async unenrollFromEvent(eventId, userId) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new Error("Evento no encontrado");
        }
        const eventDate = new Date(event.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (eventDate <= today) {
            throw new Error("No se puede desinscribir de un evento que ya pasó o es hoy");
        }
        const isEnrolled = await this.eventRepository.checkEnrollmentExists(eventId, userId);
        if (!isEnrolled) {
            throw new Error("No estás registrado en este evento");
        }
        return await this.eventRepository.deleteEnrollment(eventId, userId);
    }

    async getEventEnrollments(eventId) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new Error("Evento no encontrado");
        }
        return await this.eventRepository.getEnrollmentsByEvent(eventId);
    }
} 