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
        
        // Asegurar que solo se envíen los campos necesarios
        const requiredData = {
            name: locationData.name,
            full_address: locationData.full_address,
            max_capacity: locationData.max_capacity,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            id_creator_user: userId
        };
        
        // id_location es opcional, solo se incluye si está presente
        if (locationData.id_location !== undefined && locationData.id_location !== null) {
            requiredData.id_location = locationData.id_location;
        }
        
        return await this.eventLocationRepository.create(requiredData);
    }

    async updateLocation(id, locationData, userId) {
        const errors = validateEventLocationData(locationData);
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        // Asegurar que solo se envíen los campos necesarios
        const requiredData = {
            name: locationData.name,
            full_address: locationData.full_address,
            max_capacity: locationData.max_capacity,
            latitude: locationData.latitude,
            longitude: locationData.longitude
        };
        
        // id_location es opcional, solo se incluye si está presente
        if (locationData.id_location !== undefined && locationData.id_location !== null) {
            requiredData.id_location = locationData.id_location;
        }

        const updatedLocation = await this.eventLocationRepository.update(id, requiredData, userId);
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