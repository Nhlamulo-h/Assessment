const validateSentence = (req, res, next) => {
  const { text } = req.body;

  if (text === undefined || text === null) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation Error: 'text' field is required in request body.",
      },
    });
  }

  if (typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation Error: 'text' must be a non-empty string.",
      },
    });
  }

  if (text.trim().length > 2000) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation Error: 'text' exceeds maximum length of 2000 characters.",
      },
    });
  }

  req.body.text = text.trim().replace(/\s+/g, ' ');
  next();
};

const validateIdParam = (req, res, next) => {
  const id = parseInt(req.params.id || req.params.typeId, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation Error: Identifier must be a positive integer.',
      },
    });
  }
  next();
};

module.exports = {
  validateSentence,
  validateIdParam,
};
