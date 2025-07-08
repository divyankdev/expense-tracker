// server.js - Updated to use singleton pattern
const express = require('express');
const app = express();
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const configurePassport = require('./config/passport');
const { query } = require('./utils/db');
const { boss, startBoss } = require('./lib/queue'); // Use singleton
const { startWorker, checkWorkerHealth } = require('./lib/receipt-processor');
const port = 3000;

// Import route files
const accountRoutes = require('./routes/accountRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const recurringTransactionRoutes = require('./routes/recurringTransactionRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const userTokenRoutes = require('./routes/userTokenRoutes');

// Database connection pool
async function testDbConnection() {
  try {
    await query('SELECT 1');
    console.log('Database connection successful!');
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

// Initialize PgBoss and Worker using singleton
async function initializeBossAndWorker() {
  try {
    console.log('🚀 SERVER: Initializing pg-boss and worker...');
    
    // Start boss using singleton
    await startBoss();
    console.log('✅ SERVER: pg-boss initialized');
    
    // Start worker
    await startWorker();
    console.log('✅ SERVER: Worker initialized successfully');
    
    // Check worker health after 3 seconds
    setTimeout(async () => {
      const health = await checkWorkerHealth();
      console.log('🏥 SERVER: Worker health check:', health);
    }, 3000);
    
  } catch (err) {
    console.error('❌ SERVER: Failed to initialize pg-boss or worker:', err);
  }
}

// Passport configuration
configurePassport(passport);
app.use(passport.initialize());

// Add body-parsing middleware
app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:9002',
    'http://localhost:9001',
    'https://yourdomain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use routes
app.use('/api/accounts', accountRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recurring-transactions', recurringTransactionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/profile', userRoutes);
app.use('/api/user-tokens', userTokenRoutes);

// Add health check endpoint
app.get('/api/worker-health', async (req, res) => {
  try {
    const health = await checkWorkerHealth();
    res.json({ status: 'ok', health });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Add manual job trigger for testing
app.post('/api/test-worker', async (req, res) => {
  try {
    const bossInstance = await startBoss();
    const jobId = await bossInstance.send('process-receipt', {
      filePath: 'test-file.jpg',
      userId: 'test-user',
      createdAt: new Date().toISOString()
    });
    
    res.json({ 
      status: 'job-sent', 
      jobId,
      message: 'Test job sent to worker'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
    await testDbConnection();
    await initializeBossAndWorker();
  });
}

module.exports = app;