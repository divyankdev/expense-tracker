const express = require('express');
const userTokenController = require('../controllers/userTokenController');

const router = express.Router();

// GET all user tokens
router.get('/', userTokenController.getAllUserTokens);

// GET a single user token by ID
router.get('/:id', userTokenController.getUserTokenById);

// POST a new user token
router.post('', userTokenController.createUserToken);

// PUT update a user token by ID
router.put('/:id', userTokenController.updateUserToken);

// DELETE a user token by ID
router.delete('/:id', userTokenController.deleteUserToken);

module.exports = router;