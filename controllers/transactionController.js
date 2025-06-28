const transactionService = require('../services/transactionService');
const asyncHandler = require('../utils/asyncHandler');
const responseHandler = require('../utils/responseHandler');
const { HTTP_STATUS_CODES, RESPONSE_MESSAGES } = require('../utils/constants');

const transactionController = {
  getAllTransactions: asyncHandler(async (req, res) => {
    const transactions = await transactionService.getAllTransactions();
    if (transactions) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, transactions);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.TRANSACTION_NOT_FOUND);
    }
  }),

  getTransactionById: asyncHandler(async (req, res) => {
    const transactionId = req.params.id;
    const transaction = await transactionService.getTransactionById(transactionId);
    console.log('Transaction:', transaction);
    if (transaction) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, transaction);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.TRANSACTION_NOT_FOUND);
    }
  }),

  createTransaction: asyncHandler(async (req, res) => {
    const transactionData = req.body;
    req.body.user_id = req.user.userId;
    const newTransaction = await transactionService.createTransaction(transactionData);
    console.log('New Transaction:', newTransaction);
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.CREATED, RESPONSE_MESSAGES.TRANSACTION_CREATED_SUCCESS, newTransaction);
  }),

  updateTransaction: asyncHandler(async (req, res) => {
    const transactionId = req.params.id;
    const transactionData = req.body;
    req.body.user_id = req.user.userId;
    const updatedTransaction = await transactionService.updateTransaction(transactionId, transactionData);
    if (updatedTransaction) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.TRANSACTION_UPDATED_SUCCESS, updatedTransaction);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.TRANSACTION_NOT_FOUND);
    }
  }),

  deleteTransaction: asyncHandler(async (req, res) => {
    const transactionId = req.params.id;
    const deletedTransaction = await transactionService.deleteTransaction(transactionId);
      if (deletedTransaction) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.TRANSACTION_DELETED_SUCCESS, deletedTransaction); // Or send 204 No Content
      } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.TRANSACTION_NOT_FOUND);
      }
  }),
};

module.exports = transactionController;