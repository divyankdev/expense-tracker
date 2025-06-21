const express = require('express');
const budgetController = require('../controllers/budgetController');

const router = express.Router();

router.get('/api/budgets', budgetController.getAllBudgets);
router.get('/api/budgets/:id', budgetController.getBudgetById);
router.post('/api/budgets', budgetController.createBudget);
router.put('/api/budgets/:id', budgetController.updateBudget);
router.delete('/api/budgets/:id', budgetController.deleteBudget);

module.exports = router;