// workers/receiptWorker.js - Fixed version with correct status values
const { boss, startBoss, JOBS } = require('../lib/queue');
const { processReceiptWithAzure } = require('../services/azureReceiptProcessor');
const { supabaseAdmin } = require('../utils/db');

// Worker function that processes the queue job
async function processReceiptJob(jobs) {
  for(const job of jobs) {

    console.log('🚚 WORKER: Picked up job:', job);

    const { filePath, userId } = job.data;
    const jobId = job.id;

    console.log(`🔄 WORKER: Starting receipt processing job ${jobId} for file: ${filePath}`);
    console.log(`🔄 WORKER: Job data:`, job.data);

    try {
      // Update status to processing
      console.log(`🔄 WORKER: Updating job ${jobId} status to processing...`);
      const updateResult = await supabaseAdmin
        .from('scanned_documents')
        .update({
          status: 'processing',
          // updated_at: new Date().toISOString()
        })
        .eq('job_id', jobId);

      console.log(`🔄 WORKER: Database update result:`, updateResult);

      console.log(`🔄 WORKER: Calling Azure processor for job ${jobId}...`);
      // Call your existing Azure processor
      const extractedData = await processReceiptWithAzure(filePath);
    
      console.log(`Extracted data in receipt-processor ${extractedData}`);
      // console.log(extractedData);
      console.log(`🔄 WORKER: Azure processing completed for job ${jobId}, updating database...`);
      // Update with successful results - FIXED: 'completed' -> 'complete'
      await supabaseAdmin
        .from('scanned_documents')
        .update({
          status: 'complete',  // ✅ Changed from 'completed' to 'complete'
          extracted_data: extractedData,
          // completed_at: new Date().toISOString(),
          // updated_at: new Date().toISOString()
        })
        .eq('job_id', jobId);

      console.log(`✅ WORKER: Job ${jobId} completed successfully`);
      return extractedData;

    } catch (error) {
      console.error(`❌ WORKER: Job ${jobId} failed:`, error);

      // Update with error status - FIXED: 'failed' -> 'error'
      try {
        await supabaseAdmin
          .from('scanned_documents')
          .update({
            status: 'error',  // ✅ Changed from 'failed' to 'error'
            error_message: error.message,
            // Note: You might want to add failed_at and updated_at columns to your schema
            // failed_at: new Date().toISOString(),
            // updated_at: new Date().toISOString()
          })
          .eq('job_id', jobId);
      } catch (dbError) {
        console.error(`❌ WORKER: Failed to update error status:`, dbError);
      }

      // Re-throw to trigger retry mechanism
      throw error;
    }
  }
}

// Register the worker with pg-boss
async function startWorker() {
  try {
    console.log('🚀 WORKER: Starting worker initialization...');

    // Use the singleton instance
    const bossInstance = await startBoss();
    console.log('✅ WORKER: Boss instance ready');

    // Check if we can get queue info
    try {
      const queueSize = await bossInstance.getQueueSize('process-receipt');
      console.log(`📊 WORKER: Current queue size: ${queueSize}`);
    } catch (queueError) {
      console.log('⚠️ WORKER: Could not get queue size:', queueError.message);
    }

    // Register the worker with explicit options
    console.log('🔧 WORKER: Registering worker for process-receipt...');
    await bossInstance.work('process-receipt', {
      teamSize: 1,
      teamConcurrency: 1,
      batchSize: 1, // <--- this ensures you get a single job, not an array
      pollingIntervalSeconds: 2
    }, processReceiptJob);

    console.log('✅ WORKER: Receipt processor worker started and listening for jobs...');

    // Add periodic health checks
    setInterval(async () => {
      try {
        const queueSize = await bossInstance.getQueueSize('process-receipt');
        if (queueSize > 0) {
          console.log(`📊 WORKER: Queue size: ${queueSize} (jobs waiting)`);
        }
      } catch (err) {
        console.error('❌ WORKER: Error checking queue:', err);
      }
    }, 10000); // Check every 10 seconds

  } catch (error) {
    console.error('❌ WORKER: Error starting worker:', error);
    throw error;
  }
}

// Add worker health check
async function checkWorkerHealth() {
  try {
    const bossInstance = await startBoss();
    const queueSize = await bossInstance.getQueueSize('process-receipt');
    console.log(`🏥 WORKER HEALTH: Queue size: ${queueSize}`);
    return { queueSize, status: 'healthy' };
  } catch (error) {
    console.error('❌ WORKER HEALTH: Error checking health:', error);
    return { status: 'error', message: error.message };
  }
}

module.exports = { startWorker, checkWorkerHealth };