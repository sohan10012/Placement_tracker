import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middleware/auth';

export const getCompanies = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM companies WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { name, industry, location, website, contact_person, contact_email, contact_phone } = req.body;

    if (!name || !industry || !location || !contact_person || !contact_email || !contact_phone) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const result = await pool.query(
      `INSERT INTO companies (user_id, name, industry, location, website, contact_person, contact_email, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.userId, name, industry, location, website || null, contact_person, contact_email, contact_phone]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, industry, location, website, contact_person, contact_email, contact_phone } = req.body;

    const result = await pool.query(
      `UPDATE companies
       SET name = $1, industry = $2, location = $3, website = $4,
           contact_person = $5, contact_email = $6, contact_phone = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [name, industry, location, website, contact_person, contact_email, contact_phone, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM companies WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
