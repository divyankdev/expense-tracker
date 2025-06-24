const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const userService = require('../../services/userService');
const transactionService = require('../../services/transactionService');
const accountService = require('../../services/accountService');
const categoryService = require('../../services/categoryService');
const attachmentService = require('../../services/attachmentService');
const bcrypt = require('bcrypt');

let testUser;
let testTransaction;
let testAttachment; // To store a test attachment if needed for specific tests
let testAccount;
let testCategory;

describe('Attachment Endpoints', () => {
  beforeAll(async () => {
    // Create a test user
    const email = `attachmenttestuser${Date.now()}@example.com`;
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    testUser = await userService.createUser({
      email,
      password_hash: passwordHash,
      first_name: 'Attachment',
      last_name: 'User',
    });

    // Create a test transaction for the user (attachments are linked to transactions)
    // This requires account and category
    testAccount = await accountService.createAccount({
         user_id: testUser.user_id,
 // Add other necessary account fields with dummy data
         account_name: 'Test Account',
         account_type: 'Checking',
         initial_balance: 1000,
         current_balance: 1000,
     });

     testCategory = await categoryService.createCategory({
 // Add other necessary category fields with dummy data
         user_id: testUser.user_id,
         category_name: 'Test Category',
         category_type: 'Expense',
     });

    testTransaction = await transactionService.createTransaction({
      user_id: testUser.user_id,
      account_id: testAccount.account_id, // Link to test account
      category_id: testCategory.category_id, // Link to test category
      amount: 50,
      transaction_type: 'Expense',
      description: 'Transaction with attachment',
      transaction_date: new Date().toISOString(),
    });

    // Optionally create a test attachment if needed for GET by ID, PUT, DELETE tests later
    // testAttachment = await attachmentService.createAttachment({
    //   transaction_id: testTransaction.transaction_id,
    //   user_id: testUser.user_id, // Assuming attachments are also linked to a user
    //   file_name: 'test_attachment.txt',
    //   file_path: '/path/to/test_attachment.txt', // Replace with a path to a dummy test file
    //   file_type: 'text/plain',
    //   upload_date: new Date().toISOString(),
    // });


  });

  afterAll(async () => {
    // Clean up test data in reverse order
    if (testAttachment && testAttachment.attachment_id) {
        await attachmentService.deleteAttachment(testAttachment.attachment_id);
    }
    if (testTransaction && testTransaction.transaction_id) {
      await transactionService.deleteTransaction(testTransaction.transaction_id);
    }
    if (testAccount && testAccount.account_id) {
      await accountService.deleteAccount(testAccount.account_id);
    }
    if (testCategory && testCategory.category_id) {
      await categoryService.deleteCategory(testCategory.category_id);
    }
    if (testUser && testUser.user_id) {
      await userService.deleteUser(testUser.user_id);
    }
  });

  it('should get all attachments', async () => {
    // This test might return an empty array if no attachments are created in beforeAll
    // or if the endpoint filters by user or transaction.
    const res = await request(app).get('/api/attachments'); // Assuming your attachment routes are under /api/attachments
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('should create a new attachment', async () => {
    // This test requires a dummy file to upload
    // Create a dummy file for testing file uploads
    const fs = require('fs');
    const path = require('path');
    const dummyFilePath = path.join(__dirname, 'dummy_upload.txt');
    const dummyFileContent = 'This is a dummy file for testing attachment uploads.';
    fs.writeFileSync(dummyFilePath, dummyFileContent);

    const res = await request(app)
      .post('/api/attachments')
      .field('transaction_id', testTransaction.transaction_id)
      .field('user_id', testUser.user_id) // Assuming user_id is also a field
      .attach('attachment', dummyFilePath); // 'attachment' should match the field name in your multer setup

    expect(res.statusCode).toEqual(201); // Assuming 201 Created on success
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('attachment_id');
    expect(res.body.data.transaction_id).toEqual(testTransaction.transaction_id);
    expect(res.body.data).toHaveProperty('file_name', 'dummy_upload.txt'); // Check the file name
    // Add more assertions for other properties like file_path, file_type, upload_date

    // Store the created attachment ID for subsequent tests if needed
    testAttachment = res.body.data;

    // Clean up the dummy file
    fs.unlinkSync(dummyFilePath);
  });

  it('should get an attachment by ID', async () => {
    // Ensure a test attachment exists (created in beforeAll or the create test)
    if (!testAttachment || !testAttachment.attachment_id) {
      // Create a temporary attachment if one doesn't exist
      const tempAttachment = await attachmentService.createAttachment({
        transaction_id: testTransaction.transaction_id,
        user_id: testUser.user_id,
        file_name: 'temp_get_attachment.txt',
        file_path: '/temp/path/temp_get_attachment.txt',
        file_type: 'text/plain',
        upload_date: new Date().toISOString(),
      });
      testAttachment = tempAttachment;
    }

    const res = await request(app).get(`/api/attachments/${testAttachment.attachment_id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('attachment_id', testAttachment.attachment_id);
    // Add more assertions to verify other properties match testAttachment
  });

  // Note: Updating attachments often involves re-uploading the file.
  // This test is a placeholder and might need adjustment based on your update logic.
  it('should update an attachment by ID', async () => {
    // Ensure a test attachment exists
    if (!testAttachment || !testAttachment.attachment_id) {
      throw new Error('No test attachment available for PUT by ID test.');
    }

    const updatedFileName = 'updated_attachment.txt';
    // Depending on your update logic, you might update file metadata or re-upload a file
    const res = await request(app)
      .put(`/api/attachments/${testAttachment.attachment_id}`)
      .send({ file_name: updatedFileName }); // Example: updating just the file name

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('attachment_id', testAttachment.attachment_id);
    // Add more assertions to verify updated properties
  });

  // Note: The DELETE test should be the last one that uses testAttachment
  it('should delete an attachment by ID', async () => {
    // Ensure a test attachment exists
    if (!testAttachment || !testAttachment.attachment_id) {
      throw new Error('No test attachment available for DELETE by ID test.');
    }

    const attachmentIdToDelete = testAttachment.attachment_id;

    const res = await request(app).delete(`/api/attachments/${attachmentIdToDelete}`);

    expect(res.statusCode).toEqual(200); // Assuming 200 OK on successful deletion
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('attachment_id', attachmentIdToDelete); // Assert that the deleted attachment's ID is returned

    // Clear testAttachment after deletion
    testAttachment = null;
  });
});