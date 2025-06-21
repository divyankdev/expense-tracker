const categoryService = require('../services/categoryService');
const asyncHandler = require('../utils/asyncHandler');

const categoryController = {
  getAllCategories: asyncHandler(async (req, res, next) => {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  }),

  getCategoryById: asyncHandler(async (req, res, next) => {
    const categoryId = req.params.id;
    const category = await categoryService.getCategoryById(categoryId);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  }),

  createCategory: asyncHandler(async (req, res, next) => {
    const newCategory = await categoryService.createCategory(req.body);
    res.status(201).json(newCategory);
  }),

  updateCategory: asyncHandler(async (req, res, next) => {
    const categoryId = req.params.id;
    const updatedCategory = await categoryService.updateCategory(categoryId, req.body);
    if (updatedCategory) {
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  }),

  deleteCategory: asyncHandler(async (req, res, next) => {
    const categoryId = req.params.id;
    const deletedCategory = await categoryService.deleteCategory(categoryId);
    if (deletedCategory) {
      res.json(deletedCategory); // Or send 204 with no body if preferred
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  }),
};

module.exports = categoryController;