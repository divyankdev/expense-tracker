const express = require('express');
const recurringTransactionController = require('../controllers/recurringTransactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET all recurring transactions
router.get('/', protect, recurringTransactionController.getAllRecurringTransactions);

// GET a single recurring transaction by ID
router.get('/:id', protect, recurringTransactionController.getRecurringTransactionById);

// CREATE a new recurring transaction
router.post('/', protect, recurringTransactionController.createRecurringTransaction);

// UPDATE a recurring transaction by ID
router.put('/:id', protect, recurringTransactionController.updateRecurringTransaction);

// DELETE a recurring transaction by ID
router.delete('/:id', protect, recurringTransactionController.deleteRecurringTransaction);

module.exports = router;