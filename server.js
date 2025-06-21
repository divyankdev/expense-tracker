const express = require('express');
const app = express();
const passport = require('passport');
const configurePassport = require('./config/passport');
const { query } = require('./utils/db'); // Import the query function
const port = 3000;

// Import route files
const accountRoutes = require('./routes/accountRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const recurringTransactionRoutes = require('./routes/recurringTransactionRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');

// Database connection pool
async function testDbConnection() {
  try {
    await query('SELECT 1'); // Use the imported query function
    console.log('Database connection successful!');
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

// Passport configuration
configurePassport(passport);
app.use(passport.initialize());

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