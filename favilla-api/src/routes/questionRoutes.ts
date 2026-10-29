// src/routes/questionRoutes.ts
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { questionListLimiter, questionCreateLimiter } from '../middlewares/rateLimiter';
import { askQuestion, getProductQuestions, getMyQuestions } from '../controllers/questionController';
import {
  askQuestionSchema,
  getProductQuestionsSchema,
  getUserQuestionsSchema,
} from '../validations/questionSchemas';

const router = Router();

// Özel Rota: Kullanıcının kendi soruları (Çakışmayı önlemek için en üste koyduk)
router.get('/my/all', questionListLimiter, protect, validate(getUserQuestionsSchema), getMyQuestions); // GET /api/questions/my/all

// Ürün Bazlı Rotalar
router.get('/:productId', questionListLimiter, validate(getProductQuestionsSchema), getProductQuestions);      // GET /api/questions/:productId (Herkes görebilir)
router.post('/:productId', questionCreateLimiter, protect, validate(askQuestionSchema), askQuestion);    // POST /api/questions/:productId (Sadece üyeler)

export default router;