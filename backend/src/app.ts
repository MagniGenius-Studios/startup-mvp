import { env } from '@config/env';
import { errorHandler } from '@middleware/errorHandler';
import { notFoundHandler } from '@middleware/notFound';
import routes from '@routes/index';
import cors from 'cors';
import express, { json } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: '*', credentials: true }));
  app.use(json({ limit: '1mb' }));
  app.use(morgan('combined'));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.set('port', env.port);

  return app;
};
