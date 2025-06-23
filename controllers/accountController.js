const accountService = require('../services/accountService');
const asyncHandler = require('../utils/asyncHandler');
const responseHandler = require('../utils/responseHandler');
const { HTTP_STATUS_CODES, RESPONSE_MESSAGES } = require('../utils/constants');

const accountController = {
  getAllAccounts: asyncHandler(async (req, res) => {
    const accounts = await accountService.getAllAccounts();
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, accounts);
  }),

  getAccountById: asyncHandler(async (req, res) => {
    const accountId = req.params.id; // Assuming the ID is passed as a URL parameter
    const account = await accountService.getAccountById(accountId);
    if (account) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, account);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.ACCOUNT_NOT_FOUND);
    }
  }),

  createAccount: asyncHandler(async (req, res) => {
    const accountData = req.body; // Assuming account data is in the request body
    // TODO: Add input validation for accountData
    const newAccount = await accountService.createAccount(accountData);
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.CREATED, RESPONSE_MESSAGES.ACCOUNT_CREATED_SUCCESS, newAccount);
  }),

  updateAccount: asyncHandler(async (req, res) => {
    const accountId = req.params.id; // Assuming the ID is passed as a URL parameter
    const accountData = req.body; // Assuming updated account data is in the request body
    // TODO: Add input validation for accountData
    const updatedAccount = await accountService.updateAccount(accountId, accountData);
    if (updatedAccount) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.ACCOUNT_UPDATED_SUCCESS, updatedAccount);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.ACCOUNT_NOT_FOUND);
    }
  }),

  deleteAccount: asyncHandler(async (req, res) => {
    const accountId = req.params.id; // Assuming the ID is passed as a URL parameter
    const success = await accountService.deleteAccount(accountId);
    if (success) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.NO_CONTENT); // 204 No Content
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.ACCOUNT_NOT_FOUND);
    }
  }),
}

module.exports = accountController;