import { connectDatabase } from '@config/db';
import { NextFunction,Request, Response } from 'express';

type HealthStatus = {
  api: 'ok';
  database?: 'ok';
};

export const healthCheck = async (req: Request, res: Response, next: NextFunction) => {
  const checkDb = req.query.checkDb === 'true';
  const status: HealthStatus = { api: 'ok' };

  try {
    if (checkDb) {
      const client = await connectDatabase();
      await client.$queryRaw`SELECT 1`;
      status.database = 'ok';
    }

    res.json({ status });
  } catch (error) {
    next(error);
  }
};
