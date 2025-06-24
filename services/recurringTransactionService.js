// server/services/recurringTransactionService.js

const { query } = require('../utils/db');

const getAllRecurringTransactions = async () => {
  const sql = 'SELECT * FROM recurring_transactions';
  const { rows } = await query(sql);
  return rows;
};

const getRecurringTransactionById = async (id) => {
  const sql = 'SELECT * FROM recurring_transactions WHERE recurring_id = $1';
  const { rows } = await query(sql, [id]);
  return rows[0];
};

const createRecurringTransaction = async (recurringTransactionData) => {
  const { user_id, account_id, category_id, amount, frequency, next_due_date, description, is_active } = recurringTransactionData;
  const sql = 'INSERT INTO recurring_transactions (user_id, account_id, category_id, amount, frequency, next_due_date, description, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
  const values = [user_id, account_id, category_id, amount, frequency, next_due_date, description, is_active];
  const { rows } = await query(sql, values);
  return rows[0];
};

const updateRecurringTransaction = async (id, recurringTransactionData) => {
  
  const { user_id, account_id, category_id, amount, frequency, next_due_date, description, is_active } = recurringTransactionData;
  const sql = 'UPDATE recurring_transactions SET user_id = $1, account_id = $2, category_id = $3, amount = $4, frequency = $5, next_due_date = $6, description = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP WHERE recurring_id = $9 RETURNING *';
  const values = [user_id, account_id, category_id, amount, frequency, next_due_date, description, is_active, id];
  const { rows } = await query(sql, values);
  return rows[0];
};

const deleteRecurringTransaction = async (id) => {
  const sql = 'DELETE FROM recurring_transactions WHERE recurring_id = $1 RETURNING *';
  const { rows } = await query(sql, [id]);
  return rows[0];
};

module.exports = {
  getAllRecurringTransactions, getRecurringTransactionById, createRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction
};