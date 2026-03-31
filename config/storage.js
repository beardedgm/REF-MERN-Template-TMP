const provider = process.env.STORAGE_PROVIDER || 'gcs';

let storage;

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

module.exports = { storage };
