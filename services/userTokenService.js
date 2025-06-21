// Placeholder service functions for user token database operations

const { query } = require('../utils/db');

const userTokenService = {
  /**
   * Get all user tokens.
   * @returns {Promise<Array>} A promise that resolves with an array of user tokens.
   */
  getAllUserTokens: async () => {
    const { rows } = await query('SELECT * FROM user_tokens');
 return rows;
  },

  /**
   * Get a user token by ID.
   * @param {number} tokenId The ID of the user token to retrieve.
   * @returns {Promise<object|null>} A promise that resolves with the user token object or null if not found.
   */
  getUserTokenById: async (tokenId) => {const { rows } = await query('SELECT * FROM user_tokens WHERE token_id = $1', [tokenId]);
 return rows[0];
  }
,

  /**
   * Create a new user token.
   * @param {object} userTokenData The data for the new user token.
   * @returns {Promise<object>} A promise that resolves with the created user token object.
   */
  createUserToken: async (userTokenData) => {
    const { user_id, refresh_token_hash, device_info, ip_address, expires_at } = userTokenData;
    const { rows } = await query('INSERT INTO user_tokens (user_id, refresh_token_hash, device_info, ip_address, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *', [user_id, refresh_token_hash, device_info, ip_address, expires_at]);
 return rows[0];
  },

  /**
   * Update an existing user token.
   * @param {number} tokenId The ID of the user token to update.
   * @param {object} userTokenData The updated data for the user token.
   * @returns {Promise<object|null>} A promise that resolves with the updated user token object or null if not found.
   */
  updateUserToken: async (tokenId, userTokenData) => {const { user_id, refresh_token_hash, device_info, ip_address, expires_at, last_used_at, is_active } = userTokenData;
    const { rows } = await query('UPDATE user_tokens SET user_id = $1, refresh_token_hash = $2, device_info = $3, ip_address = $4, expires_at = $5, last_used_at = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP WHERE token_id = $8 RETURNING *', [user_id, refresh_token_hash, device_info, ip_address, expires_at, last_used_at, is_active, tokenId]);
 return rows[0];
  },

  /**
   * Delete a user token by ID.
   * @param {number} tokenId The ID of the user token to delete.
   * @returns {Promise<object|null>} A promise that resolves with the deleted user token object or null if not found.
   */
  deleteUserToken: async (tokenId) => {const { rows } = await query('DELETE FROM user_tokens WHERE token_id = $1 RETURNING *', [tokenId]);
 return rows[0];
  }
};

module.exports = userTokenService;