import { listCategoryProblems } from '@controllers/problemController';
import { Router } from 'express';

const router = Router();

router.get('/:categoryId/problems', (req, res, next) => {
  void listCategoryProblems(req, res, next);
});

export default router;
