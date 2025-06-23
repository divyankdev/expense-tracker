// server/services/authService.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../utils/db'); // Assuming you have a db utility

// Helper function to hash tokens
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Helper function to parse token expiry
const parseTokenExpiry = (expiryString) => {
  const expiryValue = parseInt(expiryString.slice(0, -1));
  const expiryUnit = expiryString.slice(-1);
  
  let expiryMs;
  switch(expiryUnit) {
    case 'd': expiryMs = expiryValue * 24 * 60 * 60 * 1000; break;
    case 'h': expiryMs = expiryValue * 60 * 60 * 1000; break;
    case 'm': expiryMs = expiryValue * 60 * 1000; break;
    default: expiryMs = 7 * 24 * 60 * 60 * 1000; // Default 7 days
  }
  
  return expiryMs;
};

// Placeholder function to register a new user
const registerUser = async (userData) => {
  try {
    // Hash the password
    const saltRounds = 10; // Cost factor for hashing
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Insert user into the database
    const sql = 'INSERT INTO users (email, password_hash, first_name, last_name, phone_number, date_of_birth, profile_picture_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id, email, first_name, last_name, phone_number, date_of_birth, profile_picture_url, created_at, updated_at, last_login, is_active';
    const values = [
      userData.email, hashedPassword, userData.first_name, userData.last_name,
      userData.phone_number, userData.date_of_birth, userData.profile_picture_url
    ];
    const { rows } = await query(sql, values);

    const newUser = rows[0];

    // Generate tokens
    const tokens = generateTokens(newUser.user_id, newUser.email);
    await saveRefreshToken(newUser.user_id, tokens.refreshToken);
    return { user: newUser, ...tokens };
  } catch (error) {
    throw error;
  }
};

// Placeholder function to log in a user
const loginUser = async (email, password) => {
  try {
    // Find user by email
    const userSql = 'SELECT * FROM users WHERE email = $1';
    const { rows: userRows } = await query(userSql, [email]);
    const user = userRows[0];

    if (!user) {
      throw new Error('User not found'); // User does not exist
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      throw new Error('Invalid password'); // Password does not match
    }

    // Generate tokens
    const tokens = generateTokens(user.user_id, user.email); // Pass user ID and email to tokens

    // Exclude password hash from the returned user object
    delete user.password_hash;

    // Save refresh token in the database
    await saveRefreshToken(user.user_id, tokens.refreshToken);

    return { user, ...tokens };
  } catch (error) {
    throw error;
  }
};

// Placeholder function to generate access and refresh tokens
const generateTokens = (userId, email) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';
  const accessToken = jwt.sign({ userId, email }, accessTokenSecret, { expiresIn: accessTokenExpiry });
  
  // Use a different secret for refresh tokens
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
  const refreshToken = jwt.sign({ userId, email }, refreshTokenSecret, { expiresIn: refreshTokenExpiry });
  
  return { accessToken, refreshToken };
};

// FIXED: Missing function - Generate auth tokens (used in Google auth)
const generateAuthTokens = async (user) => {
  const tokens = generateTokens(user.user_id, user.email);
  await saveRefreshToken(user.user_id, tokens.refreshToken);
  return tokens;
};

// Placeholder function to verify access token
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid access token'); // Re-throw a generic error for security
  }
};

// FIXED: Function to verify refresh token and check against database with hashing
const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // Hash the token to compare with stored hash
    const tokenHash = hashToken(token);

    // Check if the refresh token exists in the database and is active
    const sql = 'SELECT * FROM user_tokens WHERE refresh_token_hash = $1 AND user_id = $2 AND is_active = true AND expires_at > NOW()';
    const { rows } = await query(sql, [tokenHash, decoded.userId]);

    const tokenExists = rows.length > 0;

    if (!tokenExists) {
      throw new Error('Invalid, expired, or inactive refresh token');
    }

    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token'); // Re-throw a generic error for security
  }
};

// FIXED: Missing function - Refresh access token with proper verification
const refreshAccessToken = async (refreshToken) => {
  try {
    // First verify the refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    
    // Generate new tokens
    const newTokens = generateTokens(decoded.userId, decoded.email);
    
    // Invalidate old refresh token (token rotation)
    await deleteRefreshToken(refreshToken);
    
    // Save new refresh token
    await saveRefreshToken(decoded.userId, newTokens.refreshToken);
    
    return newTokens;
  } catch (error) {
    throw error;
  }
};

