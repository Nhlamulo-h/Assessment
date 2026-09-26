const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '5432', 10);
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || 'postgres';
const targetDatabase = process.env.DB_NAME || 'sentence_builder';

const sqlPath = path.join(__dirname, '../../../database/init.sql');

async function initializeDatabase() {
  console.log('====================================================');
  console.log('  Database Initialization Script (Node.js pg runner)');
  console.log('====================================================');
  console.log(`Connecting to PostgreSQL host: ${host}:${port} as user: ${user}`);

  // Step 1: Connect to default maintenance database 'postgres' to ensure target DB exists
  const rootClient = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await rootClient.connect();
    console.log('[1/3] Connected to PostgreSQL server.');

    // Check if target database already exists
    const checkDb = await rootClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDatabase]
    );

    if (checkDb.rows.length === 0) {
      console.log(`[2/3] Database '${targetDatabase}' does not exist. Creating...`);
      // Note: CREATE DATABASE cannot run inside a transaction block or parameterized query
      await rootClient.query(`CREATE DATABASE "${targetDatabase}"`);
      console.log(`      Database '${targetDatabase}' created successfully.`);
    } else {
      console.log(`[2/3] Database '${targetDatabase}' already exists.`);
    }
  } catch (err) {
    console.error('Error during database verification:', err.message);
    process.exit(1);
  } finally {
    await rootClient.end();
  }

  // Step 2: Connect to the target database and execute init.sql
  const targetClient = new Client({
    host,
    port,
    user,
    password,
    database: targetDatabase,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await targetClient.connect();
    console.log(`[3/3] Connected to database '${targetDatabase}'. Reading init.sql...`);

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found at: ${sqlPath}`);
    }

    const initSql = fs.readFileSync(sqlPath, 'utf-8');
    console.log('      Executing DDL schema and seed data...');
    await targetClient.query(initSql);

    console.log('----------------------------------------------------');
    console.log(' SUCCESS: Database tables and seed data loaded!');
    console.log(' Word types and vocabulary are ready.');
    console.log('====================================================');
  } catch (err) {
    console.error('Failed to run init.sql:', err.message);
    process.exit(1);
  } finally {
    await targetClient.end();
  }
}

initializeDatabase();
