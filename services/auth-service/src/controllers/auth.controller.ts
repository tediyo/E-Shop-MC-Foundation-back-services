import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/user.model';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { setKey, deleteKey, getKey } from '../config/redis';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authController = {
  // User registration
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'User with this email already exists',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        phone,
      });

      await user.save();

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: (user as any)._id.toString(),
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: (user as any)._id.toString(),
        tokenId: uuidv4(),
      });

      // Store refresh token in Redis
      await setKey(`refresh_token:${(user as any)._id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

      logger.info(`User registered successfully: ${user.email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: (user as any)._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken,
          refreshToken,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // User login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          error: 'Account is deactivated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: (user as any)._id.toString(),
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        userId: (user as any)._id.toString(),
        tokenId: uuidv4(),
      });

      // Store refresh token in Redis
      await setKey(`refresh_token:${(user as any)._id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

      logger.info(`User logged in successfully: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: (user as any)._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
          },
          accessToken,
          refreshToken,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Refresh access token
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify refresh token
      const decoded = verifyToken(refreshToken) as any;
      
      // Check if refresh token exists in Redis
      const storedToken = await getKey(`refresh_token:${decoded.userId}`);
      if (!storedToken) {
        res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          error: 'User not found or inactive',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        userId: (user as any)._id.toString(),
        email: user.email,
        role: user.role,
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Authentication middleware
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'Access token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          error: 'User not found or inactive',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
    }
  },

  // Role-based access control
  requireRole(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    };
  },

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

  // Logout
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Remove refresh token from Redis
        const decoded = verifyToken(refreshToken) as any;
        await deleteKey(`refresh_token:${decoded.userId}`);
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Forgot password
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if user exists or not
        res.status(200).json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate password reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // TODO: Send email with reset token
      logger.info(`Password reset token generated for user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Reset password
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Update password and clear reset token
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      logger.info(`Password reset successful for user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Password reset successful',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all users (admin only)
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, role, isActive, search } = req.query;

      const query: any = {};
      if (role) query.role = role;
      if (isActive !== undefined) query.isActive = isActive === 'true';
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const users = await User.find(query)
        .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires -twoFactorSecret')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
            hasNext: skip + users.length < total,
            hasPrev: Number(page) > 1,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user by ID (admin only)
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await User.findById(id)
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
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user (admin only)
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await User.findByIdAndUpdate(
        id,
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

      logger.info(`User updated by admin: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: {
          user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete user (super admin only)
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await User.findByIdAndDelete(id);

      logger.info(`User deleted by super admin: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Activate user (admin only)
  async activateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await User.findByIdAndUpdate(
        id,
        { isActive: true },
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

      logger.info(`User activated by admin: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'User activated successfully',
        data: {
          user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Deactivate user (admin only)
  async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await User.findByIdAndUpdate(
        id,
        { isActive: false },
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

      logger.info(`User deactivated by admin: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
        data: {
          user,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
};
