// server/controllers/authController.js

const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

// Placeholder controller function for user registration
const register = asyncHandler(async (req, res) => {
  const userData = req.body;
  const newUser = await authService.registerUser(userData);
  res.status(201).json({
    status: 'success',
    data: newUser
  });
});

// Placeholder controller function for user login
const login = asyncHandler(async (req, res) => {
  const {
    email,
    password
  } = req.body;
  const tokens = await authService.loginUser(email, password);

  if (!tokens) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  res.status(200).json({
    status: 'success',
    data: tokens
  });
});

// Placeholder controller function for refreshing access token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      status: 'error',
      message: 'Refresh token is required',
    });
  }

  const newTokens = await authService.refreshAccessToken(refreshToken); // Assuming refreshAccessToken exists in authService

  if (!newTokens) {
    return res.status(403).json({ status: 'error', message: 'Invalid or expired refresh token' });
  }

 res.status(200).json({
    status: 'success',
    data: newTokens
  });
});

// Placeholder controller function for user logout
const logout = asyncHandler(async (req, res) => {
  const {
    refreshToken
  } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ status: 'error', message: 'Refresh token is required' });
  }

  const deletedToken = await authService.deleteRefreshToken(refreshToken);
  if (!deletedToken) {
 return res.status(404).json({ status: 'error', message: 'Refresh token not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.user_id; // Assuming user ID is attached to req.user by authMiddleware

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ status: 'error', message: 'Old password and new password are required' });
  }

  // TODO: Add more robust validation for password complexity
  // TODO: Add validation for oldPassword and newPassword

  await authService.changePassword(userId, oldPassword, newPassword);

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // TODO: Add input validation for email format

  await authService.forgotPassword(email); // Placeholder call

  res.status(200).json({
    status: 'success',
    message: 'Password reset email sent if user exists.',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ status: 'error', message: 'Token and new password are required' });
  }

  // TODO: Add more robust validation for new password complexity

  await authService.resetPassword(token, newPassword);

  res.status(200).json({
    status: 'success',
    message: 'Password has been reset successfully.',
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};