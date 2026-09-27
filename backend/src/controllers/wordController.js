const db = require('../config/db');

const getWordsByTypeId = async (req, res, next) => {
  try {
    const { typeId } = req.params;

    const typeCheck = await db.query(
      'SELECT id, name, code, color_code FROM word_types WHERE id = $1',
      [typeId]
    );

    if (typeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Word type with ID ${typeId} does not exist.`,
        },
      });
    }

    const wordType = typeCheck.rows[0];

    const result = await db.query(
      `SELECT id, word_type_id, text, created_at
       FROM words
       WHERE word_type_id = $1
       ORDER BY text ASC`,
      [typeId]
    );

    res.status(200).json({
      success: true,
      wordType,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

const getAllWords = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT w.id, w.word_type_id, w.text, wt.name as type_name, wt.code as type_code, wt.color_code
       FROM words w
       JOIN word_types wt ON w.word_type_id = wt.id
       ORDER BY wt.id ASC, w.text ASC`
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
  getWordsByTypeId,
  getAllWords,
};
