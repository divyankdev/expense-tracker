// server/services/userService.js

const { query } = require('../utils/db');
const { toCamelCase, toSnakeCase } = require('../utils/caseConverter');

// Placeholder function to get all users
const getAllUsers = async () => {
  const sql = 'SELECT * FROM users';
  const { rows } = await query(sql);
  return toCamelCase(rows);
};

// Placeholder function to get a user by ID
const getUserById = async (userId) => {
  const sql = 'SELECT * FROM users WHERE user_id = $1';
  const { rows } = await query(sql, [userId]);
  return toCamelCase(rows[0]);
};

const getUserByEmail = async (email) => {
  const sql = 'SELECT * FROM users WHERE email = $1';
  const { rows } = await query(sql, [email]);
  return toCamelCase(rows[0]);
};

// Placeholder function to create a new user
const createUser = async (userData) => {
  const snakeData = toSnakeCase(userData);
  const { email, password_hash, phone_number, first_name, last_name, date_of_birth, profile_picture_url } = snakeData;
  const sql = 'INSERT INTO users (email, password_hash, phone_number, first_name, last_name, date_of_birth, profile_picture_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
  const values = [email, password_hash, phone_number, first_name, last_name, date_of_birth, profile_picture_url];
  const { rows } = await query(sql, values);
  return toCamelCase(rows[0]);
};

// Placeholder function to update a user
const updateUser = async (userId, userData) => {
  const snakeData = toSnakeCase(userData);
  const { email, password_hash, phone_number, first_name, last_name, date_of_birth, profile_picture_url, last_login, is_active } = snakeData;
  const sql = `
    UPDATE users
    SET email = $1, password_hash = $2, phone_number = $3, first_name = $4, last_name = $5, date_of_birth = $6, profile_picture_url = $7, updated_at = CURRENT_TIMESTAMP, last_login = $8, is_active = $9
    WHERE user_id = $10
    RETURNING *`;
  const values = [email, password_hash, phone_number, first_name, last_name, date_of_birth, profile_picture_url, last_login, is_active, userId];
  const { rows } = await query(sql, values);
  return toCamelCase(rows[0]);
};

// Placeholder function to delete a user
const deleteUser = async (userId) => {
  const sql = 'DELETE FROM users WHERE user_id = $1 RETURNING *';
  const { rows } = await query(sql, [userId]);
  return toCamelCase(rows[0]);
};

const generateDefaultAvatarUrl = (firstName) => {
  // This is a simple example using a placeholder service.
  // In a real application, you might use a service like Gravatar or
  // a custom image generation library.
  return `https://ui-avatars.com/api/?name=${firstName}&background=random&color=fff`;
}; // Ensure this function exists and is exported

const uploadAvatar = async (userId, avatarPath) => {
  const sql = 'UPDATE users SET profile_picture_url = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *';
  const values = [avatarPath, userId];
  const { rows } = await query(sql, values);
  return toCamelCase(rows[0]);
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  uploadAvatar,
  generateDefaultAvatarUrl,
};