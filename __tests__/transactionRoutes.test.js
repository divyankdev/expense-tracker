const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const userService = require('../services/userService');
const accountService = require('../services/accountService');
const categoryService = require('../services/categoryService');
const transactionService = require('../services/transactionService');
const bcrypt = require('bcrypt');

let testUser;
let testAccount;
let testCategory;
let testTransaction;
let accessToken;

describe('Transaction Endpoints', () => {
  beforeAll(async () => {
    // Create a test user
    const email = `transactiontestuser${Date.now()}@example.com`;
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    testUser = await userService.createUser({
      email,
      password_hash: passwordHash,
      first_name: 'Transaction',
      last_name: 'User',
    });

    // Login to get accessToken
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    accessToken = loginRes.body.data.accessToken;

    // Create a test account for the user
    testAccount = await accountService.createAccount({
      user_id: testUser.userId,
      account_name: 'Test Account',
      account_type: 'bank_account',
      // initial_balance: 1000,
      current_balance: 1000,
    });

    // Create a test category for the user
    testCategory = await categoryService.createCategory({
      user_id: testUser.userId,
      category_name: 'Test Category',
      category_type: 'expense',
    });

    // Create a test transaction for the user, account, and category
    testTransaction = await transactionService.createTransaction({
      user_id: testUser.userId,
      account_id: testAccount.accountId,
      category_id: testCategory.categoryId,
      amount: 50,
      transaction_type: 'expense',
      description: 'Test transaction',
      transaction_date: new Date().toISOString(),
    });
  });

  afterAll(async () => {
    // Clean up test data in reverse order of creation due to foreign key constraints
    if (testTransaction && testTransaction.transactionId) {
      await transactionService.deleteTransaction(testTransaction.transactionId);
    }
    if (testAccount && testAccount.account_id) {
      await accountService.deleteAccount(testAccount.accountId);
    }
    if (testCategory && testCategory.category_id) {
      await categoryService.deleteCategory(testCategory.categoryId);
    }
    if (testUser && testUser.userId) {
      await userService.deleteUser(testUser.userId);
    }
  });

  it('should get all transactions', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('should create a new transaction', async () => {
    const newTransactionData = {
      user_id: testUser.userId,
      account_id: testAccount.accountId,
      category_id: testCategory.categoryId,
      amount: 100.00,
      transaction_type: 'income',
      description: 'New income transaction',
      transaction_date: new Date().toISOString(),
    };
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newTransactionData);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('transactionId');
    expect(res.body.data.userId).toEqual(newTransactionData.user_id);
    expect(res.body.data.accountId).toEqual(newTransactionData.account_id);
    expect(res.body.data.categoryId).toEqual(newTransactionData.category_id);
    expect(parseFloat(res.body.data.amount)).toEqual(parseFloat(newTransactionData.amount));
    expect(res.body.data.transactionType).toEqual(newTransactionData.transaction_type);
    expect(res.body.data.description).toEqual(newTransactionData.description);
    if (res.body.data && res.body.data.transactionId) {
      await transactionService.deleteTransaction(res.body.data.transactionId);
    }
  });

  it('should get a transaction by ID', async () => {
    if (!testTransaction || !testTransaction.transactionId) {
      throw new Error('Test transaction not created for GET by ID test.');
    }
    const res = await request(app)
      .get(`/api/transactions/${testTransaction.transactionId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('transactionId', testTransaction.transactionId);
    expect(res.body.data.userId).toEqual(testTransaction.userId);
  });

  it('should update a transaction by ID', async () => {
    if (!testTransaction || !testTransaction.transactionId) {
      throw new Error('Test transaction not created for PUT by ID test.');
    }
    const updatedTransactionData = {
      user_id: testUser.userId,
      account_id: testAccount.accountId,
      category_id: testCategory.categoryId,
      amount: 75,
      transaction_type: 'expense',
      description: 'Updated test transaction',
      transaction_date: new Date().toISOString(),
    };
    const res = await request(app)
      .put(`/api/transactions/${testTransaction.transactionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatedTransactionData);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('transactionId', testTransaction.transactionId);
    expect(parseFloat(res.body.data.amount)).toEqual(updatedTransactionData.amount);
    expect(res.body.data.description).toEqual(updatedTransactionData.description);
  });

  it('should delete a transaction by ID', async () => {
    if (!testTransaction || !testTransaction.transactionId) {
      throw new Error('Test transaction not created for DELETE by ID test.');
    }
    const transactionIdToDelete = testTransaction.transactionId;
    const res = await request(app)
      .delete(`/api/transactions/${transactionIdToDelete}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('transactionId', transactionIdToDelete);
  });
});
