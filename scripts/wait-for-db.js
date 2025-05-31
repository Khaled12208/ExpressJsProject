const mongoose = require('mongoose');

const waitForDatabase = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || 'mongodb://mongodb:27017/express-ts-api-test';
  const MAX_RETRIES = 30;
  const RETRY_INTERVAL = 1000;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Successfully connected to MongoDB');
      await mongoose.disconnect();
      process.exit(0);
    } catch (error) {
      console.log(
        `Attempt ${i + 1}/${MAX_RETRIES}: Unable to connect to MongoDB...`
      );
      if (i < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      }
    }
  }

  console.error('Failed to connect to MongoDB after maximum retries');
  process.exit(1);
};

waitForDatabase();
