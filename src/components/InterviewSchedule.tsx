import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, X, Users } from 'lucide-react';

interface Interview {
  id: string;
  company_id: string;
  interview_date: string;
  interview_type: string;
  location: string;
  notes: string;
  companies?: { name: string };
}

interface Company {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
}

interface InterviewStudent {
  id: string;
  student_id: string;
  status: string;
  students?: { name: string };
}

export function InterviewSchedule() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null);
  const [interviewStudents, setInterviewStudents] = useState<InterviewStudent[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company_id: '',
    interview_date: new Date().toISOString().slice(0, 16),
    interview_type: 'Technical',
    location: '',
    notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInterviews();
    fetchCompanies();
    fetchStudents();
  }, []);

  const fetchInterviews = async () => {
    const { data, error } = await supabase
      .from('interviews')
      .select('*, companies(name)')
      .order('interview_date', { ascending: true });

    if (error) {
      console.error('Error fetching interviews:', error);
    } else {
      setInterviews(data || []);
    }
  };

  const fetchCompanies = async () => {
    const { data } = await supabase.from('companies').select('id, name').order('name');
    setCompanies(data || []);
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('id, name').order('name');
    setStudents(data || []);
  };

  const fetchInterviewStudents = async (interviewId: string) => {
    const { data } = await supabase
      .from('interview_students')
      .select('*, students(name)')
      .eq('interview_id', interviewId);
    setInterviewStudents(data || []);
    setSelectedStudentIds(data?.map(is => is.student_id) || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.company_id || !formData.interview_date || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from('interviews')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', editingId);

      if (error) {
        setError(error.message);
      } else {
        resetForm();
        fetchInterviews();
      }
    } else {
      const { error } = await supabase
        .from('interviews')
        .insert([{ ...formData, user_id: user?.id }]);

      if (error) {
        setError(error.message);
      } else {
        resetForm();
        fetchInterviews();
      }
    }
  };

  const handleEdit = (interview: Interview) => {
    setFormData({
      company_id: interview.company_id,
      interview_date: interview.interview_date.slice(0, 16),
      interview_type: interview.interview_type,
      location: interview.location,
      notes: interview.notes
    });
    setEditingId(interview.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this interview?')) {
      const { error } = await supabase.from('interviews').delete().eq('id', id);
      if (error) {
        alert('Error deleting interview: ' + error.message);
      } else {
        fetchInterviews();
      }
    }
  };

  const handleManageStudents = async (interviewId: string) => {
    setSelectedInterview(interviewId);
    await fetchInterviewStudents(interviewId);
    setShowStudentsModal(true);
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSaveStudents = async () => {
    if (!selectedInterview) return;

    const currentStudentIds = interviewStudents.map(is => is.student_id);
    const toAdd = selectedStudentIds.filter(id => !currentStudentIds.includes(id));
    const toRemove = currentStudentIds.filter(id => !selectedStudentIds.includes(id));

    for (const studentId of toAdd) {
      await supabase.from('interview_students').insert([{
        interview_id: selectedInterview,
        student_id: studentId,
        status: 'Scheduled'
      }]);
    }

    for (const studentId of toRemove) {
      const recordToDelete = interviewStudents.find(is => is.student_id === studentId);
      if (recordToDelete) {
        await supabase.from('interview_students').delete().eq('id', recordToDelete.id);
      }
    }

    setShowStudentsModal(false);
    setSelectedInterview(null);
  };

  const resetForm = () => {
    setFormData({
      company_id: '',
      interview_date: new Date().toISOString().slice(0, 16),
      interview_type: 'Technical',
      location: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Interview Schedule</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Schedule Interview
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Interview' : 'Schedule New Interview'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.interview_date}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
                <select
                  value={formData.interview_type}
                  onChange={(e) => setFormData({ ...formData, interview_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="Technical">Technical</option>
                  <option value="HR">HR</option>
                  <option value="Group Discussion">Group Discussion</option>
                  <option value="Aptitude">Aptitude</option>
                  <option value="Final">Final</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {editingId ? 'Update' : 'Schedule'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStudentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Manage Students</h3>
              <button onClick={() => setShowStudentsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {students.map((student) => (
                <label key={student.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(student.id)}
                    onChange={() => handleToggleStudent(student.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{student.name}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveStudents}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => setShowStudentsModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {interviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No interviews scheduled. Click "Schedule Interview" to get started.
                  </td>
                </tr>
              ) : (
                interviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {interview.companies?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(interview.interview_date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{interview.interview_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{interview.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{interview.notes || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleManageStudents(interview.id)}
                          className="text-green-600 hover:text-green-800 transition"
                          title="Manage Students"
                        >
                          <Users size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(interview)}
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(interview.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
