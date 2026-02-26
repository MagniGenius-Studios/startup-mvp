import cors from "@fastify/cors";
import Fastify from "fastify";

import { env } from "./config/env.js";
import healthRoute from "./routes/health.js";

const server = Fastify({
  logger: true,
});

server.register(cors, {
  origin: env.FRONTEND_ORIGIN,
});

server.register(healthRoute);

server.setErrorHandler((error, request, reply) => {
  request.log.error(error);

  const statusCode = error.statusCode ?? 500;
  const message = statusCode >= 500 ? "Internal Server Error" : error.message;

  reply.status(statusCode).send({
    error: message,
  });
});

async function start(): Promise<void> {
  try {
    await server.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

void start();
