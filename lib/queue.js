// lib/queue.js - Fixed with singleton pattern
const PgBoss = require('pg-boss');

let bossInstance = null;
let isInitialized = false;

const createBossInstance = () => {
  if (!bossInstance) {
    bossInstance = new PgBoss({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      schema: 'pgboss',
      // Add these important options
      archiveCompletedAfterSeconds: 60 * 60 * 24, // 24 hours
      deleteAfterDays: 7,
      retentionDays: 7,
      maintenanceIntervalMinutes: 15,
      // Enable logging for debugging
      // log: (msg) => console.log('[pg-boss]', msg)
    });

    // Handle boss events
    bossInstance.on('error', (error) => {
      console.error('pg-boss error:', error);
    });

    bossInstance.on('maintenance', () => {
      console.log('pg-boss maintenance completed');
    });
  }
  return bossInstance;
};

const getBoss = () => {
  return createBossInstance();
};

const startBoss = async () => {
  if (!isInitialized) {
    const boss = getBoss();
    if (!boss.started) {
      await boss.start();
      console.log('✅ pg-boss started successfully');
    }
    isInitialized = true;
  }
  return getBoss();
};

// Job definitions
const JOBS = {
  PROCESS_RECEIPT: 'process-receipt'
};

module.exports = { 
  boss: getBoss(),
  startBoss,
  JOBS 
};