import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'Staff'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return { label: '', color: 'bg-gray-200' };
    if (pass.length < 6) return { label: 'Weak', color: 'bg-red-500' };
    if (pass.length < 10) return { label: 'Medium', color: 'bg-yellow-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const passStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    const success = await register(
      formData.name, 
      formData.username, 
      formData.email, 
      formData.password, 
      formData.role
    );
    
    if (success) {
      toast.success('User registered successfully');
      setFormData({ name: '', username: '', email: '', password: '', role: 'Staff' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6 border-b pb-4">
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Register New User</h2>
            <p className="text-sm text-gray-500">Create staff or admin accounts</p>
          </div>
        </div>

        {user?.role !== 'Admin' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded flex items-center">
            <ShieldAlert className="mr-2" size={20} />
            <span className="text-sm">As a Staff member, you can only register other Staff members.</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                name="username"
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="johndoe123"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
            />
            {formData.password && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${passStrength.color} transition-all duration-300`} style={{ width: passStrength.label === 'Weak' ? '33%' : passStrength.label === 'Medium' ? '66%' : '100%' }}></div>
                </div>
                <span className="text-xs font-medium text-gray-500 w-12 text-right">{passStrength.label}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            >
              <option value="Staff">Staff</option>
              {user?.role === 'Admin' && <option value="Admin">Admin</option>}
            </select>
          </div>

          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors`}
            >
              {isSubmitting ? 'Creating User...' : 'Register User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
