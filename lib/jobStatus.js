function formatJobStatus(job) {
  return {
    jobId: job.id,
    status: job.status,
    extractedData: job.extracted_data || null,
    error: job.error_message || null,
    createdAt: job.created_at,
    completedAt: job.completed_at,
  };
}

module.exports = { formatJobStatus }; 