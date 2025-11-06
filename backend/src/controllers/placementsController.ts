import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middleware/auth';

export const getPlacements = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.*,
              s.name as student_name,
              c.name as company_name
       FROM placements p
       LEFT JOIN students s ON p.student_id = s.id
       LEFT JOIN companies c ON p.company_id = c.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.userId]
    );

    const formattedPlacements = result.rows.map(row => ({
      id: row.id,
      student_id: row.student_id,
      company_id: row.company_id,
      position: row.position,
      package: parseFloat(row.package),
      placement_date: row.placement_date,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      students: { name: row.student_name },
      companies: { name: row.company_name }
    }));

    res.json(formattedPlacements);
  } catch (error) {
    console.error('Get placements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPlacement = async (req: AuthRequest, res: Response) => {
  try {
    const { student_id, company_id, position, package: pkg, placement_date, status } = req.body;

    if (!student_id || !company_id || !position || !pkg || !placement_date) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (pkg <= 0) {
      return res.status(400).json({ error: 'Package must be greater than 0' });
    }

    const result = await pool.query(
      `INSERT INTO placements (user_id, student_id, company_id, position, package, placement_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.userId, student_id, company_id, position, pkg, placement_date, status || 'Confirmed']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create placement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePlacement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { student_id, company_id, position, package: pkg, placement_date, status } = req.body;

    const result = await pool.query(
      `UPDATE placements
       SET student_id = $1, company_id = $2, position = $3, package = $4,
           placement_date = $5, status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [student_id, company_id, position, pkg, placement_date, status, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Placement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update placement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePlacement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM placements WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Placement not found' });
    }

    res.json({ message: 'Placement deleted successfully' });
  } catch (error) {
    console.error('Delete placement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
