// server/controllers/authController.js

const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService'); // Import userService

// Placeholder controller function for user registration
const register = asyncHandler(async (req, res) => {
  const userData = req.body;
  const newUser = await authService.registerUser(userData);
  
  // Generate default avatar URL based on first name (example using Gravatar)
  // newUser.profile_picture_url = `https://www.gravatar.com/avatar/?d=retro&s=200&d=identicon&r=g&f=${newUser.firstName.charAt(0).toUpperCase()}`;
  newUser.profile_picture_url = userService.generateDefaultAvatarUrl(newUser.first_name);

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
// Google authentication callback
const googleAuthCallback = asyncHandler(async (req, res) => {
  // Passport.js successfully authenticated the user
  // The user information is available in req.user
  const googleProfile = req.user;

  // Check if the user already exists in the database
  let user = await userService.getUserByEmail(googleProfile.emails[0].value);

  if (!user) {
    // If user doesn't exist, create a new user
    const newUser = {
      email: googleProfile.emails[0].value,
      first_name: googleProfile.name.givenName,
      last_name: googleProfile.name.familyName,
      profile_picture_url: googleProfile.photos && googleProfile.photos.length > 0 ? googleProfile.photos[0].value : undefined,
      // Add other fields as needed
    };
    user = await userService.createUser(newUser);
  } else {
    // If user exists, you might want to update their profile picture if it's changed
    if (googleProfile.photos && googleProfile.photos.length > 0 && user.profile_picture_url !== googleProfile.photos[0].value) {
      user.profile_picture_url = googleProfile.photos[0].value;
      await userService.updateUser(user._id, { profile_picture_url: user.profile_picture_url });
    }
  }

  // Generate tokens for the user (you'll need a function in authService for this)
  const tokens = await authService.generateAuthTokens(user); // Assuming generateAuthTokens exists in authService

  // Redirect the user to your frontend application with tokens or other relevant info
  // This is a placeholder redirect, adjust as per your frontend setup
  res.redirect(`YOUR_FRONTEND_REDIRECT_URL?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  googleAuthCallback,
};