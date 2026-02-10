import React, { useState, useEffect } from 'react';
import StatsGrid from './StatsGrid';
//import RecentActivity from './RecentActivity';

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
        {/* Animated Title */}
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text">
          Dashboard Overview
        </h1>
        <p className="text-text-light text-sm sm:text-base mt-1">Welcome to your admin dashboard</p>
      </div>
      <StatsGrid />
      {/*<RecentActivity />*/}
    </div>
  );
};

export default Dashboard;