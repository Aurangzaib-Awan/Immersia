import React, { useState, useEffect } from 'react';

const StatsGrid = () => {
  const [visibleStats, setVisibleStats] = useState([]);

  const stats = [
    {
      id: 1,
      title: 'Total Users',
      value: '1,234',
      period: 'this month'
    },
    {
      id: 2,
      title: 'Total Recruiters',
      value: '456',
      period: 'this month'
    },
    {
      id: 3,
      title: 'Total Mentors',
      value: '89',
      period: 'this month'
    },
    {
      id: 4,
      title: 'Total Courses',
      value: '45',
      period: 'this month'
    },
    {
      id: 5,
      title: 'Revenue',
      value: '$42,500',
      period: 'this month'
    }
  ];

  useEffect(() => {
    // Animate stats in one by one
    const animateStats = () => {
      stats.forEach((stat, index) => {
        setTimeout(() => {
          setVisibleStats(prev => [...prev, stat]);
        }, index * 100);
      });
    };

    setTimeout(animateStats, 200);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => (
        <div 
          key={stat.id}
          className={`bg-surface-800 p-4 sm:p-6 rounded-xl shadow-sm border border-background-700 transition-all duration-500 cursor-pointer ${
            visibleStats.some(s => s.id === stat.id)
              ? 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform translate-y-4'
          } hover:border-primary-500 hover:shadow-lg hover:scale-[1.02] hover:bg-background-750`}
          style={{
            transitionDelay: visibleStats.some(s => s.id === stat.id) ? `${index * 80}ms` : '0ms'
          }}
        >
          <h3 className="text-text-light text-xs sm:text-sm font-medium mb-2">{stat.title}</h3>
          <div className="flex items-baseline justify-between">
            <p className="text-xl sm:text-2xl font-bold text-text-white">{stat.value}</p>
          </div>
          <p className="text-text-muted text-xs mt-2">{stat.period}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;