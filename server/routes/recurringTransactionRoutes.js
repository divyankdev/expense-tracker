const express = require('express');
const recurringTransactionController = require('../controllers/recurringTransactionController');

const router = express.Router();

// GET all recurring transactions
router.get('/', recurringTransactionController.getAllRecurringTransactions);

// GET a single recurring transaction by ID
router.get('/:id', recurringTransactionController.getRecurringTransactionById);

// CREATE a new recurring transaction
router.post('/', recurringTransactionController.createRecurringTransaction);

// UPDATE a recurring transaction by ID
router.put('/:id', recurringTransactionController.updateRecurringTransaction);

// DELETE a recurring transaction by ID
router.delete('/:id', recurringTransactionController.deleteRecurringTransaction);

module.exports = router;