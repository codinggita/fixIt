import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import CategoryBadge from '../../components/ui/CategoryBadge';
import Pagination from '../../components/ui/Pagination';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Navbar from '../../components/shared/Navbar';
import Sidebar from '../../components/shared/Sidebar';
import { useDebounce } from '../../hooks/useDebounce';
import { toast } from 'react-hot-toast';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Filters state mapping directly to UI
  const [filters, setFilters] = useState({
    status: 'All',
    category: 'All',
    block: 'All'
  });

  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  const fetchComplaints = async (search, filterParams, currentPage = 1) => {
    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });
      
      if (search) queryParams.append('title', search);
      if (filterParams.status !== 'All') queryParams.append('status', filterParams.status);
      if (filterParams.category !== 'All') queryParams.append('category', filterParams.category);
      if (filterParams.block !== 'All') queryParams.append('hostelBlock', filterParams.block);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/all?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch complaints');
      }
      
      const formatted = result.data.complaints.map(c => ({
        id: c._id,
        title: c.title,
        studentName: c.studentId.name,
        room: c.roomNumber,
        block: c.hostelBlock,
        category: c.category,
        status: c.status,
        date: new Date(c.createdAt).toLocaleDateString()
      }));
      
      setComplaints(formatted);
      setTotalPages(result.data.totalPages || 1);
    } catch (err) {
      toast.error(err.message || 'Error occurred while searching');
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(searchTerm, filters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // Re-fetch on page change

  // Custom debounced search with 400ms delay. 
  // We use useDebounce from the custom hook we built for the debouncing.
  const handleSearchAPI = useDebounce((currentSearch, currentFilters, p) => {
    fetchComplaints(currentSearch, currentFilters, p);
  }, 400);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(1);
    handleSearchAPI(value, filters, 1);
  };

  const handleFilterChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    setPage(1);
    fetchComplaints(searchTerm, newFilters, 1);
  };

  const handleStatusUpdate = async (id, newStatus) => {
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

      toast.success('Status updated');
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const paginatedComplaints = complaints;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-[90rem] mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manage Complaints</h1>

            {/* Filters Row */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by student, room, or title..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                  />
                  {isSearching && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium mr-1 hidden sm:inline">Filters:</span>
                  </div>
                  
                  <select 
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500 py-2 px-3 transition-colors"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>

                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500 py-2 px-3 transition-colors"
                  >
                    <option value="All">All Categories</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Other">Other</option>
                  </select>

                  <select
                    name="block"
                    value={filters.block}
                    onChange={handleFilterChange}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500 py-2 px-3 transition-colors"
                  >
                    <option value="All">All Blocks</option>
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {loading && !isSearching ? (
                <div className="py-32">
                  <LoadingSpinner size="lg" />
                </div>
              ) : complaints.length === 0 ? (
                <div className="py-32 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-lg">No complaints found matching your criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student/Room</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Complaint</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status & Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-800">
                      {paginatedComplaints.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{complaint.studentName}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{complaint.block} - {complaint.room}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Link to={`/admin/complaint/${complaint.id}`} className="text-sm font-medium text-blue-500 hover:underline line-clamp-2">
                              {complaint.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <CategoryBadge category={complaint.category} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {complaint.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-3">
                              <select
                                value={complaint.status}
                                onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                                className={`text-xs font-medium rounded-full px-2.5 py-1 border-2 focus:outline-none transition-colors
                                  ${complaint.status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50' : 
                                    complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50' : 
                                    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'}
                                `}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                              <Link
                                to={`/admin/complaint/${complaint.id}`}
                                className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              >
                                <Eye className="w-5 h-5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <Pagination 
                    currentPage={page} 
                    totalPages={totalPages} 
                    onPageChange={setPage} 
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminComplaints;
