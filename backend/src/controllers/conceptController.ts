import { requireUser } from '@middleware/auth';
import { getRecommendedProblems, getUserConceptMastery } from '@services/concept.service';
import { Request, Response } from 'express';

// Handles GET /concepts/mastery -> current user's concept scores.
export const getMastery = async (req: Request, res: Response): Promise<void> => {
  const user = requireUser(req);
  const mastery = await getUserConceptMastery(user.id);
  res.status(200).json({ mastery });
};

// Handles GET /concepts/recommendations -> next problems based on weak areas.
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  const user = requireUser(req);
  const recommendations = await getRecommendedProblems(user.id);
  res.status(200).json({ recommendations });
};
