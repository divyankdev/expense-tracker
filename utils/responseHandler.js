const { HTTP_STATUS_CODES, RESPONSE_MESSAGES } = require('./constants');

class ResponseHandler {
  /**
   * Sends a success API response.
   * @param {Object} res - The Express response object.
   * @param {number} [statusCode=HTTP_STATUS_CODES.OK] - The HTTP status code to send.
   * @param {string} [messageKey] - The key for the success message in RESPONSE_MESSAGES. Defaults to a generic success message.
   * @param {*} [data] - The data to include in the response.
   */
  sendSuccess(res, statusCode = HTTP_STATUS_CODES.OK, messageKey = RESPONSE_MESSAGES.SUCCESS, data = null) {
    // const message = RESPONSE_MESSAGES[messageKey]

    res.status(statusCode).json({
      status: 'success',
      message: messageKey,
      data: data,
    });
  }

  /**
   * Sends an error API response.
   * @param {Object} res - The Express response object.
   * @param {number} [statusCode=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR] - The HTTP status code to send.
   * @param {string} [messageKey] - The key for the error message in RESPONSE_MESSAGES. Defaults to a generic error message.
   * @param {*} [error] - The error object or message to include in the response (used for logging/debugging, a generic message is sent to the client).
   */
  sendError(res, statusCode = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, messageKey = RESPONSE_MESSAGES.ERROR , error= null) {
    // const message =  RESPONSE_MESSAGES[messageKey] 

    // Log the actual error for debugging purposes
    if (error) {
      console.error('API Error:', error);
    }

    res.status(statusCode).json({
      status: 'error',
      message: messageKey,
    });
  }
}

module.exports = new ResponseHandler(); // Export an instance of the handler