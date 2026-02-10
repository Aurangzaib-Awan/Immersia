import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePasswordForm from './ChangePasswordForm';

const Header = () => {
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Logging out...');
    
    // Clear all authentication data
    const itemsToRemove = [
      'adminToken', 'adminUser', 'token', 'user', 
      'authToken', 'userData', 'session'
    ];
    
    itemsToRemove.forEach(item => {
      localStorage.removeItem(item);
      sessionStorage.removeItem(item);
    });
    
    // Clear the dropdown
    setShowAuthOptions(false);
    setShowLogoutConfirm(false);
    
    // Redirect to home page
    navigate('/');
    
    // Optional: Force reload for clean state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setShowAuthOptions(false);
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
    setShowAuthOptions(false);
  };

  const handleCloseChangePassword = () => {
    setShowChangePassword(false);
  };

  const toggleAuthOptions = () => {
    setShowAuthOptions(!showAuthOptions);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header className="bg-surface-800 border-b border-background-700">
        <div className="flex justify-end px-4 py-3">
          {/* Main Auth Button Container */}
          <div className="relative">
            {/* Animated Border Container */}
            <div className="relative p-[2px] rounded-full bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow">
              {/* Main Button */}
              <button 
                onClick={toggleAuthOptions}
                className="relative px-4 sm:px-6 py-2 sm:py-2.5 bg-surface-800 rounded-full text-text-white hover:bg-surface-700 transition-all duration-300 text-sm font-medium group overflow-hidden"
              >
                {/* Button Content */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm">Account</span>
                  <svg 
                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${showAuthOptions ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              </button>
            </div>

            {/* Dropdown Options */}
            {showAuthOptions && (
              <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-surface-800 border border-background-600 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-sm">
                {/* Header */}
                <div className="p-4 border-b border-background-600">
                  <h3 className="text-text-white font-semibold text-sm sm:text-base">Account Settings</h3>
                  <p className="text-text-light text-xs sm:text-sm mt-1">Manage your account preferences</p>
                </div>
                
                {/* Change Password Option */}
                <button
                  onClick={handleChangePassword}
                  className="w-full p-4 text-left text-text-white hover:bg-surface-750 transition-all duration-200 border-b border-background-600 flex items-center space-x-4 group"
                >
                  <div className="relative p-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 group-hover:from-sky-600 group-hover:to-blue-700 transition-all duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm sm:text-base font-medium">Change Password</span>
                    <p className="text-text-light text-xs mt-1">Update your security credentials</p>
                  </div>
                  <svg className="w-4 h-4 text-text-light group-hover:text-sky-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Logout Option */}
                <button
                  onClick={handleLogoutClick}
                  className="w-full p-4 text-left hover:bg-surface-750 transition-all duration-200 flex items-center space-x-4 group"
                >
                  <div className="relative p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 group-hover:from-red-600 group-hover:to-pink-700 transition-all duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm sm:text-base font-medium text-red-400 group-hover:text-red-300">Logout</span>
                    <p className="text-text-light text-xs mt-1">Sign out from your account</p>
                  </div>
                  <svg className="w-4 h-4 text-text-light group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Form */}
      {showChangePassword && (
        <ChangePasswordForm onClose={handleCloseChangePassword} />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-800 rounded-xl p-6 max-w-sm w-full border border-background-600 shadow-2xl">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">Logout Confirmation</h3>
              <p className="text-text-light text-sm mb-6">
                Are you sure you want to logout? You'll need to login again to access the admin panel.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 py-2.5 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;