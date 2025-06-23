const express = require('express');
const budgetController = require('../controllers/budgetController');

const router = express.Router();

router.get('/', budgetController.getAllBudgets);
router.get('/:id', budgetController.getBudgetById);
router.post('', budgetController.createBudget);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;