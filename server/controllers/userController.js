const userService = require('../services/userService');

const asyncHandler = require('../utils/asyncHandler');

const userController = {
  getAllUsers: asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    res.json(users);
  }),

  getUserById: asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  }),

  createUser: asyncHandler(async (req, res) => {
    const userData = req.body;
    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  }),

  updateUser: asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const userData = req.body;
    const updatedUser = await userService.updateUser(userId, userData);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  }),

  deleteUser: asyncHandler(async (req, res) => {    const userId = req.params.id;    const deletedUser = await userService.deleteUser(userId);    if (deletedUser) {  res.json(deletedUser); // Or res.status(204).send() for no content    
    } else {      res.status(404).json({ message: 'User not found' });    }  }),
};

module.exports = userController