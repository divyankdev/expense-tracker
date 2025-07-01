const express = require('express');
const attachmentController = require('../controllers/attachmentController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/signed-url', protect, attachmentController.getUploadSignedUrl);
router.post('/process-receipt', protect, attachmentController.processReceipt);

router.get('/', protect, attachmentController.getAllAttachments);
router.get('/:id', protect, attachmentController.getAttachmentById);
router.post('/:transaction_id', protect, upload.single('attachment'), attachmentController.createAttachment);
router.put('/:id', protect, upload.single('attachment'), attachmentController.updateAttachment);
router.delete('/:id', protect, attachmentController.deleteAttachment);

module.exports = router;