const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const userService = require('../../services/userService');
const userTokenService = require('../../services/userTokenService');
const bcrypt = require('bcrypt');

let testUser;
let testUserToken;

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

    // Create a test user token for the user
    // NOTE: In a real application, you would likely generate tokens
    // during login/auth flow, not create them directly like this for tests.
    // This is simplified for test data setup.
    const refreshTokenHash = await bcrypt.hash('testrefreshtoken', 10); // Hash a dummy token
    testUserToken = await userTokenService.createUserToken({
      user_id: testUser.user_id,
      refresh_token_hash: refreshTokenHash, // Store the hashed token
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
      token_type: 'refresh', // Or whatever token types you have
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
    const res = await request(app).get('/api/user-tokens'); // Assuming your user token routes are under /api/user-tokens
    expect(res.statusCode).toEqual(200); // Or whatever status code your getAllUserTokens endpoint returns on success
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toBeInstanceOf(Array);
    // Add more assertions based on the expected response body
  });

  // Add more tests for other user token endpoints:
  // - GET /api/user-tokens/:id
  // - POST /api/user-tokens
  // - PUT /api/user-tokens/:id
  // - DELETE /api/user-tokens/:id
});