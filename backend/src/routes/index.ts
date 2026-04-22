import { Router } from 'express';

import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import conceptRoutes from './concept.routes';
import dashboardRoutes from './dashboard.routes';
import healthRoutes from './health.routes';
import languageRoutes from './language.routes';
import problemRoutes from './problem.routes';
import progressRoutes from './progress.routes';
import submissionRoutes from './submission.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/languages', languageRoutes);
router.use('/categories', categoryRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/progress', progressRoutes);
router.use('/concepts', conceptRoutes);

export default router;

