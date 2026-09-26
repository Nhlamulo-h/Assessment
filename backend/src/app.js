const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./config/db');

// Route Handlers
const wordTypeRoutes = require('./routes/wordTypeRoutes');
const wordRoutes = require('./routes/wordRoutes');
const sentenceRoutes = require('./routes/sentenceRoutes');

// Middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware: Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Middleware: Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:4200',
  'http://localhost:4200',
  'http://localhost:80',
  'http://localhost',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching whitelist
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Middleware: Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint (useful for Docker healthchecks and Azure App Service probes)
app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await db.query('SELECT 1 as healthy');
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: dbCheck.rows.length > 0 ? 'CONNECTED' : 'DISCONNECTED',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      status: 'DEGRADED',
      timestamp: new Date().toISOString(),
      database: 'DISCONNECTED',
      error: error.message,
    });
  }
});

// Mount API Resource Routes
app.use('/api/word-types', wordTypeRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/sentences', sentenceRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Sentence Builder API',
    version: '1.0.0',
    description: 'REST API for building, saving, and editing dynamic sentences.',
    endpoints: {
      health: 'GET /api/health',
      wordTypes: 'GET /api/word-types',
      wordsByType: 'GET /api/words/:typeId',
      sentences: 'GET /api/sentences, POST /api/sentences, PUT /api/sentences/:id, DELETE /api/sentences/:id',
    },
  });
});

// Middleware: Route Not Found (404)
app.use(notFoundHandler);

// Middleware: Global Error Handling
app.use(errorHandler);

module.exports = app;
