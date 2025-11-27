import React, { useState, useEffect } from 'react';
import ChangePasswordForm from './ChangePasswordForm';

const Settings = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  const handleChangePassword = () => {
    setShowPasswordForm(true);
  };

  const handleClosePasswordForm = () => {
    setShowPasswordForm(false);
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-text-white mb-4 sm:mb-6">Settings</h1>
      
      <div 
        className={`bg-surface-800 rounded-xl shadow-sm border border-background-700 p-4 sm:p-6 transition-all duration-500 ${
          isVisible 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-4'
        }`}
      >
        <h3 className="text-base sm:text-lg font-semibold text-text-white mb-3 sm:mb-4">Account Settings</h3>
        <div className="space-y-3 sm:space-y-4">
          <button 
            onClick={handleChangePassword}
            className={`w-full bg-primary-500 text-white py-2 sm:py-2 rounded-lg hover:bg-primary-600 transition-all duration-300 text-sm sm:text-base ${
              isVisible 
                ? 'opacity-100 transform translate-x-0' 
                : 'opacity-0 transform translate-x-4'
            }`}
            style={{
              transitionDelay: isVisible ? '150ms' : '0ms'
            }}
          >
            Change Password
          </button>
          <button 
            className={`w-full bg-red-500 text-white py-2 sm:py-2 rounded-lg hover:bg-red-600 transition-all duration-300 text-sm sm:text-base ${
              isVisible 
                ? 'opacity-100 transform translate-x-0' 
                : 'opacity-0 transform translate-x-4'
            }`}
            style={{
              transitionDelay: isVisible ? '250ms' : '0ms'
            }}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Change Password Form Modal */}
      {showPasswordForm && (
        <ChangePasswordForm onClose={handleClosePasswordForm} />
      )}
    </div>
  );
}

export default Settings;