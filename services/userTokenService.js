// Placeholder service functions for user token database operations

const { query } = require('../utils/db');
const crypto = require('crypto');
const { toCamelCase, toSnakeCase } = require('../utils/caseConverter');

// Helper: SHA256 hash for tokens
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Helper: Validate required fields
const validateTokenData = (data, requiredFields) => {
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
};

const userTokenService = {
  /**
   * Get all user tokens.
   * @returns {Promise<Array>} A promise that resolves with an array of user tokens.
   */
  getAllUserTokens: async (tokenType) => {
    let sql = 'SELECT * FROM user_tokens';
    let params = [];
    if (tokenType) {
      sql += ' WHERE token_type = $1';
      params.push(tokenType);
    }
    const { rows } = await query(sql, params);
    return toCamelCase(rows);
  },

  /**
   * Get a user token by ID.
   * @param {number} tokenId The ID of the user token to retrieve.
   * @returns {Promise<object|null>} A promise that resolves with the user token object or null if not found.
   */
  getUserTokenById: async (tokenId) => {
    const { rows } = await query('SELECT * FROM user_tokens WHERE token_id = $1', [tokenId]);
    return toCamelCase(rows[0]);
  },

  /**
   * Create a new user token.
   * @param {object} userTokenData The data for the new user token.
   * @returns {Promise<object>} A promise that resolves with the created user token object.
   */
  createUserToken: async (userTokenData) => {
    const snakeData = toSnakeCase(userTokenData);
    const required = ['user_id', 'refresh_token', 'token_type', 'expires_at'];
    validateTokenData(snakeData, required);
    const {
      user_id,
      refresh_token,
      token_type,
      device_info = null,
      ip_address = null,
      expires_at,
      last_used_at = null,
      is_active = true
    } = snakeData;
    const refresh_token_hash = hashToken(refresh_token);
    const { rows } = await query(
      'INSERT INTO user_tokens (user_id, refresh_token_hash, token_type, device_info, ip_address, expires_at, last_used_at, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [user_id, refresh_token_hash, token_type, device_info, ip_address, expires_at, last_used_at, is_active]
    );
    return toCamelCase(rows[0]);
  },

  /**
   * Update an existing user token.
   * @param {number} tokenId The ID of the user token to update.
   * @param {object} userTokenData The updated data for the user token.
   * @returns {Promise<object|null>} A promise that resolves with the updated user token object or null if not found.
   */
  updateUserToken: async (tokenId, userTokenData) => {
    const snakeData = toSnakeCase(userTokenData);
    const {
      user_id,
      refresh_token, // plain token, will be hashed
      token_type,
      device_info,
      ip_address,
      expires_at,
      last_used_at,
      is_active
    } = snakeData;
    const refresh_token_hash = refresh_token ? hashToken(refresh_token) : undefined;
    const { rows } = await query(
      'UPDATE user_tokens SET user_id = $1, refresh_token_hash = COALESCE($2, refresh_token_hash), token_type = $3, device_info = $4, ip_address = $5, expires_at = $6, last_used_at = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP WHERE token_id = $9 RETURNING *',
      [user_id, refresh_token_hash, token_type, device_info, ip_address, expires_at, last_used_at, is_active, tokenId]
    );
    return toCamelCase(rows[0]);
  },

  /**
   * Delete a user token by ID.
   * @param {number} tokenId The ID of the user token to delete.
   * @returns {Promise<object|null>} A promise that resolves with the deleted user token object or null if not found.
   */
  deleteUserToken: async (tokenId) => {
    const { rows } = await query('DELETE FROM user_tokens WHERE token_id = $1 RETURNING *', [tokenId]);
    return toCamelCase(rows[0]);
  },

  // Find token by hash and type (for refresh or password reset)
  findTokenByHashAndType: async (token, token_type, user_id) => {
    const token_hash = hashToken(token);
    const { rows } = await query(
      'SELECT * FROM user_tokens WHERE refresh_token_hash = $1 AND token_type = $2 AND user_id = $3 AND is_active = true AND expires_at > NOW()',
      [token_hash, token_type, user_id]
    );
    return toCamelCase(rows[0]);
  },

  // Find password reset token by hash and type only (no user_id required)
  findPasswordResetToken: async (token) => {
    const token_hash = hashToken(token);
    const { rows } = await query(
      'SELECT * FROM user_tokens WHERE refresh_token_hash = $1 AND token_type = $2 AND is_active = true AND expires_at > NOW()',
      [token_hash, 'password_reset']
    );
    return toCamelCase(rows[0]);
  },

  // Invalidate token by hash and type
  invalidateTokenByHashAndType: async (token, token_type, user_id) => {
    const token_hash = hashToken(token);
    const { rows } = await query(
      'UPDATE user_tokens SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE refresh_token_hash = $1 AND token_type = $2 AND user_id = $3 RETURNING *',
      [token_hash, token_type, user_id]
    );
    return toCamelCase(rows[0]);
  },

  // Cleanup expired or inactive tokens
  cleanupExpiredTokens: async () => {
    const { rows } = await query('DELETE FROM user_tokens WHERE expires_at < NOW() OR is_active = false RETURNING *');
    return rows.length;
  }
};

module.exports = userTokenService;