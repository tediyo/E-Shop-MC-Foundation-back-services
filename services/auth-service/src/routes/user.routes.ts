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

// Upload profile picture
router.post('/profile-picture',
  validateRequest(userValidation.uploadProfilePicture),
  userController.uploadProfilePicture
);

// Delete profile picture
router.delete('/profile-picture', userController.deleteProfilePicture);

// Get user activity log
router.get('/activity',
  validateRequest(userValidation.getActivity),
  userController.getActivity
);

// Export user data
router.get('/export', userController.exportData);

// Delete user account
router.delete('/account',
  validateRequest(userValidation.deleteAccount),
  userController.deleteAccount
);

// Two-factor authentication routes
router.post('/2fa/setup',
  validateRequest(userValidation.setup2FA),
  userController.setup2FA
);

router.post('/2fa/verify',
  validateRequest(userValidation.verify2FA),
  userController.verify2FA
);

router.post('/2fa/disable',
  validateRequest(userValidation.disable2FA),
  userController.disable2FA
);

// Phone verification routes
router.post('/phone/verify',
  validateRequest(userValidation.verifyPhone),
  userController.verifyPhone
);

router.post('/phone/resend-code',
  validateRequest(userValidation.resendPhoneCode),
  userController.resendPhoneCode
);

// Email verification routes
router.post('/email/verify',
  validateRequest(userValidation.verifyEmail),
  userController.verifyEmail
);

router.post('/email/resend-verification',
  validateRequest(userValidation.resendEmailVerification),
  userController.resendEmailVerification
);

// Notification preferences
router.put('/notifications',
  validateRequest(userValidation.updateNotificationPreferences),
  userController.updateNotificationPreferences
);

// Privacy settings
router.put('/privacy',
  validateRequest(userValidation.updatePrivacySettings),
  userController.updatePrivacySettings
);

// Account recovery
router.post('/recovery/initiate',
  validateRequest(userValidation.initiateRecovery),
  userController.initiateRecovery
);

router.post('/recovery/complete',
  validateRequest(userValidation.completeRecovery),
  userController.completeRecovery
);

// Session management
router.get('/sessions', userController.getActiveSessions);

router.delete('/sessions/:sessionId', userController.terminateSession);

router.delete('/sessions', userController.terminateAllSessions);

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

// Data export and deletion
router.get('/data/export', userController.exportUserData);

router.post('/data/deletion-request',
  validateRequest(userValidation.requestDataDeletion),
  userController.requestDataDeletion
);

router.delete('/data/deletion-request/:requestId',
  userController.cancelDataDeletionRequest
);

export default router;
