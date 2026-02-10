/*
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const RecentActivity = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.getUsers();
      
      if (response && response.users) {
        setUsers(response.users);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Get available years from user data
  const getAvailableYears = () => {
    const years = new Set();
    users.forEach(user => {
      const dateStr = user.createdAt || user.registrationDate || user.date || user.timestamp || new Date().toISOString();
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        years.add(date.getFullYear());
      }
    });
    
    // If no years found, add current year
    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }
    
    return Array.from(years).sort((a, b) => b - a);
  };

  // Process data for graph - show all 12 months with user counts for selected year
  const processUsersForGraph = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Initialize all months with 0 counts
    const monthlyData = months.map((month, index) => ({
      month,
      users: 0,
      monthIndex: index,
      year: selectedYear
    }));

    // Count users for each month in selected year
    users.forEach(user => {
      const dateStr = user.createdAt || user.registrationDate || user.date || user.timestamp || new Date().toISOString();
      const date = new Date(dateStr);
      
      if (!isNaN(date.getTime()) && date.getFullYear() === selectedYear) {
        const monthIndex = date.getMonth(); // 0-11
        monthlyData[monthIndex].users++;
      }
    });

    return monthlyData;
  };

  const graphData = processUsersForGraph();
  const availableYears = getAvailableYears();
  const currentYearUsers = graphData.reduce((sum, month) => sum + month.users, 0);

  // Debug: Log the data to see bar heights
  useEffect(() => {
    if (users.length > 0 && graphData.length > 0) {
      console.log('=== GRAPH DATA ANALYSIS ===');
      graphData.forEach(month => {
        console.log(`${month.month}: ${month.users} users`);
      });
      
      const maxUsers = Math.max(...graphData.map(item => item.users));
      console.log('Maximum users in any month:', maxUsers);
      
      // Calculate heights for each bar
      graphData.forEach(month => {
        const heightPercentage = maxUsers > 0 ? (month.users / maxUsers) * 100 : 0;
        console.log(`${month.month} bar height: ${heightPercentage.toFixed(1)}% of max height`);
      });
    }
  }, [users, graphData]);

  if (loading) {
    return (
      <div className="bg-surface-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6">User Registration Trend</h3>
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          <span className="ml-3 text-gray-300">Loading user data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6">User Registration Trend</h3>
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">{error}</div>
          <button 
            onClick={fetchUserData} 
            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-800 rounded-xl shadow-lg p-6 border border-gray-700">
     
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">User Registration Trend</h3>
          <p className="text-sm text-gray-400 mt-1">Monthly registration overview</p>
        </div>
        
        
        {availableYears.length > 0 && (
          <div className="mt-3 sm:mt-0">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 p-2.5 font-medium"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{currentYearUsers}</div>
            <div className="text-xs text-gray-400">Total in {selectedYear}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-sky-400">
              {graphData.length > 0 ? Math.max(...graphData.map(item => item.users)) : 0}
            </div>
            <div className="text-xs text-gray-400">Peak Month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Graph Component with better height differentiation
const UserGraph = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-700 rounded-lg">
        <svg className="w-16 h-16 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p>No registration data available</p>
      </div>
    );
  }

  const maxUsers = Math.max(...data.map(item => item.users));
  //const minUsers = Math.min(...data.filter(item => item.users > 0).map(item => item.users));
  
  // Enhanced height calculation with minimum height for non-zero values
  const calculateBarHeight = (users) => {
    if (users === 0) return 0;
    
    // Ensure even the smallest non-zero value has visible height
    const minVisibleHeight = 15; // Minimum 15% height for any non-zero bar
    const calculatedHeight = (users / maxUsers) * 85; // Use 85% of available height
    
    return Math.max(calculatedHeight, minVisibleHeight);
  };

  return (
    <div className="w-full">
      
      <div className="flex items-end justify-between h-48 py-4 px-1 bg-gray-700/30 rounded-lg">
        {data.map((item, index) => {
          const barHeight = calculateBarHeight(item.users);
          const hasUsers = item.users > 0;
          const isPeakMonth = item.users === maxUsers;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 mx-0.5">
             
              <div 
                className={`w-6 rounded-t-lg transition-all duration-300 relative group ${
                  hasUsers 
                    ? isPeakMonth
                      ? 'bg-gradient-to-t from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg ring-2 ring-amber-400/50' 
                      : 'bg-gradient-to-t from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                style={{
                  height: `${barHeight}%`,
                  minHeight: hasUsers ? '12px' : '8px'
                }}
              >
               
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg border border-gray-700">
                  <div className="font-semibold">{item.users} users</div>
                  <div>{item.month} {item.year}</div>
                  {isPeakMonth && <div className="text-amber-400 text-xs">Peak Month</div>}
                </div>
                
                
                {hasUsers && (
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg"></div>
                )}
                
                
                {isPeakMonth && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-amber-400">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                )}
              </div>
              
              
              <div className={`mt-2 text-xs font-bold ${
                hasUsers 
                  ? isPeakMonth 
                    ? 'text-amber-400' 
                    : 'text-white' 
                  : 'text-gray-500'
              }`}>
                {item.users}
              </div>
              
            
              <div className={`mt-1 text-xs font-medium ${
                hasUsers 
                  ? isPeakMonth 
                    ? 'text-amber-300' 
                    : 'text-gray-300' 
                  : 'text-gray-500'
              }`}>
                {item.month}
              </div>
            </div>
          );
        })}
      </div>

      
      <div className="h-px bg-gray-600 mt-2"></div>

     
      <div className="flex justify-center items-center mt-4 space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gradient-to-t from-sky-500 to-blue-600 rounded-sm mr-2"></div>
          <span className="text-gray-300">Registrations</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gradient-to-t from-amber-500 to-orange-600 rounded-sm mr-2"></div>
          <span className="text-gray-300">Peak Month</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-600 rounded-sm mr-2"></div>
          <span className="text-gray-300">No Activity</span>
        </div>
      </div>

     
    </div>
  );
};

export default RecentActivity;
*/