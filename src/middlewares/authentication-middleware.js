// Middleware de autenticación JWT

function authenticationMiddleware(req, res, next) {
    // Lógica de autenticación aquí
    next();
}

module.exports = authenticationMiddleware; 