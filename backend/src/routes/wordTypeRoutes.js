const express = require('express');
const router = express.Router();
const wordTypeController = require('../controllers/wordTypeController');

// GET /api/word-types - Returns all 9 grammatical types
router.get('/', wordTypeController.getAllWordTypes);

module.exports = router;
