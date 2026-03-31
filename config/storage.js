const provider = process.env.STORAGE_PROVIDER || 'gcs';

let storage;

// Only initialize storage if the required env vars are set.
// This lets the server start without storage configured — uploads
// will fail at request time with a clear error instead of crashing on boot.
function isConfigured() {
  switch (provider) {
    case 'gcs':
      return !!(process.env.GCS_BUCKET_NAME && process.env.GCS_PROJECT_ID);
    case 'r2':
      return !!(
        process.env.R2_ACCOUNT_ID &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET_NAME &&
        process.env.R2_PUBLIC_URL
      );
    default:
      return false;
  }
}

if (isConfigured()) {
  switch (provider) {
    case 'gcs': {
      const { createGCSStorage } = require('./storage-gcs');
      storage = createGCSStorage();
      break;
    }
    case 'r2': {
      const { createR2Storage } = require('./storage-r2');
      storage = createR2Storage();
      break;
    }
    default:
      throw new Error(
        `Unknown STORAGE_PROVIDER "${provider}". Use "gcs" or "r2".`
      );
  }
} else {
  // Provide a stub that throws helpful errors if someone tries to upload
  // without configuring storage.
  const notConfigured = () => {
    throw new Error(
      `File storage is not configured. Set STORAGE_PROVIDER and the required ` +
        `env vars for "${provider}" (see .env.example).`
    );
  };

  storage = {
    upload: notConfigured,
    remove: notConfigured,
    getPublicUrl: notConfigured,
  };

  console.warn(
    `⚠ File storage not configured (STORAGE_PROVIDER=${provider}). ` +
      `Upload endpoints will return errors until env vars are set.`
  );
}

module.exports = { storage };
