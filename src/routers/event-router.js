import { Router } from 'express';
import { EventController } from '../controllers/event-controller.js';
import { authenticateToken } from '../middlewares/authentication-middleware.js';

const router = Router();
const eventController = new EventController();
router.get('', async (req, res) => {
    await eventController.getAllEvents(req, res);
});
router.post('', authenticateToken, async (req, res) => {
    await eventController.createEvent(req, res);
});
router.get('/:id/enrollments', async (req, res) => {
    await eventController.getEventEnrollments(req, res);
});
router.post('/:id/enrollment', authenticateToken, async (req, res) => {
    await eventController.enrollInEvent(req, res);
});
router.delete('/:id/enrollment', authenticateToken, async (req, res) => {
    await eventController.unenrollFromEvent(req, res);
});
router.get('/:id', async (req, res) => {
    await eventController.getEventById(req, res);
});
router.put('/:id', authenticateToken, async (req, res) => {
    await eventController.updateEvent(req, res);
});
router.delete('/:id', authenticateToken, async (req, res) => {
    await eventController.deleteEvent(req, res);
});
export default router; 