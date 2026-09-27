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

    const checkDb = await rootClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDatabase]
    );

    if (checkDb.rows.length === 0) {
      await rootClient.query(`CREATE DATABASE "${targetDatabase}"`);
    }
  } catch (err) {
    console.error('Error during database verification:', err.message);
    process.exit(1);
  } finally {
    await rootClient.end();
  }

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

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found at: ${sqlPath}`);
    }

    const initSql = fs.readFileSync(sqlPath, 'utf-8');
    await targetClient.query(initSql);
    console.log('Database tables and seed data loaded successfully.');
  } catch (err) {
    console.error('Failed to run init.sql:', err.message);
    process.exit(1);
  } finally {
    await targetClient.end();
  }
}

initializeDatabase();
