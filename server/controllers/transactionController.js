const transactionService = require('../services/transactionService');
const asyncHandler = require('../utils/asyncHandler');

const transactionController = {
  getAllTransactions: asyncHandler(async (req, res) => {
    const transactions = await transactionService.getAllTransactions();
    res.json(transactions);
  }),

  getTransactionById: asyncHandler(async (req, res) => {
    const transactionId = req.params.id;
    const transaction = await transactionService.getTransactionById(transactionId);
    if (transaction) {
      res.json(transaction);
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  }),

  createTransaction: asyncHandler(async (req, res) => {
    const transactionData = req.body;
    const newTransaction = await transactionService.createTransaction(transactionData);
    res.status(201).json(newTransaction);
  }),

  updateTransaction: asyncHandler(async (req, res) => {
    const transactionId = req.params.id;
    const transactionData = req.body;
    const updatedTransaction = await transactionService.updateTransaction(transactionId, transactionData);
    if (updatedTransaction) {
      res.json(updatedTransaction);
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  }),

  deleteTransaction: asyncHandler(async (req, res) => {
    const transactionId = req.params.id;
    const deletedTransaction = await transactionService.deleteTransaction(transactionId);
    if (deletedTransaction) {
      res.json({ message: 'Transaction deleted successfully' });
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  }),
};

module.exports = transactionController;