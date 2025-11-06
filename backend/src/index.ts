import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';

import authRoutes from './routes/auth';
import studentsRoutes from './routes/students';
import companiesRoutes from './routes/companies';
import placementsRoutes from './routes/placements';
import interviewsRoutes from './routes/interviews';
import statsRoutes from './routes/stats';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Placement Tracker API' });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/placements', placementsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/stats', statsRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
