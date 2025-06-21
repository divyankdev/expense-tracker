const express = require('express');
const { Pool } = require('pg');
const app = express();
const passport = require('passport');
const configurePassport = require('/home/user/expense-tracker/server/config/passport');
const port = 3000;

// Import route files
const accountRoutes = require('/home/user/expense-tracker/server/routes/accountRoutes');
const attachmentRoutes = require('/home/user/expense-tracker/server/routes/attachmentRoutes');
const budgetRoutes = require('/home/user/expense-tracker/server/routes/budgetRoutes');
const categoryRoutes = require('/home/user/expense-tracker/server/routes/categoryRoutes');
const recurringTransactionRoutes = require('/home/user/expense-tracker/server/routes/recurringTransactionRoutes');
const transactionRoutes = require('/home/user/expense-tracker/server/routes/transactionRoutes');
const authRoutes = require('/home/user/expense-tracker/server/routes/authRoutes');

// Database connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:divyank@db.hayevayhownxgbjkpsop.supabase.co:5432/postgres',
});

async function testDbConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection successful!');
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

// Passport configuration
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session()); // Passport session middleware (useful even if not strictly using sessions for API)

// Use routes
app.use('/api/accounts', accountRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recurring-transactions', recurringTransactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  testDbConnection();
});