export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    return password && password.length >= 3;
};

export const validateName = (name) => {
    return name && name.length >= 3;
};

export const validateEventData = (eventData) => {
    const errors = [];
    
    if (!validateName(eventData.name)) {
        errors.push("El nombre debe tener al menos 3 caracteres");
    }
    
    if (!validateName(eventData.description)) {
        errors.push("La descripción debe tener al menos 3 caracteres");
    }
    
    if (eventData.price < 0) {
        errors.push("El precio no puede ser negativo");
    }
    
    if (eventData.duration_in_minutes < 0) {
        errors.push("La duración no puede ser negativa");
    }
    
    return errors;
};

export const validateEventLocationData = (locationData) => {
    const errors = [];
    
    if (!validateName(locationData.name)) {
        errors.push("El nombre debe tener al menos 3 caracteres");
    }
    
    if (!validateName(locationData.full_address)) {
        errors.push("La dirección debe tener al menos 3 caracteres");
    }
    
    if (locationData.max_capacity <= 0) {
        errors.push("La capacidad máxima debe ser mayor a 0");
    }
    
    // Validar que las coordenadas estén presentes y sean números válidos
    if (locationData.latitude === undefined || locationData.latitude === null) {
        errors.push("La latitud es requerida");
    } else if (isNaN(locationData.latitude) || locationData.latitude < -90 || locationData.latitude > 90) {
        errors.push("La latitud debe ser un número válido entre -90 y 90");
    }
    
    if (locationData.longitude === undefined || locationData.longitude === null) {
        errors.push("La longitud es requerida");
    } else if (isNaN(locationData.longitude) || locationData.longitude < -180 || locationData.longitude > 180) {
        errors.push("La longitud debe ser un número válido entre -180 y 180");
    }
    
    // id_location es opcional, no se valida
    
    return errors;
}; 