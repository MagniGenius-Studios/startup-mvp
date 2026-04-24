import { Router } from 'express';

import authRoutes from './auth.routes';
import conceptRoutes from './concept.routes';
import dashboardRoutes from './dashboard.routes';
import explainRoutes from './explain.routes';
import healthRoutes from './health.routes';
import hintRoutes from './hint.routes';
import languageRoutes from './language.routes';
import problemRoutes from './problem.routes';
import progressRoutes from './progress.routes';
import submissionRoutes from './submission.routes';
import trackRoutes from './track.routes';

// Main API router: mounts feature-specific route modules under /api.
const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/languages', languageRoutes);
router.use('/tracks', trackRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/hint', hintRoutes);
router.use('/explain', explainRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/progress', progressRoutes);
router.use('/concepts', conceptRoutes);

export default router;
