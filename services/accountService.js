// services/accountService.js

const { query } = require('../utils/db'); // Import the query function from db.js

const accountService = {
  /**
   * Retrieves all accounts from the database.
   * @returns {Promise<Array>} A promise that resolves with an array of accounts.
   */
  async getAllAccounts() {
    try {
      console.log('Fetching all accounts...');
      const sql = 'SELECT * FROM accounts';
      const { rows } = await query(sql);
 return rows;
    } catch (error) {
      console.error('Error fetching all accounts:', error);
      throw error;
    }
  },

  /**
   * Retrieves a specific account by its ID.
   * @param {number} accountId - The ID of the account to retrieve.
   * @returns {Promise<object|null>} A promise that resolves with the account object if found, or null if not found.
   */
  async getAccountById(accountId) {
    try {
      console.log(`Fetching account with ID: ${accountId}`);
      const sql = 'SELECT * FROM accounts WHERE account_id = $1';
      const values = [accountId];
      const { rows } = await query(sql, values);
 return rows[0] || null; // Return the first row or null if not found
    } catch (error) {
      console.error(`Error fetching account with ID ${accountId}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new account in the database.
   * @param {object} accountData - The data for the new account.
   * @returns {Promise<object>} A promise that resolves with the newly created account object.
   */
  async createAccount(accountData) {
    try {
      // console.log('Creating new account:', accountData);
      const sql = 'INSERT INTO accounts (account_name, account_type, current_balance, user_id) VALUES ($1, $2, $3, $4) RETURNING *';
      const values = [
        accountData.account_name,
        accountData.account_type,
        //  accountData.initial_balance,
        accountData.current_balance, // Assuming current_balance is provided or calculated
        //  accountData.currency,
        accountData.user_id, // Assuming user_id is in accountData
      ];
      const { rows } = await query(sql, values);
 return rows[0]; // Return the newly created account
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },

  /**
   * Updates an existing account in the database.
   * @param {number} accountId - The ID of the account to update.
   * @param {object} accountData - The updated data for the account.
   * @returns {Promise<object|null>} A promise that resolves with the updated account object if found and updated, or null if not found.
   */
  async updateAccount(accountId, accountData) {
    try {
      console.log(`Updating account with ID ${accountId}:`, accountData);
      // Construct the UPDATE query dynamically based on provided fields
      const fields = Object.keys(accountData).map((key, index) => `${key} = $${index + 1}`).join(', ');
      const values = Object.values(accountData);
      values.push(accountId); // Add accountId for the WHERE clause

      if (fields.length === 0) {
        return null; // No fields to update
      }
      const sql = `UPDATE accounts SET ${fields} WHERE account_id = $${values.length} RETURNING *`;
      const { rows } = await query(sql, values);
 return rows[0] || null; // Return the updated account or null if not found
    } catch (error) {
      console.error(`Error updating account with ID ${accountId}:`, error);
      throw error;
    }
  },

  /**
   * Deletes an account from the database.
   * @param {number} accountId - The ID of the account to delete.
   * @returns {Promise<boolean>} A promise that resolves with true if the account was deleted successfully, or false if not found.
   */
  async deleteAccount(accountId) {
    try {
      console.log(`Deleting account with ID: ${accountId}`);
      const sql = 'DELETE FROM accounts WHERE account_id = $1 RETURNING *';
      const values = [accountId];
      const { rows } = await query(sql, values);
 return rows.length > 0; // Return true if a row was deleted, false otherwise
    } catch (error) {
      console.error(`Error deleting account with ID ${accountId}:`, error);
      throw error;
    }
  },
};

module.exports = accountService;