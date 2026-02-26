import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { env } from "../config/env.js";
import { pingDatabase } from "../db/prisma.js";

const healthQuerySchema = z.object({
  checkDb: z.enum(["true", "false"]).optional(),
});

const healthRoute: FastifyPluginAsync = async (app) => {
  app.get("/health", async (request, reply) => {
    const query = healthQuerySchema.parse(request.query);

    if (query.checkDb !== "true") {
      return reply.status(200).send({
        status: "ok" as const,
        service: "backend" as const,
        timestamp: new Date().toISOString(),
        database: {
          status: "not_configured" as const,
        },
      });
    }

    if (!env.DATABASE_URL) {
      return reply.status(200).send({
        status: "ok" as const,
        service: "backend" as const,
        timestamp: new Date().toISOString(),
        database: {
          status: "not_configured" as const,
        },
      });
    }

    try {
      const latencyMs = await pingDatabase();

      return reply.status(200).send({
        status: "ok" as const,
        service: "backend" as const,
        timestamp: new Date().toISOString(),
        database: {
          status: "ok" as const,
          latencyMs,
        },
      });
    } catch (error) {
      app.log.error(error);

      return reply.status(503).send({
        status: "degraded" as const,
        service: "backend" as const,
        timestamp: new Date().toISOString(),
        database: {
          status: "error" as const,
          error: error instanceof Error ? error.message : "Unknown database error",
        },
      });
    }
  });
};

export default healthRoute;
