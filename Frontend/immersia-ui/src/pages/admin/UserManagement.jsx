import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [visibleUsers, setVisibleUsers] = useState([]);

  // Move user data outside of useEffect to avoid unnecessary re-renders
  const userData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', joined: 'Jan 15, 2024' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', joined: 'Jan 15, 2024' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', joined: 'Jan 15, 2024' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', joined: 'Jan 20, 2024' },
    { id: 5, name: 'Alex Brown', email: 'alex@example.com', joined: 'Jan 25, 2024' },
    { id: 6, name: 'Emily Davis', email: 'emily@example.com', joined: 'Jan 28, 2024' },
    { id: 7, name: 'David Miller', email: 'david@example.com', joined: 'Feb 01, 2024' },
    { id: 8, name: 'Lisa Anderson', email: 'lisa@example.com', joined: 'Feb 05, 2024' }
  ];

  useEffect(() => {
    // Initialize state once with all data
    const initializeUsers = () => {
      setUsers(userData);
      setVisibleUsers(userData.map(user => ({ ...user, visible: false })));
    };

    initializeUsers();
    
    // Animate users in one by one
    const animateUsers = () => {
      userData.forEach((user, index) => {
        setTimeout(() => {
          setVisibleUsers(prev => 
            prev.map(u => 
              u.id === user.id ? { ...u, visible: true } : u
            )
          );
        }, index * 100);
      });
    };
    
    // Small delay to ensure DOM is ready
    setTimeout(animateUsers, 50);
  }, []); // Empty dependency array - runs only once

  const deleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    setVisibleUsers(visibleUsers.filter(user => user.id !== userId));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <div>
          {/* Animated Title */}
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text">
            User Management
          </h1>
          <p className="text-text-light text-sm sm:text-base mt-1">Manage platform users and their accounts</p>
        </div>
        {/* Add New User button removed */}
      </div>
      
      {/* Gradient Border Container */}
      <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
        <div className="bg-surface-800 rounded-xl p-4 sm:p-6">
          <div className="overflow-x-auto">
            {/* Scroll container with ALWAYS visible scrollbar */}
            <div className="max-h-80 overflow-y-auto overflow-x-visible">
              <table className="w-full min-w-full"> {/* Ensure table doesn't resize */}
                <thead className="sticky top-0 bg-surface-800 z-10 border-b border-background-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-text-light font-medium text-sm sm:text-base w-1/4">Name</th>
                    <th className="text-left py-3 px-4 text-text-light font-medium text-sm sm:text-base hidden sm:table-cell w-1/4">Email</th>
                    <th className="text-left py-3 px-4 text-text-light font-medium text-sm sm:text-base hidden md:table-cell w-1/4">Joined</th>
                    <th className="text-left py-3 px-4 text-text-light font-medium text-sm sm:text-base w-1/4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user, index) => (
                    <tr 
                      key={user.id}
                      className={`border-b border-background-700 last:border-b-0 hover:bg-background-750 transition-all duration-500 ${
                        user.visible 
                          ? 'opacity-100 transform translate-y-0' 
                          : 'opacity-0 transform translate-y-4'
                      }`}
                      style={{
                        transitionDelay: user.visible ? `${index * 80}ms` : '0ms'
                      }}
                    >
                      <td className="py-3 px-4 text-text-white text-sm sm:text-base">
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-text-light text-xs sm:hidden">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-gray text-sm sm:text-base hidden sm:table-cell">
                        {user.email}
                      </td>
                      <td className="py-3 px-4 text-text-light text-sm sm:text-base hidden md:table-cell">
                        {user.joined}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {/* Edit button removed */}
                          <button 
                            onClick={() => deleteUser(user.id)}
                            className="text-red-400 hover:text-red-300 transition-colors text-xs sm:text-sm px-2 py-1 border border-red-400 rounded hover:bg-red-400 hover:bg-opacity-10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* User count info */}
            <div className="mt-4 text-center">
              <p className="text-text-light text-sm">
                Total Users: {users.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;