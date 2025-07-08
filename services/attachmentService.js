// server/services/attachmentService.js

const { query, supabaseAdmin } = require('../utils/db');
const { toCamelCase, toSnakeCase } = require('../utils/caseConverter');
// const { boss } = require('../lib/queue')
const { boss, JOBS, startBoss } = require('../lib/queue');
// const { processReceiptWithAzure } = require('../services/azureReceiptProcessor');
// const { supabaseAdmin } = require('../utils/db');

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

// Refactored: now takes jobId and returns status object
const receiptStatusByJobId = async (jobId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('scanned_documents')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      jobId: data.job_id,
      status: data.status,
      extractedData: data.extracted_data,
      error: data.error_message,
      createdAt: data.created_at,
      completedAt: data.completed_at
    };
  } catch (error) {
    throw new Error('Failed to check job status');
  }
};

const enqueueReceiptProcessing = async (filePath, userId) => {
  try {
    console.log('=== Creating queue and sending job ===');

    // 1. Get the singleton boss instance
    const bossInstance = await startBoss();
    console.log('✅ Boss singleton ready');

    // 2. Create the queue (if it doesn't exist)
    try {
      console.log('Creating queue for process-receipt...');
      await bossInstance.createQueue('process-receipt', {
        retryLimit: 3,
        retryDelay: 60,
        expireInMinutes: 60
      });
      console.log('Queue created successfully');
    } catch (queueError) {
      console.log('Queue creation result:', queueError.message);
    }

    // 3. Send the job
    console.log('Sending job to process-receipt queue...');
    const jobData = {
      filePath: String(filePath),
      userId: String(userId),
      createdAt: new Date().toISOString()
    };

    console.log('Job data:', jobData);
    const jobId = await bossInstance.send('process-receipt', jobData);
    console.log('Job sent successfully with ID:', jobId);

    if (!jobId) {
      throw new Error('Job ID is null after send');
    }

    // 4. Create tracking record
    const sql = `
      INSERT INTO scanned_documents (job_id, file_path, status, user_id, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [jobId, filePath, 'pending', userId, new Date().toISOString()];
    const { rows } = await query(sql, values);

    const record = rows[0];
    console.log('Job record created successfully:', record);

    // 5. Verify job was queued
    setTimeout(async () => {
      try {
        const queueSize = await bossInstance.getQueueSize('process-receipt');
        console.log(`📊 ENQUEUE: Queue size after job submission: ${queueSize}`);
      } catch (err) {
        console.error('❌ ENQUEUE: Error checking queue size:', err);
      }
    }, 1000);

    return { jobId, recordId: record.id };

  } catch (error) {
    console.error('Error in enqueueReceiptProcessing:', error);
    throw error;
  }
};

// module.exports = { enqueueReceiptProcessing };
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