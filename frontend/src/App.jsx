import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import ChangePassword from './pages/ChangePassword';
import StaffDashboard from './pages/StaffDashboard';

const DashboardSwitch = () => {
  const { user } = React.useContext(AuthContext);
  if (user?.role === 'Staff') {
    return <StaffDashboard />;
  }
  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<div className="min-h-screen bg-gray-50 py-12"><Register /></div>} />
          
          {/* Protected Routes wrapped by ProtectedRoute layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardSwitch />} />
            <Route path="/register" element={<Register />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/suppliers" element={<Suppliers />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
