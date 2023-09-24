const { ERROR_CONSTANTS } = require('../constants/errorStatus');

const errorHandlingMiddleware = (error, req, res, next) => {
  const statusCode = res.statusCode || 500;
  switch (statusCode) {
    case ERROR_CONSTANTS.NOT_FOUND:
      res.json({
        title: 'Not found',
        message: error.message,
        stackTrace: error.stack,
      });
      break;
    case ERROR_CONSTANTS.UNAUTHORIZED:
      res.json({
        title: 'Not allowed',
        message: error.message,
        stackTrace: error.stack,
      });
      break;
    case ERROR_CONSTANTS.FORBIDDEN:
      res.json({
        title: 'Forbidden',
        message: error.message,
        stackTrace: error.stack,
      });
      break;
    case ERROR_CONSTANTS.VALIDATION_ERROR:
      res.json({
        title: 'Not validated properly',
        message: error.message,
        stackTrace: error.stack,
      });
      break;
    default:
      res.json({
        title: 'Internal server Error',
        message: error.message,
        stackTrace: error.stack,
      });
      break;
  }
};

module.exports = errorHandlingMiddleware;
