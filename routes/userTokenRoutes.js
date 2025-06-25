const express = require('express');
const userTokenController = require('../controllers/userTokenController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET all user tokens
router.get('/', protect, userTokenController.getAllUserTokens);

// GET a single user token by ID
router.get('/:id', protect, userTokenController.getUserTokenById);

// POST a new user token
router.post('', protect, userTokenController.createUserToken);

// PUT update a user token by ID
router.put('/:id', protect, userTokenController.updateUserToken);

// DELETE a user token by ID
router.delete('/:id', protect, userTokenController.deleteUserToken);

module.exports = router;