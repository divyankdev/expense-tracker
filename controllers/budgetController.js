const budgetService = require('../services/budgetService');
const asyncHandler = require('../utils/asyncHandler');
const responseHandler = require('../utils/responseHandler');
const { HTTP_STATUS_CODES, RESPONSE_MESSAGES } = require('../utils/constants');

const budgetController = {
  getAllBudgets: asyncHandler(async (req, res) => {
    const budgets = await budgetService.getAllBudgets();
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, budgets);
  }),

  getBudgetById: asyncHandler(async (req, res) => {
    const budgetId = req.params.id;
    // Fix: Corrected variable name from budId to budgetId
    const budget = await budgetService.getBudgetById(budgetId);
    if (budget) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, budget);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.NOT_FOUND, 'Budget not found');
    }
  }),

  createBudget: asyncHandler(async (req, res) => {
    req.body.user_id = req.user.userId;
    const newBudget = await budgetService.createBudget(req.body);
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.CREATED, RESPONSE_MESSAGES.SUCCESS, newBudget);
  }),

  updateBudget: asyncHandler(async (req, res) => {
    const budgetId = req.params.id;
    req.body.user_id = req.user.userId;
    const updatedBudget = await budgetService.updateBudget(budgetId, req.body);
    if (updatedBudget) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, updatedBudget);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.NOT_FOUND, 'Budget not found');
    }
  }),

  deleteBudget: asyncHandler(async (req, res) => {
    const deletedBudget = await budgetService.deleteBudget(req.params.id);
    if (deletedBudget) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, deletedBudget);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.NOT_FOUND, 'Budget not found');
    }
  }),
};

module.exports = budgetController;