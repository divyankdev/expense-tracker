const recurringTransactionService = require('../services/recurringTransactionService');
const asyncHandler = require('../utils/asyncHandler');
const responseHandler = require('../utils/responseHandler');
const { HTTP_STATUS_CODES, RESPONSE_MESSAGES } = require('../utils/constants');

const getAllRecurringTransactions = asyncHandler(async (req, res) => {
  console.log('User12345: ',req.user)
  const recurringTransactions = await recurringTransactionService.getAllRecurringTransactions();
  responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, recurringTransactions);
});

const getRecurringTransactionById = asyncHandler(async (req, res) => {
  const recurringTransaction = await recurringTransactionService.getRecurringTransactionById(req.params.id);
  if (recurringTransaction) {
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, recurringTransaction);
  } else {
    responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.NOT_FOUND);
  }
});

const createRecurringTransaction = asyncHandler(async (req, res) => {
  const newRecurringTransaction = await recurringTransactionService.createRecurringTransaction(req.body);
  if (newRecurringTransaction) {
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.CREATED, RESPONSE_MESSAGES.SUCCESS, newRecurringTransaction);
  } else {
    // Assuming service throws an error or returns null/undefined on failure
    responseHandler.sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, RESPONSE_MESSAGES.ERROR); // Or a more specific message
  }
});

const updateRecurringTransaction = asyncHandler(async (req, res) => {
  console.log('User: ',req.user)
  const updatedRecurringTransaction = await recurringTransactionService.updateRecurringTransaction(req.params.id, req.body);
  if (updatedRecurringTransaction) {
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, updatedRecurringTransaction);
  } else {
    responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.NOT_FOUND);
  }
});

const deleteRecurringTransaction = asyncHandler(async (req, res) => {
  const deletedTransaction = await recurringTransactionService.deleteRecurringTransaction(req.params.id);
  if (deletedTransaction) {
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, deletedTransaction); // Or send 204 No Content if preferred
  } else {
    responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.NOT_FOUND);
  }
});

module.exports = {
  getAllRecurringTransactions,
  getRecurringTransactionById,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
};