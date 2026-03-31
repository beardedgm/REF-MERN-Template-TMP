const multer = require('multer');
const { AppError } = require('../utils');

function upload({
  maxSize = 5 * 1024 * 1024,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  fieldName = 'file',
} = {}) {
  const instance = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSize },
    fileFilter: (_req, file, cb) => {
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new AppError(`File type ${file.mimetype} not allowed`, 400));
      }
      cb(null, true);
    },
  });

  return instance.single(fieldName);
}

module.exports = { upload };
