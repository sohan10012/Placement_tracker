import express from 'express';
import {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
  getInterviewStudents,
  addInterviewStudent,
  removeInterviewStudent
} from '../controllers/interviewsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getInterviews);
router.post('/', createInterview);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

router.get('/:interviewId/students', getInterviewStudents);
router.post('/students', addInterviewStudent);
router.delete('/students/:id', removeInterviewStudent);

export default router;
