import Joi from 'joi';

export const authValidation = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
    dateOfBirth: Joi.date().max('now').optional().messages({
      'date.max': 'Date of birth cannot be in the future',
    }),
    gender: Joi.string().valid('male', 'female', 'other').optional().messages({
      'any.only': 'Gender must be male, female, or other',
    }),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      zipCode: Joi.string().optional(),
    }).optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required',
    }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'New password is required',
    }),
  }),

  verifyEmail: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Verification token is required',
    }),
  }),

  resendVerification: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),

  logout: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required',
    }),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      zipCode: Joi.string().optional(),
    }).optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    newPassword: Joi.string().min(8).required().messages({
      'string.min': 'New password must be at least 8 characters long',
      'any.required': 'New password is required',
    }),
  }),

  enable2FA: Joi.object({
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).required().messages({
      'string.pattern.base': 'Please provide a valid phone number',
      'any.required': 'Phone number is required for 2FA',
    }),
  }),

  verify2FA: Joi.object({
    code: Joi.string().length(6).pattern(/^\d+$/).required().messages({
      'string.length': '2FA code must be 6 digits',
      'string.pattern.base': '2FA code must contain only digits',
      'any.required': '2FA code is required',
    }),
  }),

  disable2FA: Joi.object({
    code: Joi.string().length(6).pattern(/^\d+$/).required().messages({
      'string.length': '2FA code must be 6 digits',
      'string.pattern.base': '2FA code must contain only digits',
      'any.required': '2FA code is required',
    }),
  }),

  sendVerificationCode: Joi.object({
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).required().messages({
      'string.pattern.base': 'Please provide a valid phone number',
      'any.required': 'Phone number is required',
    }),
  }),

  verifyPhone: Joi.object({
    code: Joi.string().length(6).pattern(/^\d+$/).required().messages({
      'string.length': 'Verification code must be 6 digits',
      'string.pattern.base': 'Verification code must contain only digits',
      'any.required': 'Verification code is required',
    }),
  }),

  // Admin validation schemas
  getUsers: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    role: Joi.string().valid('customer', 'admin', 'super_admin').optional(),
    isActive: Joi.boolean().optional(),
    search: Joi.string().optional(),
  }),

  getUserById: Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'User ID is required',
    }),
  }),

  updateUser: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    role: Joi.string().valid('customer', 'admin', 'super_admin').optional(),
    isActive: Joi.boolean().optional(),
    isEmailVerified: Joi.boolean().optional(),
    isPhoneVerified: Joi.boolean().optional(),
  }),

  deleteUser: Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'User ID is required',
    }),
  }),

  activateUser: Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'User ID is required',
    }),
  }),

  deactivateUser: Joi.object({
    id: Joi.string().required().messages({
      'any.required': 'User ID is required',
    }),
  }),
};
