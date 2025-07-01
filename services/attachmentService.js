// server/services/attachmentService.js

const { query, supabaseAdmin } = require('../utils/db');
const { toCamelCase, toSnakeCase } = require('../utils/caseConverter');
const { formatJobStatus } = require('../lib/jobStatus');
const PgBoss = require('pg-boss');
const { boss, JOBS } = require('../lib/queue');

// Get all attachments
const getAllAttachments = async () => {
  const sql = 'SELECT * FROM attachments';
  const { rows } = await query(sql);
  return toCamelCase(rows);
};

// Get an attachment by ID
const getAttachmentById = async (attachmentId) => {
  const sql = 'SELECT * FROM attachments WHERE attachment_id = $1';
  const { rows } = await query(sql, [attachmentId]);
  return toCamelCase(rows[0]);
};

// Create a new attachment
const createAttachment = async (attachmentData) => {
  const snakeData = toSnakeCase(attachmentData);
  const { transaction_id, file_path, file_name, file_type, file_size } = snakeData;
  const sql = 'INSERT INTO attachments (transaction_id, file_path, file_name, file_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const values = [transaction_id, file_path, file_name, file_type, file_size];
  const { rows } = await query(sql, values);
  return toCamelCase(rows[0]);
};

const updateAttachment = async (attachmentId, attachmentData) => {
  const snakeData = toSnakeCase(attachmentData);
  const { transaction_id, file_path, file_name, file_type, file_size } = snakeData;
  const sql = 'UPDATE attachments SET transaction_id = $1, file_path = $2, file_name = $3, file_type = $4, file_size = $5 WHERE attachment_id = $6 RETURNING *';
  const values = [transaction_id, file_path, file_name, file_type, file_size, attachmentId];
  const { rows } = await query(sql, values);
  return toCamelCase(rows[0]);
};

const deleteAttachment = async (attachmentId) => {
  const sql = 'DELETE FROM attachments WHERE attachment_id = $1 RETURNING *';
  const { rows } = await query(sql, [attachmentId]);
  return toCamelCase(rows[0]);
};

const createUploadSignedUrl = async (fileName, fileType, userId) => {
  // VERY IMPORTANT: Server-side validation (e.g., ensuring the user is authenticated)
  // should be handled in the controller/middleware before this service is called.

  const filePath = `receipts/${userId}/${fileName}-${Date.now()}`; // Example path
  console.log("FilePath", filePath)

  // Create a signed URL that allows uploading
  const { data, error } = await supabaseAdmin.storage
    .from('receipt-images') // your bucket name
    .createSignedUploadUrl(filePath, {
      upsert: true, // Set to true if you want to allow overwriting
    });

  console.log("data:", data);
  console.log("Error:", error)

  if (error) {
    // In a real app, you might want to throw a more specific error
    throw new Error('Could not create signed URL');
  }

  return { signedUrl: data.signedUrl, filePath, token: data.token };
};

const receiptStatusByJobId = async (req, res) => {
  const { jobId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('receipt_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      data: formatJobStatus(data)
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check job status'
    });
  }
}

const enqueueReceiptProcessing = async (filePath, userId) => {
  // Enqueue the job
  const jobId = await boss.send(JOBS.PROCESS_RECEIPT, {
    filePath,
    userId,
    createdAt: new Date().toISOString()
  });

  // Create a database record to track the job
  const { data, error } = await supabaseAdmin
    .from('receipt_jobs')
    .insert({
      id: jobId,
      file_path: filePath,
      status: 'pending',
      user_id: userId,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create job record');
  }

  return { jobId };
};

module.exports = {
  getAllAttachments,
  getAttachmentById,
  createAttachment,
  updateAttachment,
  deleteAttachment,
  createUploadSignedUrl,
  receiptStatusByJobId,
  enqueueReceiptProcessing
};