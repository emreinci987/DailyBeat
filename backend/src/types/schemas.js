import Joi from 'joi';
import { availableMoods } from '../utils/moodMapping.js';

export const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Geçerli bir e-posta adresi giriniz',
        'any.required': 'E-posta adresi gereklidir',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Şifre en az 6 karakter olmalıdır',
        'any.required': 'Şifre gereklidir',
    }),
    displayName: Joi.string().max(50).allow('').optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Geçerli bir e-posta adresi giriniz',
        'any.required': 'E-posta adresi gereklidir',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Şifre en az 6 karakter olmalıdır',
        'any.required': 'Şifre gereklidir',
    }),
});

export const moodSchema = Joi.object({
    mood: Joi.string()
        .valid(...availableMoods)
        .required()
        .messages({
            'any.only': `Geçerli bir ruh hali seçiniz: ${availableMoods.join(', ')}`,
            'any.required': 'Ruh hali gereklidir',
        }),
    intensity: Joi.number().integer().min(1).max(10).default(5),
    note: Joi.string().max(500).allow('').default(''),
});

export const recommendationSchema = Joi.object({
    mood: Joi.string()
        .valid(...availableMoods)
        .required(),
    intensity: Joi.number().integer().min(1).max(10).default(5),
    limit: Joi.number().integer().min(1).max(50).default(10),
    save: Joi.boolean().default(false),
});

export const updateProfileSchema = Joi.object({
    displayName: Joi.string().max(50).optional(),
    photoURL: Joi.string().uri().allow('').optional(),
    preferences: Joi.object({
        genres: Joi.array().items(Joi.string()).optional(),
        language: Joi.string().max(5).optional(),
    }).optional(),
});

export const feedbackSchema = Joi.object({
    songUrl: Joi.string().uri().required().messages({
        'string.uri': 'Geçerli bir şarkı URL\'si giriniz',
        'any.required': 'Şarkı URL\'si gereklidir',
    }),
    songTitle: Joi.string().max(200).allow('').optional(),
    songArtist: Joi.string().max(200).allow('').optional(),
    rating: Joi.number().integer().min(1).max(3).required().messages({
        'number.min': 'Puan 1-3 arasında olmalıdır',
        'number.max': 'Puan 1-3 arasında olmalıdır',
        'any.required': 'Puan gereklidir',
    }),
    mood: Joi.string()
        .valid(...availableMoods)
        .optional(),
    comment: Joi.string().max(500).allow('').default(''),
});
