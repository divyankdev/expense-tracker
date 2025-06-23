const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const responseHandler = require('../utils/responseHandler');
const { HTTP_STATUS_CODES, RESPONSE_MESSAGES } = require('../utils/constants');

const userController = {
  getAllUsers: asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, users);
  }),

  getUserById: asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    if (user) {
      // Add the avatar URL to the response
      if (user.avatarPath) {
        user.profile_picture_url = `${req.protocol}://${req.get('host')}/uploads/${user.avatarPath.split('\\').pop().split('/').pop()}`;
      }
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, user);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.USER_NOT_FOUND);
    }
  }),

  uploadAvatar: asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const avatarPath = req.file.path;
    const updatedUser = await userService.uploadAvatar(userId, avatarPath);
    if (updatedUser) {
      const responseData = {
        user: updatedUser,
        profile_picture_url: `${req.protocol}://${req.get('host')}/uploads/${avatarPath.split('\\').pop().split('/').pop()}`
      };
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.AVATAR_UPLOADED_SUCCESS, responseData);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.USER_NOT_FOUND);
    }
  }),

  createUser: asyncHandler(async (req, res) => {
    const userData = req.body;
    const newUser = await userService.createUser(userData);
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.CREATED, RESPONSE_MESSAGES.USER_REGISTERED_SUCCESS, newUser);
  }),

  updateUser: asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const userData = req.body;
    const updatedUser = await userService.updateUser(userId, userData);
    if (updatedUser) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.USER_UPDATED_SUCCESS, updatedUser);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.USER_NOT_FOUND);
    }
  }),

  deleteUser: asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const deletedUser = await userService.deleteUser(userId);
    if (deletedUser) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.USER_DELETED_SUCCESS, deletedUser);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.USER_NOT_FOUND);
    }
  }),
};

module.exports = userController;