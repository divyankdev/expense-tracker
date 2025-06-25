const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const userService = require('../services/userService');
const userTokenService = require('../services/userTokenService');
const bcrypt = require('bcrypt');

let testUser;
let testUserToken;
const TEST_USER_AGENT = 'JestTestAgent/1.0';
const TEST_IP = '123.123.123.123';
const TEST_REFRESH_TOKEN = 'testrefreshtoken';
let accessToken;

describe('User Token Endpoints', () => {
  beforeAll(async () => {
    // Create a test user
    const email = `usertokentestuser${Date.now()}@example.com`;
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    testUser = await userService.createUser({
      email,
      password_hash: passwordHash,
      first_name: 'UserToken',
      last_name: 'User',
    });

    // Login to get accessToken
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    accessToken = loginRes.body.data.accessToken;

    // Create a test user token for the user
    // NOTE: In a real application, you would likely generate tokens
    // during login/auth flow, not create them directly like this for tests.
    // This is simplified for test data setup.
    testUserToken = await userTokenService.createUserToken({
      user_id: testUser.user_id,
      refresh_token: TEST_REFRESH_TOKEN,
      token_type: 'refresh',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      device_info: TEST_USER_AGENT,
      ip_address: TEST_IP,
      is_active: true,
    });
  });

  afterAll(async () => {
    // Clean up test data in reverse order of creation due to foreign key constraints
    if (testUserToken && testUserToken.token_id) {
      await userTokenService.deleteUserToken(testUserToken.token_id);
    }
    if (testUser && testUser.user_id) {
      await userService.deleteUser(testUser.user_id);
    }
  });

  it('should get all user tokens', async () => {
    const res = await request(app)
      .get('/api/user-tokens')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200); // Or whatever status code your getAllUserTokens endpoint returns on success
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toBeInstanceOf(Array);
    // Add more assertions based on the expected response body
  });

  it('should get a user token by ID', async () => {
    if (!testUserToken || !testUserToken.token_id) {
      throw new Error('Test user token not created for GET by ID test.');
    }

    const res = await request(app)
      .get(`/api/user-tokens/${testUserToken.token_id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('token_id', testUserToken.token_id);
    expect(res.body.data.user_id).toEqual(testUser.user_id);
    // Add more assertions to verify other properties match testUserToken
  });

  it('should create a new user token', async () => {
    const newTokenData = {
      user_id: testUser.user_id,
      refresh_token: 'newrefreshtoken',
      token_type: 'refresh',
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      device_info: TEST_USER_AGENT,
      ip_address: TEST_IP,
      is_active: true,
    };

    const res = await request(app)
      .post('/api/user-tokens')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newTokenData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('token_id');
    expect(res.body.data.user_id).toEqual(newTokenData.user_id);
    expect(res.body.data.token_type).toEqual(newTokenData.token_type);
    expect(res.body.data.is_active).toEqual(newTokenData.is_active);

    // Clean up the created token
    if (res.body.data && res.body.data.token_id) {
      await userTokenService.deleteUserToken(res.body.data.token_id);
    }
  });

  it('should update a user token by ID', async () => {
    if (!testUserToken || !testUserToken.token_id) {
      throw new Error('Test user token not created for PUT by ID test.');
    }

    const updatedTokenData = {
      is_active: false,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      device_info: TEST_USER_AGENT,
      ip_address: TEST_IP,
    };

    const res = await request(app)
      .put(`/api/user-tokens/${testUserToken.token_id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatedTokenData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('token_id', testUserToken.token_id);
    expect(res.body.data.is_active).toEqual(updatedTokenData.is_active);
    // Add more assertions to verify other updated properties
  });

  it('should delete a user token by ID', async () => {
    if (!testUserToken || !testUserToken.token_id) {
      throw new Error('Test user token not created for DELETE by ID test.');
    }

    const tokenIdToDelete = testUserToken.token_id;

    const res = await request(app)
      .delete(`/api/user-tokens/${tokenIdToDelete}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    // Clear testUserToken after deletion
    testUserToken = null;
  });

  // Add more tests for other user token endpoints:
  // - GET /api/user-tokens/:id
  // - POST /api/user-tokens
  // - PUT /api/user-tokens/:id
  // - DELETE /api/user-tokens/:id
});