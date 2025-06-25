const attachmentService = require('../services/attachmentService');
const asyncHandler = require('../utils/asyncHandler');
const responseHandler = require('../utils/responseHandler');
const { HTTP_STATUS_CODES, RESPONSE_MESSAGES } = require('../utils/constants');

const attachmentController = {
  getAllAttachments: asyncHandler(async (req, res) => {
    const attachments = await attachmentService.getAllAttachments();
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, attachments);
  }),

  getAttachmentById: asyncHandler(async (req, res) => {
    const attachmentId = req.params.id;
    const attachment = await attachmentService.getAttachmentById(attachmentId);
    if (attachment) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.SUCCESS, attachment);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.ATTACHMENT_NOT_FOUND);
    }
  }),

  createAttachment: asyncHandler(async (req, res) => {
    const attachmentData = {
      transaction_id: req.params.transaction_id,
      file_name: req.file.originalname,
      file_type: req.file.mimetype,
      file_path: req.file.path,
      file_size: req.file.size,
    };
    if (req.user && req.user.user_id) {
      attachmentData.user_id = req.user.user_id;
    }
    const newAttachment = await attachmentService.createAttachment(attachmentData);
    responseHandler.sendSuccess(res, HTTP_STATUS_CODES.CREATED, RESPONSE_MESSAGES.ATTACHMENT_CREATED_SUCCESS, newAttachment);
  }),

  updateAttachment: asyncHandler(async (req, res) => {
    const attachmentId = req.params.id;
    const attachmentData = {
      transaction_id: req.params.transaction_id,
      file_name: req.file.originalname,
      file_type: req.file.mimetype,
      file_path: req.file.path,
      file_size: req.file.size,
    };
    const updatedAttachment = await attachmentService.updateAttachment(attachmentId, attachmentData);
    if (updatedAttachment) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.OK, RESPONSE_MESSAGES.ATTACHMENT_UPDATED_SUCCESS, updatedAttachment);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.ATTACHMENT_NOT_FOUND);
    }
  }),

  deleteAttachment: asyncHandler(async (req, res) => {
    const attachmentId = req.params.id;
    const success = await attachmentService.deleteAttachment(attachmentId);
    if (success) {
      responseHandler.sendSuccess(res, HTTP_STATUS_CODES.NO_CONTENT, RESPONSE_MESSAGES.ATTACHMENT_DELETED_SUCCESS);
    } else {
      responseHandler.sendError(res, HTTP_STATUS_CODES.NOT_FOUND, RESPONSE_MESSAGES.ATTACHMENT_NOT_FOUND);
    }
  }),
};

module.exports = attachmentController;