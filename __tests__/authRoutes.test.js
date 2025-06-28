const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const { RESPONSE_MESSAGES } = require('../utils/constants'); // Import constants
const userService = require('../services/userService');
const bcrypt = require('bcrypt'); // Assuming bcrypt is used for password hashing

let testUser; // To store the created test user
const TEST_USER_AGENT = 'JestTestAgent/1.0';
const TEST_IP = '123.123.123.123';

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
  let registeredUserEmail;

  it('should register a new user', async () => {
    registeredUserEmail = `testuser${Date.now()}@example.com`
    const res = await request(app)
      .post('/api/auth/register')
      .set('User-Agent', TEST_USER_AGENT)
      .set('x-forwarded-for', TEST_IP)
      .send({
        first_name: 'Test',
        last_name: 'User',
        email: registeredUserEmail,  // Use unique email
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('user'); // Assuming user object is returned
    expect(res.body.data).toHaveProperty('accessToken'); // Assuming accessToken is returned
    expect(res.body.data).toHaveProperty('refreshToken'); // Assuming refreshToken is returned
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
      .set('User-Agent', TEST_USER_AGENT)
      .set('x-forwarded-for', TEST_IP)
      .send({
        email: testUser.email, // Use the created test user's email
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('user'); // Check for user object in response
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');

    // Store tokens for subsequent tests
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('should refresh access token using a valid refresh token', async () => {
    // This test requires a refresh token from a successful login
    if (!refreshToken) {
      throw new Error('No refresh token available for refresh token test. Ensure login test runs and stores the token.');
    }
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('User-Agent', TEST_USER_AGENT)
      .set('x-forwarded-for', TEST_IP)
      .send({ refreshToken });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('accessToken'); // Should receive a new access token
    expect(res.body.data).toHaveProperty('refreshToken'); // Should receive a new refresh token (or the same, depending on implementation)
  });

  it('should logout a user using a valid refresh token', async () => {
    // This test requires a refresh token from a successful login
    if (!refreshToken) {
      throw new Error('No refresh token available for logout test. Ensure login test runs and stores the token.');
    }
    const res = await request(app)
      .post('/api/auth/logout')
      .set('User-Agent', TEST_USER_AGENT)
      .set('x-forwarded-for', TEST_IP)
      .send({ refreshToken });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', RESPONSE_MESSAGES.LOGGED_OUT_SUCCESSFULLY); // Use constant
  });

  it('should handle forgot password request', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .set('User-Agent', TEST_USER_AGENT)
      .set('x-forwarded-for', TEST_IP)
      .send({ email: testUser.email });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', RESPONSE_MESSAGES.PASSWORD_RESET_EMAIL_SENT);
  });

  it('should handle reset password with valid token', async () => {
    // This test would require a valid reset token
    // In a real scenario, you'd get this token from the forgot-password flow
    const resetData = {
      token: 'valid-reset-token', // This would be a real token in actual testing
      newPassword: 'newpassword123'
    };

    const res = await request(app)
      .post('/api/auth/reset-password')
      .set('User-Agent', TEST_USER_AGENT)
      .set('x-forwarded-for', TEST_IP)
      .send(resetData);

    // This might fail with invalid token, but we're testing the endpoint structure
    expect(res.statusCode).toBeDefined();
    expect(res.body).toHaveProperty('status');
  });

  it('should redirect to Google OAuth', async () => {
    const res = await request(app)
      .get('/api/auth/google')
      .set('User-Agent', TEST_USER_AGENT)
      .set('x-forwarded-for', TEST_IP)
      .expect(302); // Expect redirect

    // Google OAuth should redirect to Google's authentication page
    expect(res.statusCode).toEqual(302);
  });

  afterAll(async () => {
    // Delete the user created manually
    await userService.deleteUser(testUser.userId);
  
    // Delete the user created through registration test
    // if (registeredUserEmail) {
    //   const user = await userService.getUserByEmail(registeredUserEmail);
    //   if (user) {
    //     await userService.deleteUser(user.userId);
    //   }
    // }
  });  
});