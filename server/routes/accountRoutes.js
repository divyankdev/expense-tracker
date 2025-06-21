const express = require('express');
const accountController = require('../controllers/accountController');

const router = express.Router();

// GET all accounts
router.get('/', accountController.getAllAccounts);

// GET account by ID
router.get('/:id', accountController.getAccountById);

// CREATE new account
router.post('/', accountController.createAccount);

// UPDATE account by ID
router.put('/:id', accountController.updateAccount);

// DELETE account by ID
router.delete('/:id', accountController.deleteAccount);

module.exports = router;