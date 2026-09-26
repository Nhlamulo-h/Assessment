const db = require('../config/db');

/**
 * Controller: GET /api/word-types
 * Retrieves all 9 grammatical types.
 */
const getAllWordTypes = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, name, code, description, color_code, created_at
       FROM word_types
       ORDER BY id ASC`
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

module.exports = {
  getAllWordTypes,
};
