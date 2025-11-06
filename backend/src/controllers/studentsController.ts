import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middleware/auth';

export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM students WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, department, graduation_year, cgpa } = req.body;

    if (!name || !email || !phone || !department || !graduation_year || cgpa === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (cgpa < 0 || cgpa > 10) {
      return res.status(400).json({ error: 'CGPA must be between 0 and 10' });
    }

    const result = await pool.query(
      `INSERT INTO students (user_id, name, email, phone, department, graduation_year, cgpa)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.userId, name, email, phone, department, graduation_year, cgpa]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, graduation_year, cgpa } = req.body;

    if (cgpa !== undefined && (cgpa < 0 || cgpa > 10)) {
      return res.status(400).json({ error: 'CGPA must be between 0 and 10' });
    }

    const result = await pool.query(
      `UPDATE students
       SET name = $1, email = $2, phone = $3, department = $4,
           graduation_year = $5, cgpa = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [name, email, phone, department, graduation_year, cgpa, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM students WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
