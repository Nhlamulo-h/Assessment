const express = require('express');
const router = express.Router();
const wordTypeController = require('../controllers/wordTypeController');

router.get('/', wordTypeController.getAllWordTypes);

module.exports = router;
