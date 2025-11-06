import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middleware/auth';

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const studentsResult = await pool.query(
      'SELECT COUNT(*) as count FROM students WHERE user_id = $1',
      [req.userId]
    );

    const companiesResult = await pool.query(
      'SELECT COUNT(*) as count FROM companies WHERE user_id = $1',
      [req.userId]
    );

    const placementsResult = await pool.query(
      `SELECT p.*, s.name as student_name, c.name as company_name
       FROM placements p
       LEFT JOIN students s ON p.student_id = s.id
       LEFT JOIN companies c ON p.company_id = c.id
       WHERE p.user_id = $1 AND p.status = 'Confirmed'
       ORDER BY p.placement_date DESC`,
      [req.userId]
    );

    const interviewsResult = await pool.query(
      'SELECT COUNT(*) as count FROM interviews WHERE user_id = $1 AND interview_date >= CURRENT_TIMESTAMP',
      [req.userId]
    );

    const totalStudents = parseInt(studentsResult.rows[0].count);
    const totalCompanies = parseInt(companiesResult.rows[0].count);
    const totalPlacements = placementsResult.rows.length;
    const upcomingInterviews = parseInt(interviewsResult.rows[0].count);

    const uniqueStudentsPlaced = new Set(placementsResult.rows.map(p => p.student_id)).size;
    const placementRate = totalStudents > 0 ? (uniqueStudentsPlaced / totalStudents) * 100 : 0;

    const totalPackageSum = placementsResult.rows.reduce((sum, p) => sum + parseFloat(p.package), 0);
    const averagePackage = totalPlacements > 0 ? totalPackageSum / totalPlacements : 0;

    const companyCount = new Map<string, number>();
    placementsResult.rows.forEach(p => {
      const companyName = p.company_name || 'Unknown';
      companyCount.set(companyName, (companyCount.get(companyName) || 0) + 1);
    });

    const topCompanies = Array.from(companyCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentPlacements = placementsResult.rows
      .slice(0, 5)
      .map(p => ({
        student_name: p.student_name || 'Unknown',
        company_name: p.company_name || 'Unknown',
        position: p.position,
        package: parseFloat(p.package),
        date: p.placement_date
      }));

    res.json({
      totalStudents,
      totalCompanies,
      totalPlacements,
      placementRate,
      averagePackage,
      upcomingInterviews,
      topCompanies,
      recentPlacements
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
