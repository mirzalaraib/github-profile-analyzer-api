const { errorResponse } = require('../utils/response');

/**
 * Global Express error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || null;

  return errorResponse(res, message, statusCode, errors);
};

module.exports = errorHandler;
