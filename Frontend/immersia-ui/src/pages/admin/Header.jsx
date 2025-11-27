import React, { useState } from 'react';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Assuming admin is initially logged in

  const handleAuthClick = () => {
    if (isLoggedIn) {
      // Logout functionality - will be implemented later
      console.log('Logging out...');
      // Add your logout logic here later
      setIsLoggedIn(false);
    } else {
      // Login functionality - will be implemented later
      console.log('Redirecting to login...');
      // Add your login logic here later
      setIsLoggedIn(true);
    }
  };

  return (
    <header className="bg-surface-800 border-b border-background-700">
      <div className="flex justify-end px-4 py-3">
        <button 
          onClick={handleAuthClick}
          className={`px-3 py-1.5 rounded-md transition-colors text-sm ${
            isLoggedIn 
              ? 'bg-primary-500 text-text-white hover:bg-primary-600' 
              : 'bg-green-500 text-text-white hover:bg-green-600'
          }`}
        >
          {isLoggedIn ? 'Logout' : 'Login'}
        </button>
      </div>
    </header>
  );
};

export default Header;