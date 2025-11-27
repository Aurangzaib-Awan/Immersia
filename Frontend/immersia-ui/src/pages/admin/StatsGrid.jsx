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
      title: 'Total Courses',
      value: '45',
      period: 'this month'
    },
    {
      id: 3,
      title: 'Total Projects',
      value: '89',
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => (
        <div 
          key={stat.id}
          className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow"
          style={{
            transitionDelay: visibleStats.some(s => s.id === stat.id) ? `${index * 80}ms` : '0ms',
            animationDelay: visibleStats.some(s => s.id === stat.id) ? `${index * 80}ms` : '0ms',
            animationDuration: '0.6s',
            animationFillMode: 'both',
            animationName: visibleStats.some(s => s.id === stat.id) ? 'slideInUp' : 'none',
            animationTimingFunction: 'ease-out'
          }}
        >
          <div className="bg-surface-800 rounded-xl p-4 sm:p-6 hover:bg-surface-750 transition-all duration-300 cursor-pointer group">
            <h3 className="text-text-light text-xs sm:text-sm font-medium mb-2">{stat.title}</h3>
            <div className="flex items-baseline justify-between">
              <p className="text-xl sm:text-2xl font-bold text-text-white group-hover:text-sky-400 transition-colors duration-300">{stat.value}</p>
            </div>
            <p className="text-text-muted text-xs mt-2">{stat.period}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;