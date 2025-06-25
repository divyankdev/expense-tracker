const express = require('express');
const accountController = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET all accounts
router.get('/', protect, accountController.getAllAccounts);

// GET account by ID
router.get('/:id', protect, accountController.getAccountById);

// CREATE new account
router.post('/', protect, accountController.createAccount);

// UPDATE account by ID
router.put('/:id', protect, accountController.updateAccount);

// DELETE account by ID
router.delete('/:id', protect, accountController.deleteAccount);

module.exports = router;