const express = require('express');
const attachmentController = require('../controllers/attachmentController');

const router = express.Router();

router.get('/', attachmentController.getAllAttachments);
router.get('/:id', attachmentController.getAttachmentById);
router.post('', attachmentController.createAttachment);
router.put('/:id', attachmentController.updateAttachment);
router.delete('/:id', attachmentController.deleteAttachment);

module.exports = router;