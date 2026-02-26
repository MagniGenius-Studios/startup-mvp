import http from 'http';

import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/db';
import { env } from './config/env';

const app = createApp();
const server = http.createServer(app);

const start = async () => {
  try {
    await connectDatabase();
    server.listen(env.port, () => {
      console.info(`API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

void start();

const shutdown = async () => {
  console.info('Shutting down gracefully...');
  await disconnectDatabase();
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', () => {
  void shutdown();
});
process.on('SIGINT', () => {
  void shutdown();
});
