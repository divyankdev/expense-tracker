const attachmentService = require('../services/attachmentService');
const asyncHandler = require('../utils/asyncHandler');
const responseHandler = require('../utils/responseHandler');
const { HTTP_STATUS_CODES, RESPONSE_MESSAGES } = require('../utils/constants');

const attachmentController = {
  getAllAttachments: asyncHandler(async (req, res) => {
    const attachments = await attachmentService.getAllAttachments();
    res.json(attachments);
  }),

  getAttachmentById: asyncHandler(async (req, res) => { // Assuming the ID is passed as a URL parameter
    const attachmentId = req.params.id;
    const attachment = await attachmentService.getAttachmentById(attachmentId);
    if (attachment) {
      res.json(attachment);
    } else {
      res.status(404).json({ message: 'Attachment not found' });
    }
  }),

  createAttachment: asyncHandler(async (req, res) => { // Assuming attachment data is in the request body
    const attachmentData = req.body; 
    const newAttachment = await attachmentService.createAttachment(attachmentData);
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.CREATED, RESPONSE_MESSAGES.ATTACHMENT_CREATED_SUCCESS, newAttachment);
  }),

  updateAttachment: asyncHandler(async (req, res) => { // Assuming updated attachment data is in the request body
    const attachmentId = req.params.id;
    const attachmentData = req.body;
    const updatedAttachment = await attachmentService.updateAttachment(attachmentId, attachmentData);
    if (updatedAttachment) {
      res.json(updatedAttachment);
    } else {
      res.status(404).json({ message: 'Attachment not found' });
    }
  }),

  deleteAttachment: asyncHandler(async (req, res) => {
    const attachmentId = req.params.id;
    await attachmentService.deleteAttachment(attachmentId);
    res.status(204).end();
  }),
};

module.exports = attachmentController;