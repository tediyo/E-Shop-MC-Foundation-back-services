import Joi from 'joi';

export const userValidation = {
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

  updatePreferences: Joi.object({
    language: Joi.string().valid('en', 'es', 'fr', 'de').optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD').optional(),
    timezone: Joi.string().optional(),
    marketingEmails: Joi.boolean().optional(),
    smsNotifications: Joi.boolean().optional(),
  }),

  updateAddress: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    zipCode: Joi.string().optional(),
  }),

  updateLanguage: Joi.object({
    language: Joi.string().valid('en', 'es', 'fr', 'de').required(),
  }),

  updateCurrency: Joi.object({
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'CAD').required(),
  }),

  updateTimezone: Joi.object({
    timezone: Joi.string().required(),
  }),

  updateMarketingPreferences: Joi.object({
    marketingEmails: Joi.boolean().required(),
    smsNotifications: Joi.boolean().required(),
  }),

  deleteAccount: Joi.object({
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),
};
