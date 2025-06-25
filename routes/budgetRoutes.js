const express = require('express');
const budgetController = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, budgetController.getAllBudgets);
router.get('/:id', protect, budgetController.getBudgetById);
router.post('', protect, budgetController.createBudget);
router.put('/:id', protect, budgetController.updateBudget);
router.delete('/:id', protect, budgetController.deleteBudget);

module.exports = router;