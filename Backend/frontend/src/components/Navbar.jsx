import React, { useContext } from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isOpen, setOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
      <div className="flex items-center">
        <button 
          onClick={() => setOpen(!isOpen)} 
          className="text-gray-500 focus:outline-none lg:hidden"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-800">{user?.name || 'Admin'}</span>
            <span className="text-xs text-gray-500">{user?.role || 'Staff'}</span>
          </div>
          
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
            <User size={20} />
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-500 hover:text-red-500 transition-colors ml-4 border-l pl-4 border-gray-200"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
