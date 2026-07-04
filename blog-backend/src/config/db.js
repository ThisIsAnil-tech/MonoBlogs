
import mongoose from 'mongoose';
import { logger } from './logger.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    
    try {
      const db = mongoose.connection.db;
      
      
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      if (collectionNames.includes('posts')) {
        await Promise.all([
          db.collection('posts').createIndex({ domain: 1 }),
          db.collection('posts').createIndex({ createdAt: -1 }),
          db.collection('posts').createIndex({ slug: 1 }, { unique: true }),
        ]);
        logger.info('Posts indexes created');
      }
      
      if (collectionNames.includes('comments')) {
        await Promise.all([
          db.collection('comments').createIndex({ postId: 1 }),
          db.collection('comments').createIndex({ createdAt: -1 }),
        ]);
        logger.info('Comments indexes created');
      }
    } catch (indexError) {
      logger.warn(`Index creation warning: ${indexError.message}`);
      
    }
  } catch (error) {
    logger.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};