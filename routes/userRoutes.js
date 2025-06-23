const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// GET all users
router.get('/', userController.getAllUsers);

// GET a single user by ID
router.get('/:id', userController.getUserById);

// CREATE a new user
router.post('', userController.createUser);

// UPDATE a user by ID
router.put('/:id', userController.updateUser);

// DELETE a user by ID
router.delete('/:id', userController.deleteUser);

module.exports = router;