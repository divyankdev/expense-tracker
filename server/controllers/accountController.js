const accountService = require('../services/accountService');
const asyncHandler = require('../utils/asyncHandler');

const accountController = {
  getAllAccounts: asyncHandler(async (req, res) => {
    const accounts = await accountService.getAllAccounts();
    res.json(accounts);
  }),

  getAccountById: asyncHandler(async (req, res) => {
    const accountId = req.params.id; // Assuming the ID is passed as a URL parameter
    const account = await accountService.getAccountById(accountId);
    if (account) {
      res.json(account);
    } else {
      res.status(404).json({ message: 'Account not found' });
    }
  }),

  createAccount: asyncHandler(async (req, res) => {
    const accountData = req.body; // Assuming account data is in the request body
    const newAccount = await accountService.createAccount(accountData);
    res.status(201).json(newAccount);
  }),

  updateAccount: asyncHandler(async (req, res) => {
    const accountId = req.params.id; // Assuming the ID is passed as a URL parameter
    const accountData = req.body; // Assuming updated account data is in the request body
    const updatedAccount = await accountService.updateAccount(accountId, accountData);
    if (updatedAccount) {
      res.json(updatedAccount);
    } else {
      res.status(404).json({ message: 'Account not found' });
    }
  }),

  deleteAccount: asyncHandler(async (req, res) => {
    const accountId = req.params.id; // Assuming the ID is passed as a URL parameter
    const success = await accountService.deleteAccount(accountId);
    if (success) {
      res.status(204).send(); // No content to send back on successful deletion
    } else {
      res.status(404).json({ message: 'Account not found' });
    }
  }),
}

module.exports = accountController;