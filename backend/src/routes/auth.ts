import express from 'express';
import { signUp, signIn, getSession } from '../controllers/authController';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.get('/session', getSession);

export default router;
