const db = require('../config/db');

/**
 * Controller: GET /api/sentences
 * Returns all saved sentences ordered by latest update.
 */
const getAllSentences = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, text, created_at, updated_at
       FROM sentences
       ORDER BY updated_at DESC`
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: GET /api/sentences/:id
 * Returns details for a single sentence.
 */
const getSentenceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, text, created_at, updated_at
       FROM sentences
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Sentence with ID ${id} not found.`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: POST /api/sentences
 * Persists a new sentence to the database.
 */
const createSentence = async (req, res, next) => {
  try {
    const { text } = req.body;

    const result = await db.query(
      `INSERT INTO sentences (text)
       VALUES ($1)
       RETURNING id, text, created_at, updated_at`,
      [text]
    );

    res.status(201).json({
      success: true,
      message: 'Sentence created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: PUT /api/sentences/:id
 * Updates an existing sentence by ID.
 */
const updateSentence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const result = await db.query(
      `UPDATE sentences
       SET text = $1
       WHERE id = $2
       RETURNING id, text, created_at, updated_at`,
      [text, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Sentence with ID ${id} not found. Unable to update.`,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sentence updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bonus Controller: DELETE /api/sentences/:id
 * Deletes a sentence by ID.
 */
const deleteSentence = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM sentences WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Sentence with ID ${id} not found. Unable to delete.`,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Sentence with ID ${id} deleted successfully.`,
      data: { id: parseInt(id, 10) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSentences,
  getSentenceById,
  createSentence,
  updateSentence,
  deleteSentence,
};
