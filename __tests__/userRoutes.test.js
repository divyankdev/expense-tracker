const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const userService = require('../services/userService');
const bcrypt = require('bcrypt'); // Assuming bcrypt is used for password hashing
const path = require('path');

let testUser; // To store the created test user
let accessToken;

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
    // Login to get accessToken
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    accessToken = loginRes.body.data.accessToken;
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

  it('should get all users', async () => {
    const res = await request(app).get('/api/profile');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toBeInstanceOf(Array);
    // Add more specific assertions about the returned users
  });

  it('should create a new user', async () => {
    const newUserData = {
      email: `newuser${Date.now()}@example.com`,
      password_hash: await bcrypt.hash('password123', 10),
      first_name: 'New',
      last_name: 'User',
      phone_number: null,
      date_of_birth: null,
      profile_picture_url: null
    };

    const res = await request(app)
      .post('/api/profile')
      .send(newUserData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('user_id');
    expect(res.body.data.email).toEqual(newUserData.email);
    expect(res.body.data.first_name).toEqual(newUserData.first_name);
    expect(res.body.data.last_name).toEqual(newUserData.last_name);

    // Clean up the created user
    if (res.body.data && res.body.data.user_id) {
      await userService.deleteUser(res.body.data.user_id);
    }
  });

  it('should update a user by ID', async () => {
    if (!testUser || !testUser.user_id) {
      throw new Error('Test user not created for PUT by ID test.');
    }

    const updatedUserData = {
      first_name: 'Updated',
      last_name: 'User',
      phone_number: '1234567890',
      email: testUser.email,
      password_hash: await bcrypt.hash('password123', 10),
      date_of_birth: null,
    };

    const res = await request(app)
      .put(`/api/profile/${testUser.user_id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatedUserData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('user_id', testUser.user_id);
    expect(res.body.data.first_name).toEqual(updatedUserData.first_name);
    expect(res.body.data.last_name).toEqual(updatedUserData.last_name);
    expect(res.body.data.phone_number).toEqual(updatedUserData.phone_number);
  });

  it('should upload a user avatar', async () => {
    // Ensure the testUser was created successfully in beforeAll
    if (!testUser || !testUser.user_id) {
      throw new Error('Test user not created for avatar upload test.');
    }

    // Placeholder for file upload logic with supertest .attach()
    // You'll need to replace 'path/to/your/test/image.jpg' with the actual path
    // to a small test image file and 'avatar' with the field name expected by your upload middleware.
    const imagePath = path.resolve(__dirname, '../public/profile.png');
    const res = await request(app)
      .post(`/api/profile/${testUser.user_id}/avatar`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('avatar', imagePath); // Uncomment and configure for file upload
      // .send({}); // Remove this .send({}) when using .attach()

    expect(res.statusCode).toEqual(200); // Or whatever status code your uploadAvatar endpoint returns on success
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('profile_picture_url'); // Assert that the response includes the new avatar URL
  });
  
  it('should delete a user by ID', async () => {
    if (!testUser || !testUser.user_id) {
      throw new Error('Test user not created for DELETE by ID test.');
    }

    const res = await request(app)
      .delete(`/api/profile/${testUser.user_id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    // Clear testUser after deletion
    testUser = null;
  });

  // Add more tests for other user endpoints:
  // - PUT /api/profile/:id

  
});