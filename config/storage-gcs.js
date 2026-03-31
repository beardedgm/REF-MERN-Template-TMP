const { Storage } = require('@google-cloud/storage');

function createGCSStorage() {
  const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GCS_KEY_FILE,
  });

  const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

  return {
    async upload(filename, buffer, contentType, metadata = {}) {
      const blob = bucket.file(filename);

      await blob.save(buffer, {
        contentType,
        metadata,
      });

      await blob.makePublic();

      const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      return { url, filename };
    },

    async remove(filename) {
      await bucket.file(filename).delete({ ignoreNotFound: true });
    },

    getPublicUrl(filename) {
      return `https://storage.googleapis.com/${bucket.name}/${filename}`;
    },
  };
}

module.exports = { createGCSStorage };
