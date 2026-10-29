// src/routes/supportRoutes.ts
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { supportCreateLimiter, supportListLimiter } from '../middlewares/rateLimiter';
import { createSupportTicket, getMyTickets } from '../controllers/supportController';
import {
  createSupportTicketSchema,
  getSupportTicketsSchema,
} from '../validations/supportSchemas';

const router = Router();

// Bu rotaların hepsi giriş yapmış kullanıcı gerektirir
router.use(protect);

router.post('/', supportCreateLimiter, validate(createSupportTicketSchema), createSupportTicket); // POST /api/support -> Yeni Talep
router.get('/', supportListLimiter, validate(getSupportTicketsSchema), getMyTickets);         // GET /api/support -> Taleplerim

export default router;