const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const userService = require('../services/userService');
const accountService = require('../services/accountService');
const categoryService = require('../services/categoryService');
const recurringTransactionService = require('../services/recurringTransactionService');
const bcrypt = require('bcrypt');

let testUser;
let testAccount;
let testCategory;
let testRecurringTransaction;
let accessToken;

describe('Recurring Transaction Endpoints', () => {
  beforeAll(async () => {
    // Create a test user
    const email = `recurringtestuser${Date.now()}@example.com`;
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    testUser = await userService.createUser({
      email,
      password_hash: passwordHash,
      first_name: 'Recurring',
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
      account_name: 'Recurring Test Account',
      account_type: 'bank_account',
      initial_balance: 500,
      current_balance: 500,
    });

    // Create a test category for the user
    testCategory = await categoryService.createCategory({
      user_id: testUser.userId,
      category_name: 'Recurring Test Category',
      category_type: 'expense',
    });

    // Create a test recurring transaction
    testRecurringTransaction = await recurringTransactionService.createRecurringTransaction({
      user_id: testUser.userId,
      account_id: testAccount.accountId,
      category_id: testCategory.categoryId,
      amount: 25,
      transaction_type: 'expense',
      description: 'Recurring test transaction',
      frequency: 'monthly', // Add frequency
      start_date: new Date().toISOString(), // Add start_date
      end_date: null, // Add end_date (optional)
      next_due_date: new Date().toISOString(),
    });
  });

  afterAll(async () => {
    // Clean up test data in reverse order of creation due to foreign key constraints
    if (testRecurringTransaction && testRecurringTransaction.recurringId) {
      await recurringTransactionService.deleteRecurringTransaction(testRecurringTransaction.recurringId);
    }
    if (testAccount && testAccount.accountId) {
      await accountService.deleteAccount(testAccount.accountId);
    }
    if (testCategory && testCategory.categoryId) {
      await categoryService.deleteCategory(testCategory.categoryId);
    }
    if (testUser && testUser.userId) {
      await userService.deleteUser(testUser.userId);
    }
  });

  it('should get all recurring transactions', async () => {
    const res = await request(app)
      .get('/api/recurring-transactions')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200); // Or whatever status code your getAllRecurringTransactions endpoint returns on success
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toBeInstanceOf(Array);
    // Add more specific assertions based on the expected response body
  });

  it('should get a recurring transaction by ID', async () => {
    console.log(testRecurringTransaction);
    if (!testRecurringTransaction || !testRecurringTransaction.recurringId) {
      throw new Error('Test recurring transaction not created for GET by ID test.');
    }
    console.log(testRecurringTransaction);
    const res = await request(app)
      .get(`/api/recurring-transactions/${testRecurringTransaction.recurringId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('recurringId', testRecurringTransaction.recurringId);
    expect(res.body.data.userId).toEqual(testRecurringTransaction.userId);
    // Add more assertions to verify other properties match testRecurringTransaction
  });

  it('should create a new recurring transaction', async () => {
    const newRecurringTransactionData = {
      user_id: testUser.userId,
      account_id: testAccount.accountId,
      category_id: testCategory.categoryId,
      amount: 50,
      transaction_type: 'Income',
      description: 'New recurring income',
      frequency: 'weekly',
      start_date: new Date().toISOString(),
      end_date: null,
      next_due_date: new Date().toISOString(),
    };

    const res = await request(app)
      .post('/api/recurring-transactions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newRecurringTransactionData);

    expect(res.statusCode).toEqual(201); // Assuming 201 Created
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('recurringId');
    expect(res.body.data.userId).toEqual(newRecurringTransactionData.user_id);
    expect(parseFloat(res.body.data.amount)).toEqual(newRecurringTransactionData.amount);
    expect(res.body.data.frequency).toEqual(newRecurringTransactionData.frequency);
    // Add more assertions to verify other properties

    // Clean up the created recurring transaction
    if (res.body.data && res.body.data.recurringId) {
      await recurringTransactionService.deleteRecurringTransaction(res.body.data.recurringId);
    }
  });

  it('should update a recurring transaction by ID', async () => {
    if (!testRecurringTransaction || !testRecurringTransaction.recurringId) {
      throw new Error('Test recurring transaction not created for PUT by ID test.');
    }

    const updatedRecurringTransactionData = {
      amount: 30,
      description: 'Updated recurring transaction',
      frequency: 'quarterly',
      // these in futute will come from middleware
      user_id: testUser.userId,
      account_id: testAccount.accountId,
      category_id: testCategory.categoryId,
      transaction_type: 'expense',
      start_date: new Date().toISOString(),
      end_date: null,
      next_due_date: new Date().toISOString(),
    };

    const res = await request(app)
      .put(`/api/recurring-transactions/${testRecurringTransaction.recurringId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatedRecurringTransactionData);

    expect(res.statusCode).toEqual(200); // Assuming 200 OK
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('recurringId', testRecurringTransaction.recurringId);
    expect(parseFloat(res.body.data.amount)).toEqual(updatedRecurringTransactionData.amount);
    expect(res.body.data.description).toEqual(updatedRecurringTransactionData.description);
    expect(res.body.data.frequency).toEqual(updatedRecurringTransactionData.frequency);
    // Add more assertions to verify other updated properties
  });

  it('should delete a recurring transaction by ID', async () => {
    if (!testRecurringTransaction || !testRecurringTransaction.recurringId) {
      throw new Error('Test recurring transaction not created for DELETE by ID test.');
    }

    const recurringTransactionIdToDelete = testRecurringTransaction.recurringId;

    const res = await request(app)
      .delete(`/api/recurring-transactions/${recurringTransactionIdToDelete}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toEqual(200); // Assuming 200 OK or 204 No Content
    expect(res.body).toHaveProperty('status', 'success');
    // Depending on your delete endpoint's response, you might assert the deleted ID or a success message
  });
});