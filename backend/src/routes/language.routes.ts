import { listLanguageCategories } from '@controllers/categoryController';
import { listLanguages } from '@controllers/languageController';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res, next) => {
  void listLanguages(req, res, next);
});

router.get('/:languageId/categories', (req, res, next) => {
  void listLanguageCategories(req, res, next);
});

export default router;
