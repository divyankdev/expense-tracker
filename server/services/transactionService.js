// server/services/transactionService.js

const { query } = require('/home/user/expense-tracker/server/utils/db');

const getAllTransactions = async () => {
  const sql = 'SELECT * FROM transactions';
  const { rows } = await query(sql);
  return rows;
};

const getTransactionById = async (transactionId) => {
  const sql = 'SELECT * FROM transactions WHERE transaction_id = $1';
  const { rows } = await query(sql, [transactionId]);
  return rows[0];
};

const createTransaction = async (transactionData) => {
  const { user_id, account_id, category_id, amount, transaction_type, description, transaction_date } = transactionData;
  const sql = 'INSERT INTO transactions (user_id, account_id, category_id, amount, transaction_type, description, transaction_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
  const values = [user_id, account_id, category_id, amount, transaction_type, description, transaction_date];
  const { rows } = await query(sql, values);
  return rows[0];
};

const updateTransaction = async (transactionId, transactionData) => {
  const { user_id, account_id, category_id, amount, transaction_type, description, transaction_date } = transactionData;
  const sql = `
    UPDATE transactions
    SET user_id = $1, account_id = $2, category_id = $3, amount = $4, transaction_type = $5, description = $6, transaction_date = $7, updated_at = CURRENT_TIMESTAMP
    WHERE transaction_id = $8
    RETURNING *`;
  const values = [user_id, account_id, category_id, amount, transaction_type, description, transaction_date, transactionId];
  const { rows } = await query(sql, values);
  return rows[0];
};

const deleteTransaction = async (transactionId) => {
  const sql = 'DELETE FROM transactions WHERE transaction_id = $1 RETURNING *';
  const { rows } = await query(sql, [transactionId]);
  return rows[0];
};

const transactionService = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

module.exports = transactionService;