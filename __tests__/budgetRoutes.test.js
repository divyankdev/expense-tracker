const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const userService = require('../services/userService');
const categoryService = require('../services/categoryService');
const budgetService = require('../services/budgetService');
const bcrypt = require('bcrypt');
const { HTTP_STATUS_CODES } = require('../utils/constants'); // Import status codes
const { RESPONSE_MESSAGES } = require('../utils/constants'); // Import messages

let testUser;
let testCategory;
let testBudget;
let accessToken;

describe('Budget Endpoints', () => {
  beforeAll(async () => {
    // Create a test user
    const email = `budgettestuser${Date.now()}@example.com`;
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    testUser = await userService.createUser({
      email,
      password_hash: passwordHash,
      first_name: 'Budget',
      last_name: 'User',
    });

    // Login to get accessToken
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    accessToken = loginRes.body.data.accessToken;

    // Create a test category for the user
    testCategory = await categoryService.createCategory({
      user_id: testUser.userId,
      category_name: 'Test Budget Category',
      category_type: 'expense', // or 'income' as appropriate
    });

    // Update testBudget's category_id to the created testCategory's id
    // (testBudget is created after this block, so set category_id for creation)

    // Create a test budget for the user
    testBudget = await budgetService.createBudget({
      user_id: testUser.userId,
      category_id: testCategory.categoryId, // Assuming category_id can be null or create a test category
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      amount: 500,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testBudget && testBudget.budgetId) {
      await budgetService.deleteBudget(testBudget.budgetId);
    }
    if (testUser && testUser.userId) {
      await userService.deleteUser(testUser.userId);
    }
  });

  it('should get all budgets for the test user', async () => {
    const res = await request(app)
      .get(`/api/budgets?user_id=${testUser.userId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(HTTP_STATUS_CODES.OK);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toBeInstanceOf(Array);
    // Add more specific assertions about the array content if needed
  });

  it('should get a budget by ID', async () => {
    // console.log('testBudget:', testBudget);
    if (!testBudget || !testBudget.budgetId) {
      throw new Error('Test budget not created for GET by ID test.');
    }
    const res = await request(app)
      .get(`/api/budgets/${testBudget.budgetId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(HTTP_STATUS_CODES.OK);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('budgetId', testBudget.budgetId);
    expect(res.body.data.userId).toEqual(testUser.userId);
    expect(parseFloat(res.body.data.amount)).toEqual(parseFloat(testBudget.amount));
    // Add more assertions to verify other properties match testBudget
  });

  it('should create a new budget', async () => {
    const newBudgetData = {
      user_id: testUser.userId,
      category_id: testCategory.categoryId, // Assuming category_id can be null or create another test category
      start_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      amount: 750,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),

    };
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newBudgetData);
    expect(res.statusCode).toEqual(HTTP_STATUS_CODES.CREATED);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('budgetId');
    expect(res.body.data.userId).toEqual(newBudgetData.user_id);
    expect(parseFloat(res.body.data.amount)).toEqual(newBudgetData.amount);
    // Add more assertions to verify other properties match newBudgetData

    // Clean up the created budget in this test
    if (res.body.data && res.body.data.budgetId) {
      await budgetService.deleteBudget(res.body.data.budgetId);
    }
  });

  it('should update a budget by ID', async () => {
    if (!testBudget || !testBudget.budgetId) {
      throw new Error('Test budget not created for PUT by ID test.');
    }
    const updatedBudgetData = {
      amount: 600, // Update the budget amount
      // spent_amount: 50, // Update spent amount
      category_id: testCategory.categoryId,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };
    const res = await request(app)
      .put(`/api/budgets/${testBudget.budgetId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatedBudgetData);
    expect(res.statusCode).toEqual(HTTP_STATUS_CODES.OK);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('budgetId', testBudget.budgetId);
    expect(parseFloat(res.body.data.amount)).toEqual(updatedBudgetData.amount);
    // expect(parseFloat(res.body.data.spent_amount)).toEqual(updatedBudgetData.spent_amount);
    // Add more assertions to verify other updated properties
  });

  it('should delete a budget by ID', async () => {
    if (!testBudget || !testBudget.budgetId) {
      throw new Error('Test budget not created for DELETE by ID test.');
    }
    const budgetIdToDelete = testBudget.budgetId;
    const res = await request(app)
      .delete(`/api/budgets/${budgetIdToDelete}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(HTTP_STATUS_CODES.OK); // Or 204 No Content depending on your controller
    expect(res.body).toHaveProperty('status', 'success');
    // If your delete response includes the deleted item's ID, you can assert it:
    // expect(res.body.data).toHaveProperty('budgetId', budgetIdToDelete);
    expect(res.body).toHaveProperty('message'); // Check for a success message
  });
});