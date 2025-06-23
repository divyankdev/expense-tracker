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
  // Add messages for other operations (registration, transactions, etc.)
  USER_REGISTERED_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  TRANSACTION_CREATED_SUCCESS: 'Transaction created successfully',
  TRANSACTION_UPDATED_SUCCESS: 'Transaction updated successfully',
  TRANSACTION_DELETED_SUCCESS: 'Transaction deleted successfully',
  // ... Add other specific messages here
};

module.exports = {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
};