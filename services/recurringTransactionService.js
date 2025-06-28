const { query } = require('../utils/db');
const { toCamelCase, toSnakeCase } = require('../utils/caseConverter');

const getAllRecurringTransactions = async () => {
  const sql = `
    SELECT rt.*, a.account_name, c.category_name
    FROM recurring_transactions rt
    JOIN accounts a ON rt.account_id = a.account_id
    JOIN categories c ON rt.category_id = c.category_id
  `;
  const { rows } = await query(sql);
  return toCamelCase(rows);
};

const getRecurringTransactionById = async (id) => {
  const sql = `
    SELECT rt.*, a.account_name, c.category_name
    FROM recurring_transactions rt
    JOIN accounts a ON rt.account_id = a.account_id
    JOIN categories c ON rt.category_id = c.category_id
    WHERE rt.recurring_id = $1
  `;
  const { rows } = await query(sql, [id]);
  return toCamelCase(rows[0]);
};

const createRecurringTransaction = async (recurringTransactionData) => {
  const snakeData = toSnakeCase(recurringTransactionData);
  const {
    user_id, account_id, category_id,
    amount, frequency, next_due_date,
    description, is_active
  } = snakeData;

  const sql = `
    INSERT INTO recurring_transactions 
    (user_id, account_id, category_id, amount, frequency, next_due_date, description, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const values = [user_id, account_id, category_id, amount, frequency, next_due_date, description, is_active];
  const { rows } = await query(sql, values);
  return await getRecurringTransactionById(rows[0].recurring_id);
};

const updateRecurringTransaction = async (id, recurringTransactionData) => {
  const snakeData = toSnakeCase(recurringTransactionData);
  const {
    user_id, account_id, category_id,
    amount, frequency, next_due_date,
    description, is_active
  } = snakeData;

  const sql = `
    UPDATE recurring_transactions 
    SET user_id = $1, account_id = $2, category_id = $3,
        amount = $4, frequency = $5, next_due_date = $6,
        description = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
    WHERE recurring_id = $9
    RETURNING *
  `;
  const values = [user_id, account_id, category_id, amount, frequency, next_due_date, description, is_active, id];
  const { rows } = await query(sql, values);
  return await getRecurringTransactionById(rows[0].recurring_id);
};

const deleteRecurringTransaction = async (id) => {
  const transaction = await getRecurringTransactionById(id);
  const sql = 'DELETE FROM recurring_transactions WHERE recurring_id = $1';
  await query(sql, [id]);
  return transaction;
};

module.exports = {
  getAllRecurringTransactions,
  getRecurringTransactionById,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
};
