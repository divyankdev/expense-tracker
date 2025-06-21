// server/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = await authService.verifyAccessToken(token);

      // Attach user payload to request
      req.user = decoded; // Assuming the decoded payload contains user information

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect };