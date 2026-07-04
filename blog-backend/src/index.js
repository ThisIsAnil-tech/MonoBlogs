import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import subscriberRoutes from './routes/subscriberRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

const app = express();


app.use(helmet());
app.use(compression());


app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));


app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/posts/:postId/comments', commentRoutes);


app.use(notFound);
app.use(errorHandler);


connectDB().then(() => {
  app.listen(config.port, () => {
    logger.info(`🚀 Server running on port ${config.port}`);
    logger.info(`🌍 Environment: ${config.env}`);
  });
}).catch(error => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});