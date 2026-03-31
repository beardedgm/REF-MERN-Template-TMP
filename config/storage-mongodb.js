const mongoose = require('mongoose');

function createMongoDBStorage() {
  let bucket;

  function getBucket() {
    if (!bucket) {
      bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads',
      });
    }
    return bucket;
  }

  return {
    async upload(filename, buffer, contentType, metadata = {}) {
      // Delete existing file with this name (if replacing)
      const existing = await getBucket()
        .find({ filename })
        .toArray();
      for (const file of existing) {
        await getBucket().delete(file._id);
      }

      // Upload new file
      return new Promise((resolve, reject) => {
        const uploadStream = getBucket().openUploadStream(filename, {
          contentType,
          metadata,
        });

        uploadStream.on('finish', () => {
          const url = `/api/files/${encodeURIComponent(filename)}`;
          resolve({ url, filename });
        });

        uploadStream.on('error', reject);
        uploadStream.end(buffer);
      });
    },

    async remove(filename) {
      const files = await getBucket()
        .find({ filename })
        .toArray();
      for (const file of files) {
        await getBucket().delete(file._id);
      }
    },

    getPublicUrl(filename) {
      return `/api/files/${encodeURIComponent(filename)}`;
    },
  };
}

module.exports = { createMongoDBStorage };
