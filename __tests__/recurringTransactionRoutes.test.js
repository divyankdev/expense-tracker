const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const userService = require('../../services/userService');
const accountService = require('../../services/accountService');
const categoryService = require('../../services/categoryService');
const recurringTransactionService = require('../../services/recurringTransactionService');
const bcrypt = require('bcrypt');

let testUser;
let testAccount;
let testCategory;
let testRecurringTransaction;

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

    // Create a test account for the user
    testAccount = await accountService.createAccount({
      user_id: testUser.user_id,
      account_name: 'Recurring Test Account',
      account_type: 'Checking',
      initial_balance: 500,
      current_balance: 500,
    });

    // Create a test category for the user
    testCategory = await categoryService.createCategory({
      user_id: testUser.user_id,
      category_name: 'Recurring Test Category',
      category_type: 'Expense',
    });

    // Create a test recurring transaction
    testRecurringTransaction = await recurringTransactionService.createRecurringTransaction({
      user_id: testUser.user_id,
      account_id: testAccount.account_id,
      category_id: testCategory.category_id,
      amount: 25,
      transaction_type: 'Expense',
      description: 'Recurring test transaction',
      frequency: 'monthly', // Add frequency
      start_date: new Date().toISOString(), // Add start_date
      end_date: null, // Add end_date (optional)
    });
  });

  afterAll(async () => {
    // Clean up test data in reverse order of creation due to foreign key constraints
    if (testRecurringTransaction && testRecurringTransaction.recurring_transaction_id) {
      await recurringTransactionService.deleteRecurringTransaction(testRecurringTransaction.recurring_transaction_id);
    }
    if (testAccount && testAccount.account_id) {
      await accountService.deleteAccount(testAccount.account_id);
    }
    if (testCategory && testCategory.category_id) {
      await categoryService.deleteCategory(testCategory.category_id);
    }
    if (testUser && testUser.user_id) {
      await userService.deleteUser(testUser.user_id);
    }
  });

  it('should get all recurring transactions', async () => {
    const res = await request(app).get('/api/recurring-transactions'); // Assuming your recurring transaction routes are under /api/recurring-transactions
    expect(res.statusCode).toEqual(200); // Or whatever status code your getAllRecurringTransactions endpoint returns on success
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toBeInstanceOf(Array);
    // Add more specific assertions based on the expected response body
  });

  it('should get a recurring transaction by ID', async () => {
    if (!testRecurringTransaction || !testRecurringTransaction.recurring_transaction_id) {
      throw new Error('Test recurring transaction not created for GET by ID test.');
    }

    const res = await request(app).get(`/api/recurring-transactions/${testRecurringTransaction.recurring_transaction_id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('recurring_transaction_id', testRecurringTransaction.recurring_transaction_id);
    expect(res.body.data.user_id).toEqual(testRecurringTransaction.user_id);
    // Add more assertions to verify other properties match testRecurringTransaction
  });

  it('should create a new recurring transaction', async () => {
    const newRecurringTransactionData = {
      user_id: testUser.user_id,
      account_id: testAccount.account_id,
      category_id: testCategory.category_id,
      amount: 50,
      transaction_type: 'Income',
      description: 'New recurring income',
      frequency: 'weekly',
      start_date: new Date().toISOString(),
      end_date: null,
    };

    const res = await request(app)
      .post('/api/recurring-transactions')
      .send(newRecurringTransactionData);

    expect(res.statusCode).toEqual(201); // Assuming 201 Created
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('recurring_transaction_id');
    expect(res.body.data.user_id).toEqual(newRecurringTransactionData.user_id);
    expect(parseFloat(res.body.data.amount)).toEqual(newRecurringTransactionData.amount);
    expect(res.body.data.frequency).toEqual(newRecurringTransactionData.frequency);
    // Add more assertions to verify other properties

    // Clean up the created recurring transaction
    if (res.body.data && res.body.data.recurring_transaction_id) {
      await recurringTransactionService.deleteRecurringTransaction(res.body.data.recurring_transaction_id);
    }
  });

  it('should update a recurring transaction by ID', async () => {
    if (!testRecurringTransaction || !testRecurringTransaction.recurring_transaction_id) {
      throw new Error('Test recurring transaction not created for PUT by ID test.');
    }

    const updatedRecurringTransactionData = {
      amount: 30,
      description: 'Updated recurring transaction',
      frequency: 'bi-weekly',
    };

    const res = await request(app)
      .put(`/api/recurring-transactions/${testRecurringTransaction.recurring_transaction_id}`)
      .send(updatedRecurringTransactionData);

    expect(res.statusCode).toEqual(200); // Assuming 200 OK
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('recurring_transaction_id', testRecurringTransaction.recurring_transaction_id);
    expect(parseFloat(res.body.data.amount)).toEqual(updatedRecurringTransactionData.amount);
    expect(res.body.data.description).toEqual(updatedRecurringTransactionData.description);
    expect(res.body.data.frequency).toEqual(updatedRecurringTransactionData.frequency);
    // Add more assertions to verify other updated properties
  });

  it('should delete a recurring transaction by ID', async () => {
    if (!testRecurringTransaction || !testRecurringTransaction.recurring_transaction_id) {
      throw new Error('Test recurring transaction not created for DELETE by ID test.');
    }

    const recurringTransactionIdToDelete = testRecurringTransaction.recurring_transaction_id;

    const res = await request(app).delete(`/api/recurring-transactions/${recurringTransactionIdToDelete}`);

    expect(res.statusCode).toEqual(200); // Assuming 200 OK or 204 No Content
    expect(res.body).toHaveProperty('status', 'success');
    // Depending on your delete endpoint's response, you might assert the deleted ID or a success message
  });
});