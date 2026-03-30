import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackageSearch, 
  Users, 
  ShoppingCart,
  Truck
} from 'lucide-react';

const Sidebar = ({ isOpen, setOpen }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/products', icon: <PackageSearch size={20} /> },
    { name: 'Orders', path: '/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Suppliers', path: '/suppliers', icon: <Truck size={20} /> },
    // If we wanted to add User Management:
    // { name: 'Users', path: '/users', icon: <Users size={20} /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 text-white transform transition duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-center h-16 bg-slate-900 font-bold text-xl tracking-wider">
          IMS Admin
        </div>

        <nav className="mt-5 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 mt-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="mx-3">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
