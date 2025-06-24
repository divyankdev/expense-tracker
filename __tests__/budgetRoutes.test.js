const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const userService = require('../services/userService');
const budgetService = require('../services/budgetService');
const bcrypt = require('bcrypt');
const { HTTP_STATUS_CODES } = require('../utils/constants'); // Import status codes
const { RESPONSE_MESSAGES } = require('../utils/constants'); // Import messages

let testUser;
let testBudget;

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

    // Create a test budget for the user
    testBudget = await budgetService.createBudget({
      user_id: testUser.user_id,
      category_id: null, // Assuming category_id can be null or create a test category
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      budget_amount: 500,
      spent_amount: 0,
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testBudget && testBudget.budget_id) {
      await budgetService.deleteBudget(testBudget.budget_id);
    }
    if (testUser && testUser.user_id) {
      await userService.deleteUser(testUser.user_id);
    }
  });

  it('should get all budgets for the test user', async () => {
    // You might need to add authentication to this request in a real app.
    const res = await request(app).get(`/api/budgets?user_id=${testUser.user_id}`);

    expect(res.statusCode).toEqual(HTTP_STATUS_CODES.OK);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toBeInstanceOf(Array);
    // Add more specific assertions about the array content if needed
  });

  it('should get a budget by ID', async () => {
    if (!testBudget || !testBudget.budget_id) {
      throw new Error('Test budget not created for GET by ID test.');
    }

    const res = await request(app).get(`/api/budgets/${testBudget.budget_id}`);

    expect(res.statusCode).toEqual(HTTP_STATUS_CODES.OK);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('budget_id', testBudget.budget_id);
    expect(res.body.data.user_id).toEqual(testUser.user_id);
    expect(parseFloat(res.body.data.budget_amount)).toEqual(testBudget.budget_amount);
    // Add more assertions to verify other properties match testBudget
  });

  it('should create a new budget', async () => {
    const newBudgetData = {
      user_id: testUser.user_id,
      category_id: null, // Assuming category_id can be null or create another test category
      start_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      budget_amount: 750,
      spent_amount: 0,
    };

    const res = await request(app)
      .post('/api/budgets')
      .send(newBudgetData);

    expect(res.statusCode).toEqual(HTTP_STATUS_CODES.CREATED);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('budget_id');
    expect(res.body.data.user_id).toEqual(newBudgetData.user_id);
    expect(parseFloat(res.body.data.budget_amount)).toEqual(newBudgetData.budget_amount);
    // Add more assertions to verify other properties match newBudgetData

    // Clean up the created budget in this test
    if (res.body.data && res.body.data.budget_id) {
      await budgetService.deleteBudget(res.body.data.budget_id);
    }
  });

  it('should update a budget by ID', async () => {
    if (!testBudget || !testBudget.budget_id) {
      throw new Error('Test budget not created for PUT by ID test.');
    }

    const updatedBudgetData = {
      budget_amount: 600, // Update the budget amount
      spent_amount: 50, // Update spent amount
    };

    const res = await request(app)
      .put(`/api/budgets/${testBudget.budget_id}`)
      .send(updatedBudgetData);

    expect(res.statusCode).toEqual(HTTP_STATUS_CODES.OK);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('budget_id', testBudget.budget_id);
    expect(parseFloat(res.body.data.budget_amount)).toEqual(updatedBudgetData.budget_amount);
    expect(parseFloat(res.body.data.spent_amount)).toEqual(updatedBudgetData.spent_amount);
    // Add more assertions to verify other updated properties
  });

  it('should delete a budget by ID', async () => {
    if (!testBudget || !testBudget.budget_id) {
      throw new Error('Test budget not created for DELETE by ID test.');
    }

    const budgetIdToDelete = testBudget.budget_id;

    const res = await request(app)
      .delete(`/api/budgets/${budgetIdToDelete}`);

    expect(res.statusCode).toEqual(HTTP_STATUS_CODES.OK); // Or 204 No Content depending on your controller
    expect(res.body).toHaveProperty('status', 'success');
    // If your delete response includes the deleted item's ID, you can assert it:
    // expect(res.body.data).toHaveProperty('budget_id', budgetIdToDelete);
    expect(res.body).toHaveProperty('message'); // Check for a success message
  });
});