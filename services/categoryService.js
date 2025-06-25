// server/services/categoryService.js

const { query } = require('../utils/db');
const categoryService = {
  getAllCategories: async () => {
    // Placeholder for fetching all categories from the database
    const sql = 'SELECT * FROM categories';
    const { rows } = await query(sql);
    return rows;
  },

  getCategoryById: async (categoryId) => {
    // Placeholder for fetching a category by its ID from the database
    const sql = 'SELECT * FROM categories WHERE category_id = $1';
    const { rows } = await query(sql, [categoryId]);
    return rows[0];
  },

  createCategory: async (categoryData) => {
    // Placeholder for creating a new category in the database
    const { user_id, parent_category_id, category_name, category_type, color, icon } = categoryData;
    const sql = 'INSERT INTO categories (user_id, parent_category_id, category_name, category_type, color, icon) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const values = [user_id, parent_category_id, category_name, category_type, color, icon];
    const { rows } = await query(sql, values);
    return rows[0];
  },

  updateCategory: async (categoryId, categoryData) => {
    // Placeholder for updating a category in the database
    console.log('Category Data: ', categoryData);
    const { user_id, parent_category_id, category_name, category_type, color, icon } = categoryData;
    const sql = 'UPDATE categories SET user_id = $1, parent_category_id = $2, category_name = $3, category_type = $4, color = $5, icon = $6, updated_at = CURRENT_TIMESTAMP WHERE category_id = $7 RETURNING *';
    const values = [user_id, parent_category_id, category_name, category_type, color, icon, categoryId];
    const { rows } = await query(sql, values);
    return rows[0];
  },

  deleteCategory: async (categoryId) => {
    // Placeholder for deleting a category from the database
    const sql = 'DELETE FROM categories WHERE category_id = $1 RETURNING *';
    const { rows } = await query(sql, [categoryId]);
    return rows[0];
  },
    
};

module.exports = categoryService;