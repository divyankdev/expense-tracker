const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

router.get('/api/transactions', transactionController.getAllTransactions);
router.get('/api/transactions/:id', transactionController.getTransactionById);
router.post('/api/transactions', transactionController.createTransaction);
router.put('/api/transactions/:id', transactionController.updateTransaction);
router.delete('/api/transactions/:id', transactionController.deleteTransaction);

module.exports = router;