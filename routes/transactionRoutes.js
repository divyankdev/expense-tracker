const express = require('express');
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, transactionController.getAllTransactions);
router.get('/:id', protect, transactionController.getTransactionById);
router.post('/', protect, transactionController.createTransaction);
router.put('/:id', protect, transactionController.updateTransaction);
router.delete('/:id', protect, transactionController.deleteTransaction);

module.exports = router;