import React, { useState, useEffect } from 'react';
import { Package, IndianRupee, AlertTriangle, Truck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, lowStockRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/low-stock')
      ]);
      setStats(statsRes.data);
      setLowStock(lowStockRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  // Dummy data for charts since backend doesn't have chronological sales grouping yet
  const chartData = [
    { name: 'Revenue', amount: stats?.totalRevenue || 0 },
    { name: 'Costs', amount: stats?.totalCost || 0 },
    { name: 'Profit', amount: stats?.netProfit || 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Products</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.totalProducts}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800">₹{stats?.totalRevenue}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
          <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Low Stock Items</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.lowStockCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Suppliers</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.totalSuppliers}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Overview</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  formatter={(value) => [`₹${value}`, 'Amount']} 
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-red-50/30">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <AlertTriangle size={20} className="text-red-500 mr-2" />
              Low Stock Alerts
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-0">
            {lowStock.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {lowStock.map((item) => (
                  <li key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.stock_quantity} left
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>No low stock alerts right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
