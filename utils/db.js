const { Pool } = require('pg');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

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

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("URL:", supabaseAdmin.storage)

module.exports = {
  pool,
  query,
  supabaseAdmin,
};