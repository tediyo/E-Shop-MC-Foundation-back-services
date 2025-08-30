import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { userController } from '../controllers/user.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authValidation } from '../validations/auth.validation';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limiting for auth endpoints (relaxed for testing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs for auth endpoints
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no authentication required)
router.post('/register', 
  authLimiter,
  validateRequest(authValidation.register),
  authController.register
);

router.post('/login', 
  authLimiter,
  validateRequest(authValidation.login),
  authController.login
);

router.post('/refresh-token',
  validateRequest(authValidation.refreshToken),
  authController.refreshToken
);

router.post('/forgot-password',
  passwordResetLimiter,
  validateRequest(authValidation.forgotPassword),
  authController.forgotPassword
);

router.post('/reset-password',
  passwordResetLimiter,
  validateRequest(authValidation.resetPassword),
  authController.resetPassword
);

router.post('/logout',
  validateRequest(authValidation.logout),
  authController.logout
);

// Protected routes (authentication required)
router.get('/me',
  authController.authenticate,
  authController.getProfile
);

// Admin routes (admin role required)
router.get('/users',
  authController.authenticate,
  authController.requireRole(['admin', 'super_admin']),
  validateRequest(authValidation.getUsers),
  authController.getUsers
);

router.get('/users/:id',
  authController.authenticate,
  authController.requireRole(['admin', 'super_admin']),
  validateRequest(authValidation.getUserById),
  authController.getUserById
);

router.put('/users/:id',
  authController.authenticate,
  authController.requireRole(['admin', 'super_admin']),
  validateRequest(authValidation.updateUser),
  authController.updateUser
);

router.delete('/users/:id',
  authController.authenticate,
  authController.requireRole(['super_admin']),
  validateRequest(authValidation.deleteUser),
  authController.deleteUser
);

router.post('/users/:id/activate',
  authController.authenticate,
  authController.requireRole(['admin', 'super_admin']),
  validateRequest(authValidation.activateUser),
  authController.activateUser
);

router.post('/users/:id/deactivate',
  authController.authenticate,
  authController.requireRole(['admin', 'super_admin']),
  validateRequest(authValidation.deactivateUser),
  authController.deactivateUser
);

export default router;
