const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');
const { validateIdParam } = require('../middleware/validateSentence');

router.get('/', wordController.getAllWords);
router.get('/:typeId', validateIdParam, wordController.getWordsByTypeId);

module.exports = router;
