import { EventLocationRepository } from '../repositories/event-location-repository.js';
import { validateEventLocationData } from '../helpers/validation-helper.js';

export class EventLocationService {
    constructor() {
        this.eventLocationRepository = new EventLocationRepository();
    }

    async getAllLocations(limit, offset) {
        return await this.eventLocationRepository.findAll(limit, offset);
    }

    async getAllLocationsByUser(userId, limit, offset) {
        return await this.eventLocationRepository.findAllByUser(userId, limit, offset);
    }

    async getLocationById(id) {
        const location = await this.eventLocationRepository.findById(id);
        if (!location) {
            throw new Error("Ubicación no encontrada");
        }
        return location;
    }

    async getLocationByIdForUser(id, userId) {
        const location = await this.eventLocationRepository.findByIdForUser(id, userId);
        if (!location) {
            throw new Error("Ubicación no encontrada o no autorizada");
        }
        return location;
    }

    async createLocation(locationData, userId) {
        const errors = validateEventLocationData(locationData);
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        const locationWithCreator = {
            ...locationData,
            id_creator_user: userId
        };
        return await this.eventLocationRepository.create(locationWithCreator);
    }

    async updateLocation(id, locationData, userId) {
        // Validate location data
        const errors = validateEventLocationData(locationData);
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        const updatedLocation = await this.eventLocationRepository.update(id, locationData, userId);
        if (!updatedLocation) {
            throw new Error("Ubicación no encontrada o no autorizada para editar");
        }

        return updatedLocation;
    }

    async deleteLocation(id, userId) {
        const deletedLocation = await this.eventLocationRepository.delete(id, userId);
        if (!deletedLocation) {
            throw new Error("Ubicación no encontrada o no autorizada para eliminar");
        }

        return deletedLocation;
    }
} 