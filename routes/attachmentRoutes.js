const express = require('express');
const attachmentController = require('../controllers/attachmentController');

const router = express.Router();

router.get('/api/attachments', attachmentController.getAllAttachments);
router.get('/api/attachments/:id', attachmentController.getAttachmentById);
router.post('/api/attachments', attachmentController.createAttachment);
router.put('/api/attachments/:id', attachmentController.updateAttachment);
router.delete('/api/attachments/:id', attachmentController.deleteAttachment);

module.exports = router;