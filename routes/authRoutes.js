const express = require('express');
const authController = require('../controllers/authController');

const authService = require('../services/authService');
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
      const user = req.user; // User is available in req.user after Passport authentication
      const tokens = authService.generateTokens(user.user_id);
      await authService.saveRefreshToken(user.user_id, tokens.refreshToken);
      res.json({ user, ...tokens });
    } catch (error) {
      next(error); // Pass errors to the error handling middleware
    }
  });

// Password management routes
// router.put('/change-password', authMiddleware, authController.changePassword); // Add change-password route

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;