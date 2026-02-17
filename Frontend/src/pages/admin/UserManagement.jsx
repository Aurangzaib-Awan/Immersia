import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get user name - using 'fullname' from your database
  const getUserName = (user) => {
    return user.fullname || user.name || user.username || 'Unknown User';
  };

  // Helper function to get user email - using 'email' from your database
  const getUserEmail = (user) => {
    return user.email || user.emailAddress || 'No email';
  };

  // Format join date - your users don't have a date field, so we'll use a fallback
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'No date';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'No date';

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'No date';
    }
  };

  // Helper function to get join date - your users don't have date fields
  const getJoinDate = (user) => {
    // Try various possible date fields
    const dateString = user.createdAt ||
      user.created_date ||
      user.registrationDate ||
      user.dateCreated ||
      user.joinDate ||
      user.date ||
      user.timestamp;

    if (dateString) {
      return formatJoinDate(dateString);
    }

    // If no date field exists, use the ObjectId timestamp (MongoDB ObjectIds contain creation timestamp)
    try {
      if (user._id && user._id.length === 24) {
        // Extract timestamp from MongoDB ObjectId (first 4 bytes are timestamp)
        const timestamp = parseInt(user._id.substring(0, 8), 16);
        const date = new Date(timestamp * 1000);
        return formatJoinDate(date.toISOString());
      }
    } catch {
      console.log('Could not extract date from ObjectId');
    }

    return 'No date';
  };

  // Fetch real users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminAPI.getUsers();

      if (response && response.users) {
        console.log('📋 Raw user data from backend:', response.users); // Debug log

        const formattedUsers = response.users.map((user, index) => ({
          id: user._id || user.id || `user-${index}`,
          name: getUserName(user),
          email: getUserEmail(user),
          joined: getJoinDate(user),
          // Include original user data for reference
          originalData: user
        }));

        console.log('📋 Formatted users:', formattedUsers); // Debug log

        setUsers(formattedUsers);
        setVisibleUsers(formattedUsers.map(user => ({ ...user, visible: false })));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Animate users in after data is loaded
  useEffect(() => {
    if (users.length > 0 && !loading) {
      const animateUsers = () => {
        users.forEach((user, index) => {
          setTimeout(() => {
            setVisibleUsers(prev =>
              prev.map(u =>
                u.id === user.id ? { ...u, visible: true } : u
              )
            );
          }, index * 100);
        });
      };

      setTimeout(animateUsers, 50);
    }
  }, [users, loading]);

  // Delete user function
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // First, remove from UI immediately for better UX
      setUsers(prev => prev.filter(user => user.id !== userId));
      setVisibleUsers(prev => prev.filter(user => user.id !== userId));

      // Make API call to delete user from backend
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user from server');
      }

      console.log('User deleted successfully');

    } catch (error) {
      console.error('Error deleting user:', error);

      // Revert UI changes if deletion failed
      fetchUsers(); // Reload users from server
      alert('Failed to delete user. Please try again.');
    }
  };

  // Rest of your component remains the same...
  if (loading) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text">
              User Management
            </h1>
            <p className="text-text-light text-sm sm:text-base mt-1">Manage platform users and their accounts</p>
          </div>
        </div>

        <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
          <div className="bg-surface-800 rounded-xl p-4 sm:p-6">
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
              <span className="ml-3 text-gray-300">Loading users...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text">
              User Management
            </h1>
            <p className="text-text-light text-sm sm:text-base mt-1">Manage platform users and their accounts</p>
          </div>
        </div>

        <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
          <div className="bg-surface-800 rounded-xl p-4 sm:p-6">
            <div className="text-center py-8">
              <div className="text-red-400 mb-4">{error}</div>
              <button
                onClick={fetchUsers}
                className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text">
            User Management
          </h1>
          <p className="text-text-light text-sm sm:text-base mt-1">Manage platform users and their accounts</p>
        </div>
      </div>

      <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
        <div className="bg-surface-800 rounded-xl p-4 sm:p-6">
          <div className="overflow-x-auto">
            <div className="max-h-80 overflow-y-auto overflow-x-visible">
              <table className="w-full min-w-full">
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
                      className={`border-b border-background-700 last:border-b-0 hover:bg-background-750 transition-all duration-500 ${user.visible
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

            <div className="mt-4 text-center">
              <p className="text-text-light text-sm">
                Total Users: {users.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient-flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-flow {
          animation: gradient-flow 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;