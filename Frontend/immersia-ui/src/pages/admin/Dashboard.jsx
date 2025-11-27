import React, { useState, useEffect } from 'react';
import StatsGrid from './StatsGrid';
import RecentActivity from './RecentActivity';

const Dashboard = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  return (
    <div className={`transition-all duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-white">Dashboard Overview</h1>
        <p className="text-text-light text-sm sm:text-base mt-1">Welcome to your admin dashboard</p>
      </div>
      <StatsGrid />
      <RecentActivity />
    </div>
  );
};

export default Dashboard;