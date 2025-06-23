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
    if (user) {      // Add the avatar URL to the response
      if (user.avatarPath) {
        user.profile_picture_url = `${req.protocol}://${req.get('host')}/uploads/${user.avatarPath.split('\\').pop().split('/').pop()}`; // Construct the URL
            }
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  }),

  uploadAvatar: asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const avatarPath = req.file.path;
    const updatedUser = await userService.uploadAvatar(userId, avatarPath);
    if (updatedUser) {
      res.json({ message: 'Avatar uploaded successfully', profile_picture_url: `${req.protocol}://${req.get('host')}/uploads/${avatarPath.split('\\').pop().split('/').pop()}` });
    } else {
      res.status(404).json({ message: 'User not found or avatar upload failed' });
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