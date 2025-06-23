const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const userService = require('../../services/userService');
const bcrypt = require('bcrypt'); // Assuming bcrypt is used for password hashing

let testUser; // To store the created test user

describe('User Endpoints', () => {
  beforeAll(async () => {
    // Create a test user before running the tests
    const email = `usertestuser${Date.now()}@example.com`;
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10); // Hash the password
    testUser = await userService.createUser({
      email,
      password_hash: passwordHash,
      // Add other necessary user fields with dummy data
      first_name: 'User',
      last_name: 'Test',
      phone_number: null,
      date_of_birth: null,
      profile_picture_url: null
    });
  });

  afterAll(async () => {
    // Delete the test user after all tests are done
    if (testUser && testUser.user_id) {
      await userService.deleteUser(testUser.user_id);
    }
  });

  it('should get a user by ID', async () => {
    // Ensure the testUser was created successfully in beforeAll
    if (!testUser || !testUser.user_id) {
      throw new Error('Test user not created for GET by ID test.');
    }

    const res = await request(app).get(`/api/profile/${testUser.user_id}`); // Assuming user routes are under /api/profile/:id

    expect(res.statusCode).toEqual(200); // Or whatever status code your getUserById endpoint returns on success
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('user_id', testUser.user_id);
    // Add more assertions based on the expected response body
  });

  // Add more tests for other user endpoints:
  // - PUT /api/profile/:id

  it('should upload a user avatar', async () => {
    // Ensure the testUser was created successfully in beforeAll
    if (!testUser || !testUser.user_id) {
      throw new Error('Test user not created for avatar upload test.');
    }

    // Placeholder for file upload logic with supertest .attach()
    // You'll need to replace 'path/to/your/test/image.jpg' with the actual path
    // to a small test image file and 'avatar' with the field name expected by your upload middleware.
    const res = await request(app)
      .post(`/api/profile/${testUser.user_id}/avatar`)
      // .attach('avatar', 'path/to/your/test/image.jpg'); // Uncomment and configure for file upload
      .send({}); // Remove this .send({}) when using .attach()

    expect(res.statusCode).toEqual(200); // Or whatever status code your uploadAvatar endpoint returns on success
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('profile_picture_url'); // Assert that the response includes the new avatar URL
  });
});