const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const profileRoutes = require('./routes/profile.routes');
const errorHandler = require('./middleware/error.middleware');
const { errorResponse } = require('./utils/response');

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Main profile API routes
app.use('/api/profiles', profileRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the GitHub Profile Analyzer API. Send a POST request to /api/profiles with body { "username": "someuser" } to analyze.'
  });
});

// Fallback for undefined routes
app.use((req, res, next) => {
  return errorResponse(res, `Endpoint '${req.originalUrl}' not found`, 404);
});

// Global error handling middleware
app.use(errorHandler);

module.exports = app;
