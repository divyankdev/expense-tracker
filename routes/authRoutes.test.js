const request = require('supertest');
const app = require('../server.js'); // Assuming your Express app is exported from server.js
const userService = require('../services/userService');
const bcrypt = require('bcrypt'); // Assuming bcrypt is used for password hashing

let testUser; // To store the created test user

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Create a test user before running the tests
    const email = `testuser${Date.now()}@example.com`;
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10); // Hash the password
    testUser = await userService.createUser({
      email,
      password_hash: passwordHash,
      // Add other necessary user fields with dummy data
      first_name: 'Test',
      last_name: 'User',
      phone_number: null,
      date_of_birth: null,
      profile_picture_url: null
    });
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: `testuser${Date.now()}@example.com`, // Use unique email
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('accessToken'); // Assuming accessToken is returned
    expect(res.body).toHaveProperty('refreshToken'); // Assuming refreshToken is returned
    // Add more specific assertions as needed
  });

  // Store tokens for subsequent tests
  let accessToken;
  let refreshToken;

  it('should login an existing user', async () => {
    // Note: This test assumes a user with test@example.com and password123 exists.
    // In a real test scenario, you would register a user first or use a test database.
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email, // Use the created test user's email
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user'); // Check for user object in response
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('accessToken'); // Assuming accessToken is returned on login
    expect(res.body).toHaveProperty('refreshToken'); // Assuming refreshToken is returned on login
  });

  afterAll(async () => {
    // Delete the test user after all tests are done
    await userService.deleteUser(testUser.user_id);
  });
});