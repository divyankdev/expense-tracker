const userTokenService = require('../services/userTokenService');
const asyncHandler = require('../utils/asyncHandler');

const getAllUserTokens = asyncHandler(async (req, res) => {
  const userTokens = await userTokenService.getAllUserTokens();
  res.json(userTokens);
});

const getUserTokenById = asyncHandler(async (req, res) => {
  const userToken = await userTokenService.getUserTokenById(req.params.id);
  if (userToken) {
    res.json(userToken);
  } else {
    res.status(404).json({ status: 'error', message: 'User token not found' });
  }
});

const createUserToken = asyncHandler(async (req, res) => {
  const newUserToken = await userTokenService.createUserToken(req.body);
  res.status(201).json(newUserToken);
});

const updateUserToken = asyncHandler(async (req, res) => {
  const updatedUserToken = await userTokenService.updateUserToken(req.params.id, req.body);
  if (updatedUserToken) {
    res.json(updatedUserToken);
  } else {
    res.status(404).json({ status: 'error', message: 'User token not found' });
  }
});

const deleteUserToken = asyncHandler(async (req, res) => {
  // Assuming deleteUserToken service returns the deleted token or null if not found
  const deletedUserToken = await userTokenService.deleteUserToken(req.params.id);
  if (deletedUserToken) {
    res.status(200).json({ status: 'success', message: 'User token deleted successfully', data: deletedUserToken });
  } else {
    res.status(404).json({ status: 'error', message: 'User token not found' });
  }
});

module.exports = {
  getAllUserTokens,
  getUserTokenById,
  createUserToken,
  updateUserToken,
  deleteUserToken
};