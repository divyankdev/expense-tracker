const budgetService = require('../services/budgetService');
const asyncHandler = require('../utils/asyncHandler');

const budgetController = {
  getAllBudgets: asyncHandler(async (req, res) => {
    const budgets = await budgetService.getAllBudgets();
    res.json(budgets);
  }),

  getBudgetById: asyncHandler(async (req, res) => {
    const budgetId = req.params.id;
    const budget = await budgetService.getBudgetById(budId);
    if (budget) {
      res.json(budget);
    } else {
      res.status(404).json({ message: 'Budget not found' });
    }
  }),

  createBudget: asyncHandler(async (req, res) => {
    const newBudget = await budgetService.createBudget(req.body);
    res.status(201).json(newBudget);
  }),

  updateBudget: asyncHandler(async (req, res) => {
    const budgetId = req.params.id;
    const updatedBudget = await budgetService.updateBudget(budgetId, req.body);
    if (updatedBudget) {
      res.json(updatedBudget);
    } else {
      res.status(404).json({ message: 'Budget not found' });
    }
  }),

  deleteBudget: asyncHandler(async (req, res) => {
    const deletedBudget = await budgetService.deleteBudget(req.params.id);
    if (deletedBudget) {
      res.status(200).json({ message: 'Budget deleted successfully', deletedBudget });
    } else {
      res.status(404).json({ message: 'Budget not found' });
    }
  }),
};

module.exports = budgetController;