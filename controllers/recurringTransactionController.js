const recurringTransactionService = require('../services/recurringTransactionService');
const asyncHandler = require('../utils/asyncHandler');

const getAllRecurringTransactions = asyncHandler(async (req, res) => {
  const recurringTransactions = await recurringTransactionService.getAllRecurringTransactions();
  res.json(recurringTransactions);
});

const getRecurringTransactionById = asyncHandler(async (req, res) => {
  const recurringTransaction = await recurringTransactionService.getRecurringTransactionById(req.params.id);
  if (recurringTransaction) {
    res.json(recurringTransaction);
  } else {
    res.status(404).json({ message: 'Recurring transaction not found' });
  }
});

const createRecurringTransaction = asyncHandler(async (req, res) => {
  const newRecurringTransaction = await recurringTransactionService.createRecurringTransaction(req.body);
  res.status(201).json(newRecurringTransaction);
});

const updateRecurringTransaction = asyncHandler(async (req, res) => {
  const updatedRecurringTransaction = await recurringTransactionService.updateRecurringTransaction(req.params.id, req.body);
  if (updatedRecurringTransaction) {
    res.json(updatedRecurringTransaction);
  } else {
    res.status(404).json({ message: 'Recurring transaction not found' });
  }
});

const deleteRecurringTransaction = asyncHandler(async (req, res) => {
  const deletedTransaction = await recurringTransactionService.deleteRecurringTransaction(req.params.id);
  res.json({ message: 'Recurring transaction deleted successfully', deletedTransaction });
});

module.exports = {
  getAllRecurringTransactions,
  getRecurringTransactionById,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
};