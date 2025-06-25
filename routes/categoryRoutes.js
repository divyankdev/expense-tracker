const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, categoryController.getAllCategories);
router.get('/:id', protect, categoryController.getCategoryById);
router.post('', protect, categoryController.createCategory);
router.put('/:id', protect, categoryController.updateCategory);
router.delete('/:id', protect, categoryController.deleteCategory);

module.exports = router;