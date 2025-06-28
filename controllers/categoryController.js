const categoryService = require('../services/categoryService');
const asyncHandler = require('../utils/asyncHandler');
const responseHandler = require('../utils/responseHandler');
const { HTTP_STATUS_CODES, RESPONSE_MESSAGES } = require('../utils/constants');

const categoryController = {
  getAllCategories: asyncHandler(async (req, res, next) => {
    const categories = await categoryService.getAllCategories();
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, categories);
  }),

  getCategoryById: asyncHandler(async (req, res, next) => {
    const categoryId = req.params.id;
    const category = await categoryService.getCategoryById(categoryId);
    if (category) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, category);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.NOT_FOUND);
    }
  }),

  createCategory: asyncHandler(async (req, res, next) => {
    req.body.user_id = req.user.userId;
    req.body.color = '#000000';
    const newCategory = await categoryService.createCategory(req.body);
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.CREATED, RESPONSE_MESSAGES.SUCCESS, newCategory);
  }),

  updateCategory: asyncHandler(async (req, res, next) => {
    const categoryId = req.params.id;
    console.log('User12345: ',req.user)
    req.body.user_id = req.user.userId;
    const updatedCategory = await categoryService.updateCategory(categoryId, req.body);
    if (updatedCategory) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, updatedCategory);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.NOT_FOUND);
    }
  }),

  deleteCategory: asyncHandler(async (req, res, next) => {
    const categoryId = req.params.id;
    const deletedCategory = await categoryService.deleteCategory(categoryId);
    // It's common practice to send 204 No Content on successful deletion if no data is returned.
    // If you prefer to send the deleted item, you can use sendSuccess with 200 or 204 and the item.
    if (deletedCategory) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, deletedCategory);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.NOT_FOUND);
    }
  }),
};

module.exports = categoryController;