import express from 'express';
import validateRequest from '../../../middleware/validation.middleware';
import { authController } from './auth.controller';
import { loginValidation, signupValidation } from './auth.validation';

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', validateRequest(signupValidation), authController.signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateRequest(loginValidation), authController.login);

export const authRoutes = router;
