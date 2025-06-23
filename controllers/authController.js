// server/controllers/authController.js

const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const responseHandler = require('../utils/responseHandler');
const { HTTP_STATUS_CODES, RESPONSE_MESSAGES } = require('../utils/constants');
const userService = require('../services/userService'); // Import userService

// Placeholder controller function for user registration
const register = asyncHandler(async (req, res) => {
  const userData = req.body;
  const newUser = await authService.registerUser(userData);
  
  // Generate default avatar URL based on first name (example using Gravatar)
  // newUser.profile_picture_url = `https://www.gravatar.com/avatar/?d=retro&s=200&d=identicon&r=g&f=${newUser.firstName.charAt(0).toUpperCase()}`;
  newUser.profile_picture_url = userService.generateDefaultAvatarUrl(newUser.first_name);

  responseHandler.sendSuccess(res, HTTP_STATUS_CODES.CREATED, RESPONSE_MESSAGES.USER_REGISTERED_SUCCESS, newUser);
});

// Placeholder controller function for user login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const tokens = await authService.loginUser(email, password);
  responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.LOGIN_SUCCESS, tokens);
});

// FIXED: Placeholder controller function for refreshing access token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return responseHandler.sendError(res, HTTP_STATUS_CODES.UNAUTHORIZED, RESPONSE_MESSAGES.REFRESH_TOKEN_REQUIRED);
  }

  // Now properly calls the existing refreshAccessToken function which includes verification
  const newTokens = await authService.refreshAccessToken(refreshToken);
  responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, newTokens);
});

// IMPROVED: Placeholder controller function for user logout with better error handling
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return responseHandler.sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, RESPONSE_MESSAGES.REFRESH_TOKEN_REQUIRED);
  }

  // Optional: Verify token before deletion for better security
  await authService.verifyRefreshToken(refreshToken);
  const deletedToken = await authService.deleteRefreshToken(refreshToken);
  
  if (!deletedToken) {
    return responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.REFRESH_TOKEN_NOT_FOUND);
  }
  
  responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.LOGGED_OUT_SUCCESSFULLY);
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.user_id; // Assuming user ID is attached to req.user by authMiddleware

  if (!oldPassword || !newPassword) {
    return responseHandler.sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, RESPONSE_MESSAGES.OLD_AND_NEW_PASSWORD_REQUIRED);
  } 
  
  // TODO: Add validation for oldPassword and newPassword
  // TODO: Add more robust validation for password complexity
  
  await authService.changePassword(userId, oldPassword, newPassword);
  responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.PASSWORD_CHANGE_SUCCESS);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return responseHandler.sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, 'Email is required');
  }
  
  // TODO: Add input validation for email format
  await authService.forgotPassword(email); // Placeholder call
  responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.PASSWORD_RESET_EMAIL_SENT);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return responseHandler.sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, RESPONSE_MESSAGES.TOKEN_AND_PASSWORD_REQUIRED);
  }

  // TODO: Add more robust validation for new password complexity

  await authService.resetPassword(token, newPassword);
  responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.PASSWORD_RESET_SUCCESS);
});

// FIXED: Google authentication callback with proper error handling
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

  // Generate tokens for the user (now using the fixed function)
  const tokens = await authService.generateAuthTokens(user);

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