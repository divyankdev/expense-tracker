const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

router.get('/api/categories', categoryController.getAllCategories);
router.get('/api/categories/:id', categoryController.getCategoryById);
router.post('/api/categories', categoryController.createCategory);
router.put('/api/categories/:id', categoryController.updateCategory);
router.delete('/api/categories/:id', categoryController.deleteCategory);

module.exports = router;