// Function to handle forgot password request
const forgotPassword = async (email) => {
  try {
    // Find user by email
    const userSql = 'SELECT user_id, email FROM users WHERE email = $1';
    const { rows: userRows } = await query(userSql, [email]);
    const user = userRows[0];

    // Do not reveal if user not found for security
    if (!user) {
      console.warn(`Forgot password attempt for non-existent email: ${email}`);
      return; // Silently succeed to prevent email enumeration
    }

    // Generate a unique token (e.g., using crypto)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before saving to database (good practice)
    const tokenHash = hashToken(resetToken); // Use consistent hashing

    // Set token expiry (e.g., 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save the token in the user_tokens table with type 'password_reset'
    const saveTokenSql = 'INSERT INTO user_tokens (user_id, refresh_token_hash, expires_at) VALUES ($1, $2, $3) RETURNING *';
    const { rows: tokenRows } = await query(saveTokenSql, [user.user_id, tokenHash, expiresAt, 'password_reset']);
    const savedToken = tokenRows[0];

    // TODO: Send email to user.
    // This would involve integrating an email sending service.
    // The email should contain a link to your frontend's password reset page,
    // including the generated `resetToken` as a query parameter.
    // Example link: https://yourfrontend.com/reset-password?token=GENERATED_TOKEN

    console.log(`Password reset token generated for user ${user.email}: ${resetToken}`);
    // In a real app, you'd send the email here instead of logging the token.

  } catch (error) {
    console.error('Error in forgotPassword service:', error);
    throw error;
  }
};

// Function to change a user's password
const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    // Retrieve the user from the database
    const userSql = 'SELECT user_id, password_hash FROM users WHERE user_id = $1';
    const { rows: userRows } = await query(userSql, [userId]);
    const user = userRows[0];

    if (!user) {
      throw new Error('User not found.'); // Should not happen if authMiddleware is used correctly
    }

    // Compare the provided old password with the stored password hash
    const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);

    if (!passwordMatch) {
      throw new Error('Invalid old password.');
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password hash in the database
    const updateSql = 'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING user_id';
    await query(updateSql, [hashedPassword, userId]);

  } catch (error) {
    throw error;
  }
};

// FIXED: Function to handle reset password request with proper token comparison
const resetPassword = async (token, newPassword) => {
  try {
    // Hash the provided token to compare with stored hash
    const tokenHash = hashToken(token);

    // Find the token in user_tokens that matches the hashed token
    const findTokenSql = `
      SELECT ut.*, u.user_id 
      FROM user_tokens ut 
      JOIN users u ON ut.user_id = u.user_id 
      WHERE ut.refresh_token_hash = $1 
        // AND ut.token_type = 'password_reset' 
        AND ut.is_active = true 
        AND ut.expires_at > NOW()
    `;
    const { rows: tokenRows } = await query(findTokenSql, [tokenHash]);

    if (tokenRows.length === 0) {
      throw new Error('Invalid, expired, or used reset token.');
    }

    const validTokenEntry = tokenRows[0];

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password hash
    const updatePasswordSql = 'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2';
    await query(updatePasswordSql, [hashedPassword, validTokenEntry.user_id]);

    // Invalidate the token from the database
    const invalidateTokenSql = 'UPDATE user_tokens SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE token_id = $1';
    await query(invalidateTokenSql, [validTokenEntry.token_id]);

  } catch (error) {
    throw error;
  }
};

// FIXED: Function to save refresh token in the database with hashing
const saveRefreshToken = async (userId, refreshToken) => {
  try {
    // Hash the refresh token before saving
    const tokenHash = hashToken(refreshToken);
    
    // Parse expiry properly
    const expiryString = process.env.REFRESH_TOKEN_EXPIRY || '7d';
    const expiryMs = parseTokenExpiry(expiryString);
    const expiresAt = new Date(Date.now() + expiryMs);

    // Insert the new refresh token with hash
    const sql = 'INSERT INTO user_tokens (user_id, refresh_token_hash, expires_at) VALUES ($1, $2, $3) RETURNING *';
    const { rows } = await query(sql, [userId, tokenHash, expiresAt]);
    return rows[0];

  } catch (error) {
    throw error;
  }
};

// FIXED: Function to delete refresh token from the database with hashing
const deleteRefreshToken = async (refreshToken) => {
  try {
    // Hash the token to find it in database
    const tokenHash = hashToken(refreshToken);
    
    const sql = 'DELETE FROM user_tokens WHERE refresh_token_hash = $1 RETURNING *';
    const { rows } = await query(sql, [tokenHash]);
    return rows[0]; // Return the deleted token info
  } catch (error) {
    throw error;
  }
};

// NEW: Function to cleanup expired tokens
const cleanupExpiredTokens = async () => {
  try {
    const sql = 'DELETE FROM user_tokens WHERE expires_at < NOW() OR is_active = false';
    const { rows } = await query(sql);
    return rows.length; // Return count of cleaned up tokens
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  generateTokens,
  generateAuthTokens, // ADDED
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken, // ADDED
  saveRefreshToken,
  deleteRefreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  cleanupExpiredTokens, // ADDED
};