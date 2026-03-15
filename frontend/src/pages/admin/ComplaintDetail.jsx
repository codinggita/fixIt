import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Mail, Calendar, CheckSquare } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import StatusBadge from '../../components/ui/StatusBadge';
import CategoryBadge from '../../components/ui/CategoryBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const AdminComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchComplaintDetail = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch details');
        
        const data = result.data;
        
        setComplaint({
          id: data._id,
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
          dateSubmitted: new Date(data.createdAt).toLocaleString(),
          student: {
            name: data.studentId.name,
            email: data.studentId.email,
            room: data.studentId.roomNumber,
            block: data.studentId.hostelBlock
          },
          activityLog: data.statusHistory.map(h => ({
             date: new Date(h.changedAt).toLocaleString(),
             action: `Status marked as ${h.status}`,
             author: 'System/Admin'
          })).reverse()
        });
      } catch (err) {
        toast.error(err.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaintDetail();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update status');
      
      const newLog = {
        date: new Date().toLocaleString(),
        action: `Status marked as ${newStatus}`,
        author: 'You (Admin)'
      };

      setComplaint(prev => ({
        ...prev,
        status: newStatus,
        activityLog: [newLog, ...prev.activityLog]
      }));
      toast.success('Status updated successfully');
    } catch (err) {
      toast.error(err.message || 'Error updating status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Complaints
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {complaint.title}
                      </h1>
                      <div className="flex items-center space-x-3 text-sm">
                        <CategoryBadge category={complaint.category} />
                        <span className="text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {complaint.dateSubmitted}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none mb-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {complaint.description}
                    </p>
                  </div>

                  {/* Status Updater Section */}
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <CheckSquare className="w-5 h-5 mr-2 text-blue-500" />
                      Update Status
                    </h3>
                    <div className="flex items-center space-x-4">
                      {['Pending', 'In Progress', 'Resolved'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          disabled={statusUpdating || complaint.status === status}
                          className={`
                            px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all
                            ${complaint.status === status 
                              ? (status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-500 dark:bg-green-900/30 dark:text-green-400 dark:border-green-500' :
                                 status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-500 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500' :
                                 'bg-amber-100 text-amber-800 border-amber-500 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-500')
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                            }
                            ${statusUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          {status}
                        </button>
                      ))}
                      {statusUpdating && <LoadingSpinner size="sm" className="ml-2" />}
                    </div>
                  </div>
                </div>

                {/* Activity Log */}
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Activity Log</h3>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {complaint.activityLog.map((log, logIdx) => (
                        <li key={logIdx}>
                          <div className="relative pb-8">
                            {logIdx !== complaint.activityLog.length - 1 ? (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ring-8 ring-white dark:ring-card-surface">
                                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {log.action} <span className="text-gray-500 dark:text-gray-500">by</span> <span className="font-medium text-gray-900 dark:text-white">{log.author}</span>
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                  {log.date}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sidebar Info Area */}
              <div className="space-y-6">
                {/* Student Info */}
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                    <User className="w-5 h-5 mr-2 text-gray-400" />
                    Student Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Name</span>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{complaint.student.name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Location</span>
                      <div className="mt-1 flex items-center text-sm text-gray-900 dark:text-white">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {complaint.student.block} — Room {complaint.student.room}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Contact</span>
                      <div className="mt-1 flex items-center text-sm text-gray-900 dark:text-white">
                        <Mail className="w-4 h-4 mr-1 text-gray-400" />
                        <a href={`mailto:${complaint.student.email}`} className="text-blue-500 hover:underline">
                          {complaint.student.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Status Badge */}
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Current Status</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="font-semibold text-gray-700 dark:text-gray-300">Status</div>
                    <StatusBadge status={complaint.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminComplaintDetail;
