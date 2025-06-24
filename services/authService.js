// server/services/authService.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userTokenService = require('./userTokenService');
const { query } = require('../utils/db'); // Assuming you have a db utility

// Helper function to hash tokens (SHA256)
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Helper function to parse token expiry
const parseTokenExpiry = (expiryString) => {
  if (!expiryString || typeof expiryString !== 'string') return 7 * 24 * 60 * 60 * 1000;
  const expiryValue = parseInt(expiryString.slice(0, -1));
  const expiryUnit = expiryString.slice(-1);
  let expiryMs;
  switch (expiryUnit) {
    case 'd': expiryMs = expiryValue * 24 * 60 * 60 * 1000; break;
    case 'h': expiryMs = expiryValue * 60 * 60 * 1000; break;
    case 'm': expiryMs = expiryValue * 60 * 1000; break;
    default: expiryMs = 7 * 24 * 60 * 60 * 1000;
  }
  return expiryMs;
};

// Register a new user
const registerUser = async (userData) => {
  try {
    // Input validation
    if (!userData.email || !userData.password) throw new Error('Email and password are required');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    const sql = 'INSERT INTO users (email, password_hash, first_name, last_name, phone_number, date_of_birth, profile_picture_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id, email, first_name, last_name, phone_number, date_of_birth, profile_picture_url, created_at, updated_at, last_login, is_active';
    const values = [userData.email, hashedPassword, userData.first_name, userData.last_name, userData.phone_number, userData.date_of_birth, userData.profile_picture_url];
    const { rows } = await query(sql, values);
    const newUser = rows[0];
    // Generate tokens
    const tokens = generateTokens(newUser.user_id, newUser.email);
    await userTokenService.createUserToken({
      user_id: newUser.user_id,
      refresh_token: tokens.refreshToken,
      token_type: 'refresh',
      expires_at: new Date(Date.now() + parseTokenExpiry(process.env.REFRESH_TOKEN_EXPIRY || '7d')),
      device_info: userData.device_info || null,
      ip_address: userData.ip_address || null,
      last_used_at: new Date(),
      is_active: true
    });
    return { user: newUser, ...tokens };
  } catch (error) {
    throw new Error('Registration failed');
  }
};

// Login user
const loginUser = async (email, password, device_info, ip_address) => {
  try {
    if (!email || !password) throw new Error('Email and password required');
    const userSql = 'SELECT * FROM users WHERE email = $1';
    const { rows: userRows } = await query(userSql, [email]);
    const user = userRows[0];
    if (!user) throw new Error('Invalid credentials');
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      // Optionally: increment failed login attempts here
      throw new Error('Invalid credentials');
    }
    // Update last_login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [user.user_id]);
    delete user.password_hash;
    const tokens = generateTokens(user.user_id, user.email);
    await userTokenService.createUserToken({
      user_id: user.user_id,
      refresh_token: tokens.refreshToken,
      token_type: 'refresh',
      expires_at: new Date(Date.now() + parseTokenExpiry(process.env.REFRESH_TOKEN_EXPIRY || '7d')),
      device_info: device_info || null,
      ip_address: ip_address || null,
      last_used_at: new Date(),
      is_active: true
    });
    return { user, ...tokens };
  } catch (error) {
    throw new Error('Login failed');
  }
};

// Generate access and refresh tokens
const generateTokens = (userId, email) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';
  const accessToken = jwt.sign({ userId, email }, accessTokenSecret, { expiresIn: accessTokenExpiry });
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
  const refreshToken = jwt.sign({ userId, email }, refreshTokenSecret, { expiresIn: refreshTokenExpiry });
  return { accessToken, refreshToken };
};

