const db = require('../config/db');

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
