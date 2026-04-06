import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, Wrench } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

const StaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/dashboard/staff');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Assigned / In Use</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.assignedProducts}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Available Units</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.availableProducts}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
          <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
            <Wrench size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Needs Maintenance</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.maintenanceProducts}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Welcome to the Staff Dashboard</h2>
        <p className="text-gray-600 group">
          From here you can manage PC & Laptop inventory status. Navigate to the <strong>Inventory</strong> to view products and update their availability, maintenance state, or assignment.
        </p>
      </div>
    </div>
  );
};

export default StaffDashboard;
