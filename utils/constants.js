// utils/constants.js

// HTTP Status Codes
const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Response Messages
const RESPONSE_MESSAGES = {
  SUCCESS: 'Operation successful',
  ERROR: 'An error occurred', // Generic error message
  INVALID_CREDENTIALS: 'Invalid credentials',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access denied',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
  INVALID_OR_EXPIRED_REFRESH_TOKEN: 'Invalid or expired refresh token',
  LOGGED_OUT_SUCCESSFULLY: 'Logged out successfully',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent if user exists.',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully.',
  REQUIRED_FIELDS_MISSING: 'Required fields are missing',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_AND_PASSWORD_REQUIRED: 'Token and new password are required',
  REFRESH_TOKEN_NOT_FOUND: 'Refresh token not found',
  OLD_AND_NEW_PASSWORD_REQUIRED: 'Old and new passwords are required',
  // Add messages for other operations (registration, transactions, etc.)
  USER_REGISTERED_SUCCESS: 'User registered successfully',
  USER_UPDATED_SUCCESS: 'User updated successfully',
  USER_DELETED_SUCCESS: 'User deleted successfully',
  USER_NOT_FOUND: 'User not found',
  AVATAR_UPLOADED_SUCCESS: 'Avatar uploaded successfully',
  AVATAR_UPDATED_SUCCESS: 'Avatar updated successfully',
  LOGIN_SUCCESS: 'Login successful',

  USER_TOKEN_NOT_FOUND: 'User token not found',
  USER_TOKEN_CREATED_SUCCESS: 'User token created successfully',
  USER_TOKEN_UPDATED_SUCCESS: 'User token updated successfully',
  USER_TOKEN_DELETED_SUCCESS: 'User token deleted successfully',

  TRANSACTION_CREATED_SUCCESS: 'Transaction created successfully',
  TRANSACTION_UPDATED_SUCCESS: 'Transaction updated successfully',
  TRANSACTION_DELETED_SUCCESS: 'Transaction deleted successfully',
  TRANSACTION_NOT_FOUND: 'Transaction not found',

  ACCOUNT_NOT_FOUND: 'Account not found',
  ACCOUNT_CREATED_SUCCESS: 'Account created successfully',
  ACCOUNT_UPDATED_SUCCESS: 'Account updated successfully',

  ATTACHMENT_CREATED_SUCCESS: 'Attachment created successfully',
  ATTACHMENT_UPDATED_SUCCESS: 'Attachment updated successfully',  
  ATTACHMENT_DELETED_SUCCESS: 'Attachment deleted successfully',
  ATTACHMENT_NOT_FOUND: 'Attachment not found',
  // ... Add other specific messages here
};

module.exports = {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
};