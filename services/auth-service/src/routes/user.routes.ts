import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validateRequest } from '../middleware/validateRequest';
import { userValidation } from '../validations/user.validation';
import { authController } from '../controllers/auth.controller';

const router = Router();

// All user routes require authentication
router.use(authController.authenticate);

// Get current user profile
router.get('/profile', userController.getProfile);

// Update current user profile
router.put('/profile',
  validateRequest(userValidation.updateProfile),
  userController.updateProfile
);

// Change current user password
router.put('/password',
  validateRequest(userValidation.changePassword),
  userController.changePassword
);

// Update user preferences
router.put('/preferences',
  validateRequest(userValidation.updatePreferences),
  userController.updatePreferences
);

// Update user address
router.put('/address',
  validateRequest(userValidation.updateAddress),
  userController.updateAddress
);

// Delete profile picture
router.delete('/profile-picture', userController.deleteProfilePicture);

// Get user activity log
router.get('/activity', userController.getActivity);

// Export user data
router.get('/export', userController.exportData);

// Delete user account
router.delete('/account',
  validateRequest(userValidation.deleteAccount),
  userController.deleteAccount
);

// User preferences for specific features
router.put('/preferences/language',
  validateRequest(userValidation.updateLanguage),
  userController.updateLanguage
);

router.put('/preferences/currency',
  validateRequest(userValidation.updateCurrency),
  userController.updateCurrency
);

router.put('/preferences/timezone',
  validateRequest(userValidation.updateTimezone),
  userController.updateTimezone
);

// Marketing preferences
router.put('/preferences/marketing',
  validateRequest(userValidation.updateMarketingPreferences),
  userController.updateMarketingPreferences
);

// Data export
router.get('/data/export', userController.exportUserData);

export default router;
