require('dotenv').config();
const app = require('./app');
const { testConnection, pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('----------------------------------------------------');
  console.log(' Starting Sentence Builder API Server...');
  console.log('----------------------------------------------------');

  // Verify DB connectivity
  const isDbConnected = await testConnection();
  if (!isDbConnected) {
    console.warn('[Warning] PostgreSQL connection test failed. Please verify DB credentials and host.');
  }

  const server = app.listen(PORT, () => {
    console.log(`[API] Server is listening on http://localhost:${PORT}`);
    console.log(`[API] Health check available at http://localhost:${PORT}/api/health`);
    console.log(`[API] Word Types endpoint: http://localhost:${PORT}/api/word-types`);
    console.log(`[API] Sentences endpoint:  http://localhost:${PORT}/api/sentences`);
    console.log('----------------------------------------------------');
  });

  // Graceful shutdown handler
  const shutdown = async (signal) => {
    console.log(`\n[API] Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      console.log('[API] HTTP server closed.');
      try {
        await pool.end();
        console.log('[DB] PostgreSQL pool has ended.');
        process.exit(0);
      } catch (err) {
        console.error('[DB] Error ending pool:', err);
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
