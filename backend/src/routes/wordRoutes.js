const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');
const { validateIdParam } = require('../middleware/validateSentence');

// GET /api/words - Returns all words across types (bonus/convenience)
router.get('/', wordController.getAllWords);

// GET /api/words/:typeId - Returns all seed words belonging to a specific word type
router.get('/:typeId', validateIdParam, wordController.getWordsByTypeId);

module.exports = router;
