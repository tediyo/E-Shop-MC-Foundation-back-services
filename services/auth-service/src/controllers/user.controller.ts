import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

export const userController = {
  // Get current user profile
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Update current user profile
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updateData = req.body;
      const userId = req.user?._id;

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -twoFactorSecret');

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(`User profile updated: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Change current user password
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?._id;

      const user = await User.findById(userId).select('+password');
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        res.status(400).json({
          success: false,
          error: 'Current password is incorrect',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user preferences
  async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { preferences } = req.body;
      const userId = req.user?._id;

      const user = await User.findByIdAndUpdate(
        userId,
        { preferences },
        { new: true, runValidators: true }
      ).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -twoFactorSecret');

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: {
          user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user address
  async updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address } = req.body;
      const userId = req.user?._id;

      const user = await User.findByIdAndUpdate(
        userId,
        { address },
        { new: true, runValidators: true }
      ).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -twoFactorSecret');

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: {
          user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete profile picture
  async deleteProfilePicture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;

      const user = await User.findByIdAndUpdate(
        userId,
        { profilePicture: undefined },
        { new: true }
      ).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -twoFactorSecret');

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile picture deleted successfully',
        data: {
          user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user activity
  async getActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Placeholder for user activity
      res.status(200).json({
        success: true,
        data: {
          activities: [],
          message: 'Activity tracking not implemented yet',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Export user data
  async exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;

      const user = await User.findById(userId)
        .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -twoFactorSecret');

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user,
          exportDate: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete user account
  async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password } = req.body;
      const userId = req.user?._id;

      const user = await User.findById(userId).select('+password');
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(400).json({
          success: false,
          error: 'Password is incorrect',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Deactivate user instead of deleting
      user.isActive = false;
      await user.save();

      logger.info(`User account deactivated: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Account deactivated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Setup 2FA
  async setup2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: '2FA setup not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Verify 2FA
  async verify2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: '2FA verification not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Disable 2FA
  async disable2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: '2FA disable not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Verify phone
  async verifyPhone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Phone verification not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Resend phone code
  async resendPhoneCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Phone code resend not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Verify email
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Email verification not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Resend email verification
  async resendEmailVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Email verification resend not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Update notification preferences
  async updateNotificationPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Notification preferences not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Update privacy settings
  async updatePrivacySettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Privacy settings not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Initiate recovery
  async initiateRecovery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Account recovery not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Complete recovery
  async completeRecovery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Account recovery not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Get active sessions
  async getActiveSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: {
          sessions: [],
          message: 'Session management not implemented yet',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Terminate session
  async terminateSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Session termination not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Terminate all sessions
  async terminateAllSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Session termination not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Update language
  async updateLanguage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { language } = req.body;
      const userId = req.user?._id;

      const user = await User.findByIdAndUpdate(
        userId,
        { 'preferences.language': language },
        { new: true, runValidators: true }
      ).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -twoFactorSecret');

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Language updated successfully',
        data: {
          user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Update currency
  async updateCurrency(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currency } = req.body;
      const userId = req.user?._id;

      const user = await User.findByIdAndUpdate(
        userId,
        { 'preferences.currency': currency },
        { new: true, runValidators: true }
      ).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -twoFactorSecret');

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Currency updated successfully',
        data: {
          user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Update timezone
  async updateTimezone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { timezone } = req.body;
      const userId = req.user?._id;

      const user = await User.findByIdAndUpdate(
        userId,
        { 'preferences.timezone': timezone },
        { new: true, runValidators: true }
      ).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -twoFactorSecret');

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Timezone updated successfully',
        data: {
          user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Update marketing preferences
  async updateMarketingPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { marketingEmails, smsNotifications } = req.body;
      const userId = req.user?._id;

      const user = await User.findByIdAndUpdate(
        userId,
        {
          'preferences.marketingEmails': marketingEmails,
          'preferences.smsNotifications': smsNotifications,
        },
        { new: true, runValidators: true }
      ).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -twoFactorSecret');

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Marketing preferences updated successfully',
        data: {
          user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Export user data
  async exportUserData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;

      const user = await User.findById(userId)
        .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -twoFactorSecret');

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user,
          exportDate: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Request data deletion
  async requestDataDeletion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Data deletion request not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Cancel data deletion request
  async cancelDataDeletionRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Data deletion cancellation not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
};
