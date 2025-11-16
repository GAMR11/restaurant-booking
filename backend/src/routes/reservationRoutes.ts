import { Router } from 'express';
import {
  createReservation,
  getAvailability,
  getReservation,
  updateReservation,
  cancelReservation,
} from '../controllers/reservationController';

const router = Router();

router.post('/reservations', createReservation);
router.get('/availability', getAvailability);
router.get('/reservations/:id', getReservation);
router.put('/reservations/:id', updateReservation);
router.delete('/reservations/:id', cancelReservation);

export default router;