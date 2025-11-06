import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middleware/auth';

export const getInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT i.*, c.name as company_name
       FROM interviews i
       LEFT JOIN companies c ON i.company_id = c.id
       WHERE i.user_id = $1
       ORDER BY i.interview_date ASC`,
      [req.userId]
    );

    const formattedInterviews = result.rows.map(row => ({
      id: row.id,
      company_id: row.company_id,
      interview_date: row.interview_date,
      interview_type: row.interview_type,
      location: row.location,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      companies: { name: row.company_name }
    }));

    res.json(formattedInterviews);
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { company_id, interview_date, interview_type, location, notes } = req.body;

    if (!company_id || !interview_date || !interview_type || !location) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const result = await pool.query(
      `INSERT INTO interviews (user_id, company_id, interview_date, interview_type, location, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.userId, company_id, interview_date, interview_type, location, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { company_id, interview_date, interview_type, location, notes } = req.body;

    const result = await pool.query(
      `UPDATE interviews
       SET company_id = $1, interview_date = $2, interview_type = $3,
           location = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [company_id, interview_date, interview_type, location, notes, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM interviews WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInterviewStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { interviewId } = req.params;

    const result = await pool.query(
      `SELECT ist.*, s.name as student_name
       FROM interview_students ist
       LEFT JOIN students s ON ist.student_id = s.id
       WHERE ist.interview_id = $1`,
      [interviewId]
    );

    const formatted = result.rows.map(row => ({
      id: row.id,
      student_id: row.student_id,
      status: row.status,
      students: { name: row.student_name }
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get interview students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addInterviewStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { interview_id, student_id, status } = req.body;

    const result = await pool.query(
      `INSERT INTO interview_students (interview_id, student_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (interview_id, student_id) DO NOTHING
       RETURNING *`,
      [interview_id, student_id, status || 'Scheduled']
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Student already added to this interview' });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add interview student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeInterviewStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM interview_students WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Interview student record not found' });
    }

    res.json({ message: 'Student removed from interview successfully' });
  } catch (error) {
    console.error('Remove interview student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
