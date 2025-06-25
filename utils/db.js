const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// console.log('Full DATABASE_URL:', process.env.DATABASE_URL);
// console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 'undefined');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // This allows self-signed certificates
  }
});

async function query(sql, params) {
    const client = await pool.connect();
    try {
        const result = await client.query(sql, params);
        // console.log(result.rows)
        return result;
    } finally {
        client.release();
    }
}

module.exports = {
    pool, query
};