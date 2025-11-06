import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Building2, Briefcase, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface Stats {
  totalStudents: number;
  totalCompanies: number;
  totalPlacements: number;
  placementRate: number;
  averagePackage: number;
  upcomingInterviews: number;
  topCompanies: { name: string; count: number }[];
  recentPlacements: {
    student_name: string;
    company_name: string;
    position: string;
    package: number;
    date: string;
  }[];
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalCompanies: 0,
    totalPlacements: 0,
    placementRate: 0,
    averagePackage: 0,
    upcomingInterviews: 0,
    topCompanies: [],
    recentPlacements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    const { data: students } = await supabase
      .from('students')
      .select('id', { count: 'exact' });

    const { data: companies } = await supabase
      .from('companies')
      .select('id', { count: 'exact' });

    const { data: placements } = await supabase
      .from('placements')
      .select('*, students(name), companies(name)')
      .eq('status', 'Confirmed');

    const { data: interviews } = await supabase
      .from('interviews')
      .select('id', { count: 'exact' })
      .gte('interview_date', new Date().toISOString());

    const totalStudents = students?.length || 0;
    const totalCompanies = companies?.length || 0;
    const totalPlacements = placements?.length || 0;

    const uniqueStudentsPlaced = new Set(placements?.map(p => p.student_id) || []).size;
    const placementRate = totalStudents > 0 ? (uniqueStudentsPlaced / totalStudents) * 100 : 0;

    const totalPackageSum = placements?.reduce((sum, p) => sum + p.package, 0) || 0;
    const averagePackage = totalPlacements > 0 ? totalPackageSum / totalPlacements : 0;

    const companyCount = new Map<string, number>();
    placements?.forEach(p => {
      const companyName = p.companies?.name || 'Unknown';
      companyCount.set(companyName, (companyCount.get(companyName) || 0) + 1);
    });

    const topCompanies = Array.from(companyCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentPlacements = (placements || [])
      .sort((a, b) => new Date(b.placement_date).getTime() - new Date(a.placement_date).getTime())
      .slice(0, 5)
      .map(p => ({
        student_name: p.students?.name || 'Unknown',
        company_name: p.companies?.name || 'Unknown',
        position: p.position,
        package: p.package,
        date: p.placement_date
      }));

    setStats({
      totalStudents,
      totalCompanies,
      totalPlacements,
      placementRate,
      averagePackage,
      upcomingInterviews: interviews?.length || 0,
      topCompanies,
      recentPlacements
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Statistics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Users size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Companies</p>
              <p className="text-3xl font-bold mt-2">{stats.totalCompanies}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Building2 size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Placements</p>
              <p className="text-3xl font-bold mt-2">{stats.totalPlacements}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Briefcase size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Placement Rate</p>
              <p className="text-3xl font-bold mt-2">{stats.placementRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <TrendingUp size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Average Package</p>
              <p className="text-3xl font-bold mt-2">{stats.averagePackage.toFixed(2)} LPA</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <DollarSign size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100 text-sm font-medium">Upcoming Interviews</p>
              <p className="text-3xl font-bold mt-2">{stats.upcomingInterviews}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Calendar size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Top Recruiting Companies</h3>
          {stats.topCompanies.length === 0 ? (
            <p className="text-gray-500 text-sm">No placement data available</p>
          ) : (
            <div className="space-y-3">
              {stats.topCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 font-medium">{company.name}</span>
                  </div>
                  <span className="text-gray-600 text-sm">{company.count} placements</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Placements</h3>
          {stats.recentPlacements.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent placements</p>
          ) : (
            <div className="space-y-3">
              {stats.recentPlacements.map((placement, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-3 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-gray-800">{placement.student_name}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(placement.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{placement.position} at {placement.company_name}</p>
                  <p className="text-sm text-green-600 font-medium">{placement.package.toFixed(2)} LPA</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
