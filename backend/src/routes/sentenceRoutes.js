const express = require('express');
const router = express.Router();
const sentenceController = require('../controllers/sentenceController');
const { validateSentence, validateIdParam } = require('../middleware/validateSentence');

router.get('/', sentenceController.getAllSentences);
router.get('/:id', validateIdParam, sentenceController.getSentenceById);
router.post('/', validateSentence, sentenceController.createSentence);
router.put('/:id', validateIdParam, validateSentence, sentenceController.updateSentence);
router.delete('/:id', validateIdParam, sentenceController.deleteSentence);

module.exports = router;
