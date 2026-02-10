import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const StatsGrid = () => {
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalProjects: 0
  });
  const [loading, setLoading] = useState(true);

  const stats = [
    {
      id: 1,
      title: 'Total Users',
      value: statsData.totalUsers.toLocaleString(),
      period: 'all time'
    },
    {
      id: 2,
      title: 'Total Courses',
      value: statsData.totalCourses.toLocaleString(),
      period: 'all time'
    },
    {
      id: 3,
      title: 'Total Projects',
      value: statsData.totalProjects.toLocaleString(),
      period: 'all time'
    }
  ];

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        setLoading(true);
        
        // Use the new stats endpoint
        const statsResponse = await adminAPI.getStats();
        
        setStatsData({
          totalUsers: statsResponse.totalUsers || 0,
          totalCourses: statsResponse.totalCourses || 0,
          totalProjects: statsResponse.totalProjects || 0
        });

      } catch (error) {
        console.error('Error fetching stats data:', error);
        setStatsData({
          totalUsers: 0,
          totalCourses: 0,
          totalProjects: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[1, 2, 3].map((item) => (
          <div 
            key={item}
            className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow"
          >
            <div className="bg-surface-800 rounded-xl p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat) => (
        <div 
          key={stat.id}
          className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow"
        >
          <div className="bg-surface-800 rounded-xl p-4 sm:p-6 hover:bg-surface-750 transition-all duration-300 cursor-pointer group">
            <h3 className="text-text-light text-xs sm:text-sm font-medium mb-2">{stat.title}</h3>
            <div className="flex items-baseline justify-between">
              <p className="text-xl sm:text-2xl font-bold text-text-white group-hover:text-sky-400 transition-colors duration-300">
                {stat.value}
              </p>
            </div>
            <p className="text-text-muted text-xs mt-2">{stat.period}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;