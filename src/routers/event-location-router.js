import { Router } from 'express';
import { EventLocationController } from '../controllers/event-location-controller.js';
import { authenticateToken } from '../middlewares/authentication-middleware.js';
const router = Router();
const eventLocationController = new EventLocationController();
router.get('', async (req, res) => {
    await eventLocationController.getAllLocations(req, res);
});
router.get('/:id', async (req, res) => {
    await eventLocationController.getLocationById(req, res);
});
router.post('', authenticateToken, async (req, res) => {
    await eventLocationController.createLocation(req, res);
});
router.put('/:id', authenticateToken, async (req, res) => {
    await eventLocationController.updateLocation(req, res);
});
router.delete('/:id', authenticateToken, async (req, res) => {
    await eventLocationController.deleteLocation(req, res);
});
export default router; 