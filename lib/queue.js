const PgBoss = require('pg-boss');

const boss = new PgBoss({
  connectionString: process.env.DATABASE_URL,
  schema: 'queue'
});

// Job definitions
const JOBS = {
  PROCESS_RECEIPT: 'process-receipt'
};

module.exports = { boss, JOBS };