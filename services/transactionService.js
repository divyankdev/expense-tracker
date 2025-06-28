// /home/user/expense-tracker/services/transactionService.js

const { query } = require('../utils/db');
const { toCamelCase, toSnakeCase } = require('../utils/caseConverter');

const getAllTransactions = async () => {
  const sql = `
    SELECT t.*, a.account_name, c.category_name
    FROM transactions t
    JOIN accounts a ON t.account_id = a.account_id
    JOIN categories c ON t.category_id = c.category_id
  `;
  const { rows } = await query(sql);
  return toCamelCase(rows);
};

const getTransactionById = async (transactionId) => {
  const sql = `
    SELECT t.*, a.account_name, c.category_name
    FROM transactions t
    JOIN accounts a ON t.account_id = a.account_id
    JOIN categories c ON t.category_id = c.category_id
    WHERE t.transaction_id = $1
  `;
  const { rows } = await query(sql, [transactionId]);
  return toCamelCase(rows[0]);
};

const createTransaction = async (transactionData) => {
  const snakeData = toSnakeCase(transactionData);
  const { user_id, account_id, category_id, amount, transaction_type, description, transaction_date } = snakeData;
  const sql = 'INSERT INTO transactions (user_id, account_id, category_id, amount, transaction_type, description, transaction_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
  const values = [user_id, account_id, category_id, amount, transaction_type, description, transaction_date];
  const { rows } = await query(sql, values);
  // Fetch with join to get names
  return await getTransactionById(rows[0].transaction_id);
};

const updateTransaction = async (transactionId, transactionData) => {
  const snakeData = toSnakeCase(transactionData);
  const { user_id, account_id, category_id, amount, transaction_type, description, transaction_date } = snakeData;
  const sql = `
    UPDATE transactions
    SET user_id = $1, account_id = $2, category_id = $3, amount = $4, transaction_type = $5, description = $6, transaction_date = $7, updated_at = CURRENT_TIMESTAMP
    WHERE transaction_id = $8
    RETURNING *`;
  const values = [user_id, account_id, category_id, amount, transaction_type, description, transaction_date, transactionId];
  const { rows } = await query(sql, values);
  // Fetch with join to get names
  return await getTransactionById(rows[0].transaction_id);
};

const deleteTransaction = async (transactionId) => {
  // Get the transaction before deleting for return
  const transaction = await getTransactionById(transactionId);
  const sql = 'DELETE FROM transactions WHERE transaction_id = $1';
  await query(sql, [transactionId]);
  return transaction;
};

const transactionService = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

module.exports = transactionService;