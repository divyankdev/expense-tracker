// server/services/budgetService.js

const { query } = require('../utils/db');
const { toCamelCase, toSnakeCase } = require('../utils/caseConverter');

const getAllBudgets = async () => {
  const sql = `
    SELECT b.*, c.category_name
    FROM budgets b
    JOIN categories c ON b.category_id = c.category_id
  `;
  const { rows } = await query(sql);
  return toCamelCase(rows);
};

const getBudgetById = async (budgetId) => {
  const sql = `
    SELECT b.*, c.category_name
    FROM budgets b
    JOIN categories c ON b.category_id = c.category_id
    WHERE b.budget_id = $1
  `;
  const { rows } = await query(sql, [budgetId]);
  return toCamelCase(rows[0]);
};

const createBudget = async (budgetData) => {
  const snakeData = toSnakeCase(budgetData);
  const { user_id, category_id, amount, period, start_date, end_date, is_active } = snakeData;
  const sql = 'INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
  const values = [user_id, category_id, amount, period, start_date, end_date, is_active];
  const { rows } = await query(sql, values);
  // Fetch with join to get category name
  return await getBudgetById(rows[0].budget_id);
};

const updateBudget = async (budgetId, budgetData) => {
  const snakeData = toSnakeCase(budgetData);
  const { user_id, category_id, amount, period, start_date, end_date, is_active } = snakeData;
  const sql = 'UPDATE budgets SET user_id = $1, category_id = $2, amount = $3, period = $4, start_date = $5, end_date = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP WHERE budget_id = $8 RETURNING *';
  const values = [user_id, category_id, amount, period, start_date, end_date, is_active, budgetId];
  const { rows } = await query(sql, values);
  // Fetch with join to get category name
  return await getBudgetById(rows[0].budget_id);
};

const deleteBudget = async (budgetId) => {
  // Get the budget before deleting for return
  const budget = await getBudgetById(budgetId);
  const sql = 'DELETE FROM budgets WHERE budget_id = $1';
  await query(sql, [budgetId]);
  return budget;
};

module.exports = {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
};