const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const userService = require('../services/userService');
const categoryService = require('../services/categoryService');
const bcrypt = require('bcrypt');

let testUser;
let testCategory;
let accessToken;

describe('Category Endpoints', () => {
  beforeAll(async () => {
    // Create a test user
    const email = `categorytestuser${Date.now()}@example.com`;
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    testUser = await userService.createUser({
      email,
      password_hash: passwordHash,
      first_name: 'Category',
      last_name: 'User',
      // Add other necessary user fields with dummy data
      phone_number: null,
      date_of_birth: null,
      profile_picture_url: null,
    });

    // Login to get accessToken
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    accessToken = loginRes.body.data.accessToken;

    // Create a test category for the user
    testCategory = await categoryService.createCategory({
      user_id: testUser.user_id,
      category_name: 'Test Category',
      category_type: 'expense', // Or 'income'
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testCategory && testCategory.category_id) {
      await categoryService.deleteCategory(testCategory.category_id);
    }
    if (testUser && testUser.user_id) {
      await userService.deleteUser(testUser.user_id);
    }
  });

  it('should get all categories', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200); // Or whatever status code your getAllCategories endpoint returns on success
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toBeInstanceOf(Array);
    // You might want to check for at least one category or verify structure of items in the array
  });

  it('should get a category by ID', async () => {
    if (!testCategory || !testCategory.category_id) {
      throw new Error('Test category not created for GET by ID test.');
    }

    const res = await request(app)
      .get(`/api/categories/${testCategory.category_id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('category_id', testCategory.category_id);
    expect(res.body.data.category_name).toEqual(testCategory.category_name);
    // Add more assertions to verify other properties match testCategory
  });

  it('should create a new category', async () => {
    const newCategoryData = {
      user_id: testUser.user_id,
      category_name: 'New Test Category',
      category_type: 'income',
    };

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newCategoryData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('category_id');
    expect(res.body.data.user_id).toEqual(newCategoryData.user_id);
    expect(res.body.data.category_name).toEqual(newCategoryData.category_name);
    expect(res.body.data.category_type).toEqual(newCategoryData.category_type);

    // Clean up the created category in this test
    if (res.body.data && res.body.data.category_id) {
      await categoryService.deleteCategory(res.body.data.category_id);
    }
  });

  it('should update a category by ID', async () => {
    if (!testCategory || !testCategory.category_id) {
      throw new Error('Test category not created for PUT by ID test.');
    }

    const updatedCategoryData = {
      category_name: 'Updated Test Category',
      category_type: 'expense', // Keep the same type or change it
    };

    const res = await request(app)
      .put(`/api/categories/${testCategory.category_id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatedCategoryData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('category_id', testCategory.category_id);
    expect(res.body.data.category_name).toEqual(updatedCategoryData.category_name);
    expect(res.body.data.category_type).toEqual(updatedCategoryData.category_type);
    // Add more assertions to verify other updated properties
  });

  it('should delete a category by ID', async () => {
    if (!testCategory || !testCategory.category_id) {
      throw new Error('Test category not created for DELETE by ID test.');
    }

    const categoryIdToDelete = testCategory.category_id;

    const res = await request(app)
      .delete(`/api/categories/${categoryIdToDelete}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toEqual(200); // Or 204 if your delete returns no content
    expect(res.body).toHaveProperty('status', 'success');
    // Depending on your delete implementation, you might assert on the message or returned data
    // expect(res.body.message).toEqual('Category deleted successfully');
    // If your delete returns the deleted category: expect(res.body.data).toHaveProperty('category_id', categoryIdToDelete);
  });

  // Add more tests for other category endpoints:
  // - GET /api/categories/:id
  // - POST /api/categories
  // - PUT /api/categories/:id
  // - DELETE /api/categories/:id
});