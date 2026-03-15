import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Wrench, CheckCircle, Plus } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import CategoryBadge from '../../components/ui/CategoryBadge';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/my?page=${page}&limit=${itemsPerPage}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Session expired. Please login again.');
            // We should use AuthContext logout here ideally, or just let ProtectedRoute handle it.
            // But since we can't easily access it without useAuth, we can just clear token and reload/redirect.
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
          }
          throw new Error(result.message || 'Failed to fetch complaints');
        }
        
        // Format dates to match UI expectation if needed
        const formattedComplaints = result.data.complaints.map(c => ({
          ...c,
          id: c._id,
          date: new Date(c.createdAt).toLocaleDateString()
        }));
        
        setComplaints(formattedComplaints);
        setTotalPages(result.data.totalPages || 1);
      } catch (err) {
        toast.error(err.message || 'Error occurred while fetching complaints');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComplaints();
  }, [page]);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  const paginatedComplaints = complaints;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
              <Link 
                to="/new-complaint" 
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Complaint</span>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard title="Total" count={stats.total} icon={FileText} colorClass="bg-gray-500 text-gray-600 dark:text-gray-400" />
              <StatCard title="Pending" count={stats.pending} icon={Clock} colorClass="bg-amber-500 text-amber-600 dark:text-amber-500" />
              <StatCard title="In Progress" count={stats.inProgress} icon={Wrench} colorClass="bg-blue-500 text-blue-500 dark:text-blue-400" />
              <StatCard title="Resolved" count={stats.resolved} icon={CheckCircle} colorClass="bg-green-500 text-green-600 dark:text-green-500" />
            </div>

            {/* Complaints List */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Complaints</h2>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              {loading ? (
                <div className="py-20">
                  <LoadingSpinner size="lg" />
                </div>
              ) : complaints.length === 0 ? (
                <EmptyState 
                  message="You haven't submitted any maintenance requests yet." 
                  actionButton={
                    <Link to="/new-complaint" className="mt-4 text-blue-500 font-medium hover:underline">
                      Create your first request
                    </Link>
                  }
                />
              ) : (
                <>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                    {paginatedComplaints.map((complaint) => (
                      <li key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-blue-500 truncate">{complaint.title}</p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <StatusBadge status={complaint.status} />
                              </div>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:justify-between">
                              <div className="sm:flex items-center">
                                <CategoryBadge category={complaint.category} />
                                <span className="mt-2 flex items-center text-sm sm:mt-0 sm:ml-4">
                                  <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  <p>Submitted on {complaint.date}</p>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-5 flex-shrink-0 flex items-center space-x-4">
                            <Link to={`/complaint/${complaint.id}`} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                              View
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
