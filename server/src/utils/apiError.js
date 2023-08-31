import httpStatus from 'http-status';

/**
 * ApiError
 * A custom throwable error that includes a status code and message.
 */
class ApiError extends Error {
    constructor(statusCode = httpStatus.BAD_REQUEST, message) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isApiError = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError;
