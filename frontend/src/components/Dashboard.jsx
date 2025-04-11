// components/Dashboard.jsx
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

const Dashboard = () => {
  const { userData, Logout } = useContext(AppContext);
  
  if (!userData) return null;
  
  // Get first character of username and convert to uppercase
  const userInitial = userData.username.charAt(0).toUpperCase();
  
  return (
    <div className="dashboard-container">
      <div className="user-info">
        <div className="user-avatar">
          {userInitial}
        </div>
        <span className="username">{userData.username}</span>
      </div>
      <div className="dashboard-actions">
        <Link to="/dashboard" className="dashboard-btn">
          <FaTachometerAlt />
          <span>Dashboard</span>
        </Link>
        <button onClick={Logout} className="logout-btn">
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
      
      <style jsx>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 1rem;
          margin: 1rem 0;
          min-width: 220px;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #3498db;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: bold;
          margin-right: 0.8rem;
        }
        
        .username {
          font-size: 1rem;
          font-weight: 500;
          color: #333;
        }
        
        .dashboard-actions {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        
        .dashboard-btn, .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          cursor: pointer;
        }
        
        .dashboard-btn {
          background-color: #f8f9fa;
          color: #333;
          text-decoration: none;
          border: 1px solid #e9ecef;
        }
        
        .dashboard-btn:hover {
          background-color: #e9ecef;
        }
        
        .logout-btn {
          background-color: #fff;
          color: #dc3545;
          border: 1px solid #ffdde1;
        }
        
        .logout-btn:hover {
          background-color: #fff5f5;
        }
        
        @media (max-width: 768px) {
          .dashboard-container {
            min-width: unset;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;