import express from 'express';
import { getStats } from '../controllers/statsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getStats);

export default router;
