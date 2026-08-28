import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { httpLogger } from './middleware/http-logger.js';
import { notFoundHandler } from './middleware/not-found.js';
import { requestIdMiddleware } from './middleware/request-id.js';

const app: Express = express();

// Request ID generation & propagation
app.use(requestIdMiddleware);

// HTTP request logger
app.use(httpLogger);

// Security HTTP headers
app.use(helmet());

// CORS configuration (environment-based allowed origin, credentials allowed)
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// JSON body parsing with payload size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Fallback 404 handler for unmatched routes
app.use(notFoundHandler);

// Global centralized error handler
app.use(errorHandler);

export { app };



