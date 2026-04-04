// components/Dashboard.jsx
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

const Dashboard = () => {
  const { userData, Logout } = useContext(AppContext);
  
  if (!userData) return null;
  
  // Get first character of username and convert to uppercase
  const userInitial = userData.username.charAt(0).toUpperCase();
  
  return (
    <div className="my-4 min-w-[220px] rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:w-full md:min-w-0">
      <div className="mb-4 flex items-center border-b border-slate-100 pb-4">
        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-lg font-bold text-white">
          {userInitial}
        </div>
        <span className="text-base font-medium text-slate-800">{userData.username}</span>
      </div>
      <div className="flex flex-col gap-3">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </Link>
        <button
          onClick={Logout}
          className="flex cursor-pointer items-center gap-2 rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;