import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://mongodb:27017/express-ts-api-test';

beforeAll(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for testing');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await mongoose.connection.close();
    console.log('Closed MongoDB connection');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
});

// Export cleanup function for tests to use when needed
export const clearDatabase = async () => {
  try {
    if (!mongoose.connection.db) {
      throw new Error('Database not connected');
    }

    // Get all collections
    const collections = await mongoose.connection.db.collections();

    // Drop each collection
    for (const collection of collections) {
      await collection.drop();
    }

    console.log('Cleared all collections');
  } catch (error) {
    if ((error as any).code === 26) {
      // Namespace not found error - this is fine, it means the collection doesn't exist
      return;
    }
    console.error('Error clearing collections:', error);
    throw error;
  }
};
