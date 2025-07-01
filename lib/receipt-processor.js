const { boss, JOBS } = require('../lib/queue');
const { processReceiptWithAzure } = require('../services/azureReceiptProcessor');
const { supabaseAdmin } = require('../utils/db');

// Worker function that processes the queue job
async function processReceiptJob(job) {
  const { filePath, userId } = job.data;
  const jobId = job.id;

  console.log(`Starting receipt processing job ${jobId} for file: ${filePath}`);

  try {
    // Update status to processing
    await supabaseAdmin
      .from('receipt_jobs')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Call your existing Azure processor
    const extractedData = await processReceiptWithAzure(filePath);

    // Update with successful results
    await supabaseAdmin
      .from('receipt_jobs')
      .update({ 
        status: 'completed',
        extracted_data: extractedData,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    console.log(`Job ${jobId} completed successfully`);
    return extractedData;

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);

    // Update with error status
    await supabaseAdmin
      .from('receipt_jobs')
      .update({ 
        status: 'failed',
        error_message: error.message,
        failed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Re-throw to trigger retry mechanism
    throw error;
  }
}