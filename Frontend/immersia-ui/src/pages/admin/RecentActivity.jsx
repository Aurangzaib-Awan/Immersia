import React, { useState, useEffect } from 'react';

const RecentActivity = () => {
  const [visibleActivities, setVisibleActivities] = useState([]);

  const activities = [
    { id: 1, user: 'John Doe', action: 'completed Python course', time: '2 hours ago' },
    { id: 2, user: 'Sarah Smith', action: 'started new project', time: '4 hours ago' },
    { id: 3, user: 'Mike Johnson', action: 'earned Data Science badge', time: '6 hours ago' },
    { id: 4, user: 'Emily Davis', action: 'completed assessment', time: '1 day ago' },
    { id: 5, user: 'Alex Brown', action: 'joined platform', time: '1 day ago' },
    { id: 6, user: 'Michael Wilson', action: 'completed React course', time: '2 days ago' },
    { id: 7, user: 'Jessica Lee', action: 'earned certification', time: '2 days ago' },
    { id: 8, user: 'David Chen', action: 'started new course', time: '3 days ago' },
    { id: 9, user: 'Maria Garcia', action: 'completed project', time: '3 days ago' },
    { id: 10, user: 'Robert Taylor', action: 'updated profile', time: '4 days ago' }
  ];

  useEffect(() => {
    // Animate activities in one by one
    const animateActivities = () => {
      activities.forEach((activity, index) => {
        setTimeout(() => {
          setVisibleActivities(prev => [...prev, activity]);
        }, index * 80);
      });
    };

    setTimeout(animateActivities, 400);
  }, []);

  return (
    <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
      <div className="bg-surface-800 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-text-white mb-4">Recent Activity</h3>
        
        {/* Scroll container for activities - shows 6 at a time */}
        <div className="max-h-64 overflow-y-auto">
          <div className="space-y-3 sm:space-y-4 pr-2">
            {activities.map((activity, index) => (
              <div 
                key={activity.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 sm:py-3 border-b border-background-700 last:border-b-0 gap-2 sm:gap-0 transition-all duration-500 ${
                  visibleActivities.some(a => a.id === activity.id)
                    ? 'opacity-100 transform translate-x-0'
                    : 'opacity-0 transform translate-x-4'
                }`}
                style={{
                  transitionDelay: visibleActivities.some(a => a.id === activity.id) ? `${index * 60}ms` : '0ms'
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-text-white font-medium truncate">{activity.user}</p>
                  <p className="text-text-gray text-sm truncate">{activity.action}</p>
                </div>
                <span className="text-text-light text-sm whitespace-nowrap sm:text-right">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Show message if there are more activities */}
        {activities.length > 6 && (
          <div className="mt-4 text-center">
            <p className="text-text-light text-sm">
              Scroll to see more activities
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;