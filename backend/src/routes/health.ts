import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

const healthQuerySchema = z.object({
  checkDb: z.enum(["true", "false"]).optional(),
});

const healthRoute: FastifyPluginAsync = async (app) => {
  app.get("/health", async (request, reply) => {
    const query = healthQuerySchema.parse(request.query);

    return reply.status(200).send({
      status: "ok" as const,
      service: "backend" as const,
      timestamp: new Date().toISOString(),
      database: {
        status: query.checkDb === "true" ? "not_configured" : "not_configured",
      },
    });
  });
};

export default healthRoute;
