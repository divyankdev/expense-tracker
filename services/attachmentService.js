// server/services/attachmentService.js

const { query } = require('../utils/db');

// Get all attachments
const getAllAttachments = async () => {
  const sql = 'SELECT * FROM attachments';
  const { rows } = await query(sql);
  return rows;
};

// Get an attachment by ID
const getAttachmentById = async (attachmentId) => {
  const sql = 'SELECT * FROM attachments WHERE attachment_id = $1';
  const { rows } = await query(sql, [attachmentId]);
  return rows[0];
};

// Create a new attachment
const createAttachment = async (attachmentData) => {
  const { transaction_id, file_path, file_name, file_type, file_size } = attachmentData;
  const sql = 'INSERT INTO attachments (transaction_id, file_path, file_name, file_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const values = [transaction_id, file_path, file_name, file_type, file_size];
  const { rows } = await query(sql, values);
  return rows[0];
};

const updateAttachment = async (attachmentId, attachmentData) => {
  const { transaction_id, file_path, file_name, file_type, file_size } = attachmentData;
  const sql = 'UPDATE attachments SET transaction_id = $1, file_path = $2, file_name = $3, file_type = $4, file_size = $5 WHERE attachment_id = $6 RETURNING *';
  const values = [transaction_id, file_path, file_name, file_type, file_size, attachmentId];
  const { rows } = await query(sql, values);
  return rows[0];
};

const deleteAttachment = async (attachmentId) => {
  const sql = 'DELETE FROM attachments WHERE attachment_id = $1 RETURNING *';
  const { rows } = await query(sql, [attachmentId]);
  return rows[0];
};

module.exports = {
  getAllAttachments,
  getAttachmentById,
  createAttachment,
  updateAttachment,
  deleteAttachment,
};