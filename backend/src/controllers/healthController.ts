import { Request, Response } from 'express';

import { connectDatabase } from '../config/db';

type HealthStatus = {
  api: 'ok';
  database?: 'ok';
};

// Handles GET /health and optionally checks DB connectivity with ?checkDb=true.
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  const checkDb = req.query.checkDb === 'true';
  const status: HealthStatus = { api: 'ok' };

  if (checkDb) {
    const client = await connectDatabase();
    await client.$queryRaw`SELECT 1`;
    status.database = 'ok';
  }

  res.json({ status });
};
