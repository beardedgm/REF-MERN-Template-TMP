const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

function createR2Storage() {
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  return {
    async upload(filename, buffer, contentType, metadata = {}) {
      // R2/S3 metadata values must be strings
      const stringMetadata = {};
      for (const [key, value] of Object.entries(metadata)) {
        stringMetadata[key] = String(value);
      }

      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: filename,
          Body: buffer,
          ContentType: contentType,
          Metadata: stringMetadata,
        })
      );

      const url = `${publicUrl}/${filename}`;
      return { url, filename };
    },

    async remove(filename) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: filename,
        })
      );
    },

    getPublicUrl(filename) {
      return `${publicUrl}/${filename}`;
    },
  };
}

module.exports = { createR2Storage };
