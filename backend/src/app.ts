import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import routes from './routes/index';

// Express app factory: wires security, parsing, API routes, and global handlers.
export const createApp = () => {
  const app = express();
  const corsOrigin = env.frontendUrl ?? /^http:\/\/localhost:\d+$/;

  // Core middleware stack for headers, CORS, body parsing, cookies, and logs.
  app.use(helmet());
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    }),
  );
  app.use(json({ limit: env.jsonBodyLimit }));
  app.use(cookieParser());
  app.use(morgan(env.httpLogFormat));

  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'CodeByte API is running',
    });
  });

  // Mount all API endpoints under /api.
  app.use('/api', routes);

  // Catch unknown routes/errors after all route handlers.
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.set('port', env.port);

  return app;
};
