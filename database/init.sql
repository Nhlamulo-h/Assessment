-- ============================================================================
-- 1Life Full-Stack Technical Assessment: Sentence Builder
-- Database Schema & Seed Script for PostgreSQL
-- ============================================================================

-- Drop existing tables in reverse dependency order if resetting
DROP TABLE IF EXISTS sentences CASCADE;
DROP TABLE IF EXISTS words CASCADE;
DROP TABLE IF EXISTS word_types CASCADE;

-- 1. WORD TYPES TABLE (9 Grammatical Parts of Speech)
CREATE TABLE word_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    color_code VARCHAR(10) NOT NULL DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. WORDS TABLE
CREATE TABLE words (
    id SERIAL PRIMARY KEY,
    word_type_id INTEGER NOT NULL REFERENCES word_types(id) ON DELETE CASCADE,
    text VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_word_type_text UNIQUE (word_type_id, text)
);

-- Index for high-performance lookup of words by word_type_id
CREATE INDEX idx_words_type_id ON words(word_type_id);

-- 3. SENTENCES TABLE (Storage for dynamically assembled sentences)
CREATE TABLE sentences (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function to auto-update 'updated_at' column on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_sentences_updated_at
BEFORE UPDATE ON sentences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: 9 Grammatical Word Types
-- ============================================================================
INSERT INTO word_types (id, name, code, description, color_code) VALUES
(1, 'Noun', 'noun', 'A person, place, thing, or abstract idea', '#3b82f6'),         -- Blue
(2, 'Verb', 'verb', 'An action, state, or occurrence', '#10b981'),                  -- Green
(3, 'Adjective', 'adjective', 'A word describing a noun or pronoun', '#f59e0b'),     -- Amber/Yellow
(4, 'Adverb', 'adverb', 'Modifies an action, adjective, or another adverb', '#8b5cf6'), -- Purple
(5, 'Pronoun', 'pronoun', 'Substitutes for a noun or noun phrase', '#ec4899'),      -- Pink
(6, 'Preposition', 'preposition', 'Shows spatial, temporal, or logical relationship', '#06b6d4'), -- Cyan
(7, 'Conjunction', 'conjunction', 'Connects words, clauses, or sentences', '#f97316'), -- Orange
(8, 'Determiner', 'determiner', 'Introduces a noun and provides context', '#64748b'), -- Slate
(9, 'Exclamation', 'exclamation', 'Expresses sudden emotion or exclamation', '#ef4444'); -- Red

-- Synchronize sequence after manual ID inserts
SELECT setval('word_types_id_seq', (SELECT MAX(id) FROM word_types));

-- ============================================================================
-- SEED DATA: Realistic vocabulary for all 9 Word Types
-- ============================================================================

-- 1. Nouns
INSERT INTO words (word_type_id, text) VALUES
(1, 'cat'),
(1, 'dog'),
(1, 'engineer'),
(1, 'computer'),
(1, 'coffee'),
(1, 'sunset'),
(1, 'mountain'),
(1, 'ocean'),
(1, 'forest'),
(1, 'galaxy'),
(1, 'robot'),
(1, 'algorithm'),
(1, 'music'),
(1, 'journey'),
(1, 'architecture');

-- 2. Verbs
INSERT INTO words (word_type_id, text) VALUES
(2, 'runs'),
(2, 'jumps'),
(2, 'builds'),
(2, 'creates'),
(2, 'analyzes'),
(2, 'discovers'),
(2, 'writes'),
(2, 'explores'),
(2, 'transforms'),
(2, 'navigates'),
(2, 'solves'),
(2, 'codes'),
(2, 'inspires'),
(2, 'powers'),
(2, 'illuminates');

-- 3. Adjectives
INSERT INTO words (word_type_id, text) VALUES
(3, 'quick'),
(3, 'brilliant'),
(3, 'luminous'),
(3, 'agile'),
(3, 'silent'),
(3, 'majestic'),
(3, 'efficient'),
(3, 'resilient'),
(3, 'elegant'),
(3, 'curious'),
(3, 'serene'),
(3, 'bold'),
(3, 'vibrant'),
(3, 'innovative'),
(3, 'clever');

-- 4. Adverbs
INSERT INTO words (word_type_id, text) VALUES
(4, 'quickly'),
(4, 'gracefully'),
(4, 'smoothly'),
(4, 'silently'),
(4, 'passionately'),
(4, 'boldly'),
(4, 'effortlessly'),
(4, 'diligently'),
(4, 'patiently'),
(4, 'brilliantly'),
(4, 'curiously'),
(4, 'eagerly');

-- 5. Pronouns
INSERT INTO words (word_type_id, text) VALUES
(5, 'I'),
(5, 'you'),
(5, 'he'),
(5, 'she'),
(5, 'it'),
(5, 'we'),
(5, 'they'),
(5, 'everyone'),
(5, 'someone'),
(5, 'anyone'),
(5, 'ourselves'),
(5, 'who');

-- 6. Prepositions
INSERT INTO words (word_type_id, text) VALUES
(6, 'on'),
(6, 'under'),
(6, 'through'),
(6, 'across'),
(6, 'beyond'),
(6, 'inside'),
(6, 'between'),
(6, 'with'),
(6, 'without'),
(6, 'over'),
(6, 'toward'),
(6, 'upon');

-- 7. Conjunctions
INSERT INTO words (word_type_id, text) VALUES
(7, 'and'),
(7, 'but'),
(7, 'because'),
(7, 'although'),
(7, 'while'),
(7, 'or'),
(7, 'yet'),
(7, 'so'),
(7, 'since'),
(7, 'unless'),
(7, 'whereas');

-- 8. Determiners
INSERT INTO words (word_type_id, text) VALUES
(8, 'the'),
(8, 'a'),
(8, 'an'),
(8, 'this'),
(8, 'that'),
(8, 'these'),
(8, 'those'),
(8, 'every'),
(8, 'each'),
(8, 'some'),
(8, 'any'),
(8, 'another');

-- 9. Exclamations
INSERT INTO words (word_type_id, text) VALUES
(9, 'Wow!'),
(9, 'Eureka!'),
(9, 'Aha!'),
(9, 'Hooray!'),
(9, 'Bravo!'),
(9, 'Behold!'),
(9, 'Oops!'),
(9, 'Oh!'),
(9, 'Hurrah!'),
(9, 'Alas!');

-- Initial Seed Sentence (Example to verify GET /api/sentences out of the box)
INSERT INTO sentences (text) VALUES
('The agile engineer quickly builds an innovative algorithm and everyone celebrates .'),
('Eureka! A brilliant robot gracefully navigates through the forest .');
