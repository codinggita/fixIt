import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EditComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    roomNumber: '',
    block: ''
  });

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
        if (data.status !== 'Pending') {
          toast.error('Only pending complaints can be edited');
          navigate(`/complaint/${id}`);
          return;
        }

        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          roomNumber: data.roomNumber,
          block: data.hostelBlock
        });
      } catch (err) {
        toast.error(err.message || 'Error processing request');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update complaint');
      }

      toast.success('Complaint updated successfully');
      navigate(`/complaint/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white mb-1">
                  Edit Maintenance Request
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Update the details of your request below.
                </p>

                {loading ? (
                  <div className="py-20">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 border transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 border transition-colors"
                      >
                        <option>Electrical</option>
                        <option>Plumbing</option>
                        <option>Furniture</option>
                        <option>Cleaning</option>
                        <option>Networking</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formData.description.length}/500
                        </span>
                      </div>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        required
                        maxLength={500}
                        value={formData.description}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4 border transition-colors"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="block" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Hostel Block
                        </label>
                        <input
                          type="text"
                          name="block"
                          id="block"
                          disabled
                          value={formData.block}
                          className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 shadow-sm sm:text-sm py-3 px-4 border cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Room Number
                        </label>
                        <input
                          type="text"
                          name="roomNumber"
                          id="roomNumber"
                          disabled
                          value={formData.roomNumber}
                          className="block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 shadow-sm sm:text-sm py-3 px-4 border cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end space-x-4 border-t border-gray-200 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center rounded-lg border border-transparent bg-blue-500 py-2.5 px-6 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-colors"
                      >
                        {isSubmitting ? <LoadingSpinner size="sm" className="mr-2 text-white" /> : null}
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditComplaint;
