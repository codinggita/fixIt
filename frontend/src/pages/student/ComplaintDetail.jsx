import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import StatusTimeline from '../../components/ui/StatusTimeline';
import StatusBadge from '../../components/ui/StatusBadge';
import CategoryBadge from '../../components/ui/CategoryBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { toast } from 'react-hot-toast';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch complaint details');
        }

        const data = result.data;
        setComplaint({
          id: data._id,
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
          roomNumber: data.roomNumber,
          block: data.hostelBlock,
          dateSubmitted: new Date(data.createdAt).toLocaleString()
        });
      } catch (err) {
        toast.error(err.message || 'Error occurred');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, navigate]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete complaint');
      }

      toast.success('Complaint deleted successfully');
      setIsDeleteModalOpen(false);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Error deleting complaint');
    } finally {
      setIsDeleting(false);
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
          <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
              
              {complaint.status === 'Pending' && (
                <div className="flex space-x-3">
                  <Link 
                    to={`/complaint/${id}/edit`}
                    className="flex items-center px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1.5" /> Edit
                  </Link>
                  <button 
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center px-3 py-1.5 text-sm font-medium border border-red-300 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-4 py-6 sm:px-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {complaint.title}
                    </h1>
                    <div className="flex items-center space-x-3 text-sm">
                      <CategoryBadge category={complaint.category} />
                      <span className="text-gray-500 dark:text-gray-400">
                        Submitted: {complaint.dateSubmitted}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Request Progress</h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                    <StatusTimeline status={complaint.status} />
                  </div>
                </div>

                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {complaint.description}
                  </p>
                </div>

                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Hostel Block</h4>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{complaint.block}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Room Number</h4>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{complaint.roomNumber}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Request"
        message="Are you sure you want to delete this maintenance request? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ComplaintDetail;
