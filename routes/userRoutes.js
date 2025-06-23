const express = require('express');
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, req.params.id + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

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

// POST upload user avatar
router.post('/:id/avatar', upload.single('avatar'), userController.uploadAvatar);

module.exports = router;