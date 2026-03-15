import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const NewComplaint = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electrical',
    roomNumber: user?.room || '',
    block: user?.block || ''
  });

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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category
        }) // room and block are handled by backend via req.user
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
          return;
        }
        throw new Error(data.message || 'Failed to submit complaint');
      }

      toast.success('Complaint submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'An error occurred');
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
                  Submit Maintenance Request
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Please provide as much detail as possible to help the maintenance team.
                </p>

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
                      placeholder="E.g., Leaking bathroom tap"
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
                      placeholder="Please describe the issue in detail..."
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
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewComplaint;
