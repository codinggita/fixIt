import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Wrench, CheckCircle, ArrowRight } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import CategoryBadge from '../../components/ui/CategoryBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Fetch recent 5 for table
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/all?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (!response.ok) throw new Error(result.message || 'Failed to fetch complaints');
        
        const formatted = result.data.complaints.map(c => ({
          id: c._id,
          title: c.title,
          studentName: c.studentId.name,
          room: `${c.hostelBlock} - ${c.roomNumber}`,
          category: c.category,
          status: c.status,
          date: new Date(c.createdAt).toLocaleDateString()
        }));
        
        setComplaints(formatted);
        
        // Fetch all for stats (since we don't have a stats endpoint)
        const statsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/all?limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        if (statsRes.ok) {
           const allReqs = statsData.data.complaints;
           setStats({
             total: statsData.data.totalCount,
             pending: allReqs.filter(c => c.status === 'Pending').length,
             inProgress: allReqs.filter(c => c.status === 'In Progress').length,
             resolved: allReqs.filter(c => c.status === 'Resolved').length
           });
        }
      } catch (err) {
        toast.error(err.message || 'Error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Overview of all hostel maintenance activities.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard title="Total Requests" count={stats.total} icon={FileText} colorClass="bg-gray-500 text-gray-600 dark:text-gray-400" />
              <StatCard title="Pending" count={stats.pending} icon={Clock} colorClass="bg-amber-500 text-amber-600 dark:text-amber-500" />
              <StatCard title="In Progress" count={stats.inProgress} icon={Wrench} colorClass="bg-blue-500 text-blue-500 dark:text-blue-400" />
              <StatCard title="Resolved" count={stats.resolved} icon={CheckCircle} colorClass="bg-green-500 text-green-600 dark:text-green-500" />
            </div>

            {/* Recent Complaints Preview */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Requests</h3>
                <Link to="/admin/complaints" className="text-sm font-medium text-blue-500 hover:text-blue-500 flex items-center transition-colors">
                  View All <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
              
              {loading ? (
                <div className="py-20">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Request</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-800">
                      {complaints.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link to={`/admin/complaint/${complaint.id}`} className="text-sm font-medium text-blue-500 hover:underline">
                              {complaint.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white font-medium">{complaint.studentName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{complaint.room}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <CategoryBadge category={complaint.category} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap flex items-center">
                            <StatusBadge status={complaint.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {complaint.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
