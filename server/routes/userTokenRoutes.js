const express = require('express');
const userTokenController = require('../controllers/userTokenController');

const router = express.Router();

// GET all user tokens
router.get('/api/user-tokens', userTokenController.getAllUserTokens);

// GET a single user token by ID
router.get('/api/user-tokens/:id', userTokenController.getUserTokenById);

// POST a new user token
router.post('/api/user-tokens', userTokenController.createUserToken);

// PUT update a user token by ID
router.put('/api/user-tokens/:id', userTokenController.updateUserToken);

// DELETE a user token by ID
router.delete('/api/user-tokens/:id', userTokenController.deleteUserToken);

module.exports = router;