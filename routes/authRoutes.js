const express = require('express');
const authController = require('../controllers/authController');
const userTokenService = require('../services/userTokenService');
const responseHandler = require('../utils/responseHandler');
const { HTTP_STATUS_CODES, RESPONSE_MESSAGES } = require('../utils/constants');
const authService = require('../services/authService');
const { toCamelCase, toSnakeCase } = require('../utils/caseConverter');
// const { parseTokenExpiry } = require('../utils/parseTokenExpiry');

const authMiddleware = require('../middleware/authMiddleware'); // Import authMiddleware
const passport = require('passport');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }), // Use session: false for API
  async (req, res, next) => {
    try {
      // Successful authentication, generate and send tokens
      const user = {
        ...req.user, // User is available in req.user after Passport authentication
        profile_picture_url: req.user.photos && req.user.photos.length > 0 ? req.user.photos[0].value : null // Extract profile picture URL
      };
      const tokens = authService.generateTokens(user.user_id);
      // await authService.saveRefreshToken(user.user_id, tokens.refreshToken);
      await userTokenService.createUserToken(toSnakeCase({
        userId: user.userId,
        refreshToken: tokens.refreshToken,
        tokenType: 'refresh',
        expiresAt: new Date(Date.now() + authService.parseTokenExpiry(process.env.REFRESH_TOKEN_EXPIRY || '7d')),
        deviceInfo:  null,
        ipAddress:  null,
        lastUsedAt: new Date(),
        isActive: true
      }));
      // res.json({ user, ...tokens });
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.CREATED, RESPONSE_MESSAGES.USER_REGISTERED_SUCCESS, user);
    } catch (error) {
      next(error); // Pass errors to the error handling middleware
    }
  });

// Password management routes
// router.put('/change-password', authMiddleware, authController.changePassword); // Add change-password route

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;