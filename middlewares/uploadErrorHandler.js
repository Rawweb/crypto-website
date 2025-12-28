const multer = require('multer');

const uploadErrorHandler = (err, req, res, next) => {
  // Multer errors (file size, etc.)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'Image size must not exceed 2MB',
      });
    }

    return res.status(400).json({
      message: err.message,
    });
  }

  // Custom fileFilter errors
  if (err) {
    return res.status(400).json({
      message: err.message || 'File upload failed',
    });
  }

  next();
};

module.exports = uploadErrorHandler;