// Generate auth tokens for Google auth
const generateAuthTokens = async (user, device_info, ip_address) => {
  const tokens = generateTokens(user.user_id, user.email);
  await userTokenService.createUserToken({
    user_id: user.user_id,
    refresh_token: tokens.refreshToken,
    token_type: 'refresh',
    expires_at: new Date(Date.now() + parseTokenExpiry(process.env.REFRESH_TOKEN_EXPIRY || '7d')),
    device_info: device_info || null,
    ip_address: ip_address || null,
    last_used_at: new Date(),
    is_active: true
  });
  return tokens;
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

// Verify refresh token
const verifyRefreshToken = async (token, user_id) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const found = await userTokenService.findTokenByHashAndType(token, 'refresh', user_id || decoded.userId);
    if (!found) throw new Error('Invalid, expired, or inactive refresh token');
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Refresh access token
const refreshAccessToken = async (refreshToken, device_info, ip_address) => {
  try {
    const decoded = await verifyRefreshToken(refreshToken);
    // Token rotation: invalidate old
    await userTokenService.invalidateTokenByHashAndType(refreshToken, 'refresh', decoded.userId);
    // Generate new tokens
    const newTokens = generateTokens(decoded.userId, decoded.email);
    await userTokenService.createUserToken({
      user_id: decoded.userId,
      refresh_token: newTokens.refreshToken,
      token_type: 'refresh',
      expires_at: new Date(Date.now() + parseTokenExpiry(process.env.REFRESH_TOKEN_EXPIRY || '7d')),
      device_info: device_info || null,
      ip_address: ip_address || null,
      last_used_at: new Date(),
      is_active: true
    });
    return newTokens;
  } catch (error) {
    throw new Error('Could not refresh token');
  }
};

// Forgot password
const forgotPassword = async (email, device_info, ip_address) => {
  try {
    if (!email) return;
    const userSql = 'SELECT user_id, email FROM users WHERE email = $1';
    const { rows: userRows } = await query(userSql, [email]);
    const user = userRows[0];
    if (!user) return;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await userTokenService.createUserToken({
      user_id: user.user_id,
      refresh_token: resetToken,
      token_type: 'password_reset',
      expires_at: expiresAt,
      device_info: device_info || null,
      ip_address: ip_address || null,
      last_used_at: new Date(),
      is_active: true
    });
    // TODO: Send email with resetToken
    console.log(`Password reset token for ${user.email}: ${resetToken}`);
  } catch (error) {
    throw new Error('Could not process forgot password');
  }
};

// Change password
const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    if (!oldPassword || !newPassword) throw new Error('Old and new password required');
    const userSql = 'SELECT user_id, password_hash FROM users WHERE user_id = $1';
    const { rows: userRows } = await query(userSql, [userId]);
    const user = userRows[0];
    if (!user) throw new Error('User not found');
    const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!passwordMatch) throw new Error('Invalid old password');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [hashedPassword, userId]);
  } catch (error) {
    throw new Error('Password change failed');
  }
};

// Reset password
const resetPassword = async (token, newPassword) => {
  try {
    if (!token || !newPassword) throw new Error('Token and new password required');
    // Find the token in user_tokens with type 'password_reset' (no user_id required)
    const found = await userTokenService.findPasswordResetToken(token);
    if (!found) throw new Error('Invalid, expired, or used reset token');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [hashedPassword, found.user_id]);
    await userTokenService.invalidateTokenByHashAndType(token, 'password_reset', found.user_id);
  } catch (error) {
    throw new Error('Password reset failed');
  }
};

// Delete refresh token
const deleteRefreshToken = async (refreshToken, user_id) => {
  try {
    const found = await userTokenService.invalidateTokenByHashAndType(refreshToken, 'refresh', user_id);
    return found;
  } catch (error) {
    throw new Error('Could not delete refresh token');
  }
};

// Cleanup expired tokens
const cleanupExpiredTokens = async () => {
  try {
    return await userTokenService.cleanupExpiredTokens();
  } catch (error) {
    throw new Error('Could not cleanup tokens');
  }
};

module.exports = {
  registerUser,
  loginUser,
  generateTokens,
  generateAuthTokens,
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken,
  deleteRefreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  cleanupExpiredTokens,
};