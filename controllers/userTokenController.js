const userTokenService = require('../services/userTokenService');
const asyncHandler = require('../utils/asyncHandler');
const responseHandler = require('../utils/responseHandler');
const { HTTP_STATUS_CODES, RESPONSE_MESSAGES } = require('../utils/constants');

const getAllUserTokens = asyncHandler(async (req, res) => {
  const userTokens = await userTokenService.getAllUserTokens();
  responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, userTokens);
});

const getUserTokenById = asyncHandler(async (req, res) => {
  const userToken = await userTokenService.getUserTokenById(req.params.id);
  if (userToken) {
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, userToken);
  } else {
    responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.USER_TOKEN_NOT_FOUND);
  }
});

const createUserToken = asyncHandler(async (req, res) => {
  const newUserToken = await userTokenService.createUserToken(req.body);
  responseHandler.sendSuccess(res, HTTP_STATUS_CODES.CREATED, RESPONSE_MESSAGES.USER_TOKEN_CREATED_SUCCESS, newUserToken);
});

const updateUserToken = asyncHandler(async (req, res) => {
  const updatedUserToken = await userTokenService.updateUserToken(req.params.id, req.body);
  if (updatedUserToken) {
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.USER_TOKEN_UPDATED_SUCCESS, updatedUserToken);
  } else {
    responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.USER_TOKEN_NOT_FOUND);
  }
});

const deleteUserToken = asyncHandler(async (req, res) => {
  // Assuming deleteUserToken service returns the deleted token or null if not found
  const deletedUserToken = await userTokenService.deleteUserToken(req.params.id);
  if (deletedUserToken) { // Assuming service returns the deleted token or truthy value on success
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.USER_TOKEN_DELETED_SUCCESS, deletedUserToken);
    // If your delete service doesn't return the deleted token, you might want to send a 204 No Content
    // responseHandler.sendSuccess(res, HTTP_STATUS_CODES.NO_CONTENT); // Add NO_CONTENT to your constants
  } else { // Assuming service returns null or falsy value if not found/deleted
    responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.USER_TOKEN_NOT_FOUND);
  }
});

module.exports = {
  getAllUserTokens,
  getUserTokenById,
  createUserToken,
  updateUserToken,
  deleteUserToken
};