const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const userService = require('../services/userService');
const accountService = require('../services/accountService');
const bcrypt = require('bcrypt');

let testUser;
let testAccount;
let accessToken;

describe('Account Endpoints', () => {
  beforeAll(async () => {
    // Create a test user
    const email = `accounttestuser${Date.now()}@example.com`;
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    testUser = await userService.createUser({
      email,
      password_hash: passwordHash,
      first_name: 'Account',
      last_name: 'User',
    });

    // Login to get accessToken
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    accessToken = loginRes.body.data.accessToken;

    // Create a test account for the user
    testAccount = await accountService.createAccount({
      user_id: testUser.user_id,
      account_name: 'Test Account',
      account_type: 'bank_account',
      // initial_balance: 1000,
      current_balance: 1000,
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testAccount && testAccount.account_id) {
      await accountService.deleteAccount(testAccount.account_id);
    }
    if (testUser && testUser.user_id) {
      await userService.deleteUser(testUser.user_id);
    }
  });

  it('should get all accounts for a user', async () => {
    const res = await request(app)
      .get(`/api/accounts?user_id=${testUser.user_id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('should get an account by ID', async () => {
    if (!testAccount || !testAccount.account_id) {
      throw new Error('Test account not created for GET by ID test.');
    }
    const res = await request(app)
      .get(`/api/accounts/${testAccount.account_id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('account_id', testAccount.account_id);
    expect(res.body.data.user_id).toEqual(testUser.user_id);
    expect(res.body.data.account_name).toEqual(testAccount.account_name);
  });

  it('should create a new account', async () => {
    const newAccountData = {
      user_id: testUser.user_id,
      account_name: 'New Test Account',
      account_type: 'bank_account',
      // initial_balance: 500,
      current_balance: 500,
    };
    const res = await request(app)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newAccountData);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('account_id');
    expect(res.body.data.user_id).toEqual(newAccountData.user_id);
    expect(res.body.data.account_name).toEqual(newAccountData.account_name);
    if (res.body.data && res.body.data.account_id) {
      await accountService.deleteAccount(res.body.data.account_id);
    }
  });

  it('should update an account by ID', async () => {
    if (!testAccount || !testAccount.account_id) {
      throw new Error('Test account not created for PUT by ID test.');
    }
    const updatedAccountData = {
      user_id: testUser.user_id,
      account_name: 'Updated Test Account Name',
      account_type: 'bank_account',
      // initial_balance: 1000,
      current_balance: 1200,
    };
    const res = await request(app)
      .put(`/api/accounts/${testAccount.account_id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatedAccountData);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('account_id', testAccount.account_id);
    expect(res.body.data.account_name).toEqual(updatedAccountData.account_name);
    expect(parseFloat(res.body.data.current_balance)).toEqual(updatedAccountData.current_balance);
  });

  it('should delete an account by ID', async () => {
    if (!testAccount || !testAccount.account_id) {
      throw new Error('Test account not created for DELETE by ID test.');
    }
    const res = await request(app)
      .delete(`/api/accounts/${testAccount.account_id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
  });
});