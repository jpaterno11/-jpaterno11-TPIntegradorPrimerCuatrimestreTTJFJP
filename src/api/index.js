import app from '../src/server.js';

export default function handler(req, res) {
  // Vercel ejecuta esta función por cada request
  return app(req, res);
}