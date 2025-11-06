import express from 'express';
import { getPlacements, createPlacement, updatePlacement, deletePlacement } from '../controllers/placementsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getPlacements);
router.post('/', createPlacement);
router.put('/:id', updatePlacement);
router.delete('/:id', deletePlacement);

export default router;
