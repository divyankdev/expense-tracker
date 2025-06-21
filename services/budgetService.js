// server/services/budgetService.js

const { query } = require('../utils/db');

const getAllBudgets = async () => {
  const sql = 'SELECT * FROM budgets';
  const { rows } = await query(sql);
  return rows;
};

const getBudgetById = async (budgetId) => {
  const sql = 'SELECT * FROM budgets WHERE budget_id = $1';
  const { rows } = await query(sql, [budgetId]);
  return rows[0];
};

const createBudget = async (budgetData) => {
  const { user_id, category_id, amount, period, start_date, end_date, is_active } = budgetData;
  const sql = 'INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
  const values = [user_id, category_id, amount, period, start_date, end_date, is_active];
  const { rows } = await query(sql, values);
  return rows[0];
};

const updateBudget = async (budgetId, budgetData) => {
  const { user_id, category_id, amount, period, start_date, end_date, is_active } = budgetData;
  const sql = 'UPDATE budgets SET user_id = $1, category_id = $2, amount = $3, period = $4, start_date = $5, end_date = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP WHERE budget_id = $8 RETURNING *';
  const values = [user_id, category_id, amount, period, start_date, end_date, is_active, budgetId];
  const { rows } = await query(sql, values);
  return rows[0];
};

const deleteBudget = async (budgetId) => {
  const sql = 'DELETE FROM budgets WHERE budget_id = $1 RETURNING *';
  const { rows } = await query(sql, [budgetId]);
  return rows[0];
};

module.exports = {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
};