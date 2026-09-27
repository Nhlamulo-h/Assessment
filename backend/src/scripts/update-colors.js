const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '5432', 10);
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || 'postgres';
const targetDatabase = process.env.DB_NAME || 'sentence_builder';

const colors = [
  { code: 'noun', color: '#6366F1' },        // Electric Indigo
  { code: 'verb', color: '#10B981' },        // Emerald Green
  { code: 'adjective', color: '#F59E0B' },   // Amber Gold
  { code: 'adverb', color: '#8B5CF6' },      // Royal Violet
  { code: 'pronoun', color: '#EC4899' },     // Coral Pink
  { code: 'preposition', color: '#14B8A6' },  // Cyan / Teal
  { code: 'conjunction', color: '#F97316' },  // Sunset Orange
  { code: 'determiner', color: '#64748B' },   // Slate Gray
  { code: 'exclamation', color: '#EF4444' }, // Bright Crimson
];

async function updateColors() {
  const client = new Client({
    host,
    port,
    user,
    password,
    database: targetDatabase,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log(`Connected to '${targetDatabase}'. Updating grammatical colors...`);

    for (const item of colors) {
      await client.query(
        'UPDATE word_types SET color_code = $1 WHERE code = $2',
        [item.color, item.code]
      );
      console.log(`  Updated ${item.code} -> ${item.color}`);
    }

    console.log('Successfully updated all 9 word type colors!');
  } catch (err) {
    console.error('Error updating colors:', err.message);
  } finally {
    await client.end();
  }
}

updateColors();
