const express = require('express');
const router = express.Router();
const sentenceController = require('../controllers/sentenceController');
const { validateSentence, validateIdParam } = require('../middleware/validateSentence');

// GET /api/sentences - Returns all saved sentences
router.get('/', sentenceController.getAllSentences);

// GET /api/sentences/:id - Returns details for a single sentence
router.get('/:id', validateIdParam, sentenceController.getSentenceById);

// POST /api/sentences - Persists a new sentence
router.post('/', validateSentence, sentenceController.createSentence);

// PUT /api/sentences/:id - Updates an existing sentence
router.put('/:id', validateIdParam, validateSentence, sentenceController.updateSentence);

// DELETE /api/sentences/:id - Deletes a saved sentence (Bonus)
router.delete('/:id', validateIdParam, sentenceController.deleteSentence);

module.exports = router;
