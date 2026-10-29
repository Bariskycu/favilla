// src/routes/userRoutes.ts
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { admin } from '../middlewares/adminMiddleware';
import { validate } from '../middlewares/validate';
import { userProfileLimiter, addressLimiter } from '../middlewares/rateLimiter';
import { getProfile, updateProfile, getUserAddresses, createUserAddress, removeUserAddress, editUserAddress, changeUserRole } from '../controllers/userController';
import { updateProfileSchema, addressSchema, updateAddressSchema, deleteAddressSchema, changeUserRoleSchema } from '../validations/userSchemas';

const router = Router();

// Tüm rotalar korumalıdır (Login zorunlu)
router.use(protect);

router.get('/profile', userProfileLimiter, getProfile);          // GET /api/users/profile
router.put('/profile', userProfileLimiter, validate(updateProfileSchema), updateProfile);       // PUT /api/users/profile
router.get('/addresses', addressLimiter, getUserAddresses);  // GET /api/users/addresses
router.post('/addresses', addressLimiter, validate(addressSchema), createUserAddress); // POST /api/users/addresses
router.put('/addresses/:id', addressLimiter, validate(updateAddressSchema), editUserAddress); // PUT /api/users/addresses/:id
router.delete('/addresses/:id', addressLimiter, validate(deleteAddressSchema), removeUserAddress); // DELETE /api/users/addresses/:id

// Admin işlemleri
router.put('/:userId/role', userProfileLimiter, protect, admin, validate(changeUserRoleSchema), changeUserRole); // PUT /api/users/:userId/role (Admin only)

export default router;