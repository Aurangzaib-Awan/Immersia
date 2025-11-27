import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const RootLayout = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900">
      {/* Sidebar with gradient border */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-sky-400 via-blue-600 to-sky-400 bg-[length:100%_200%] animate-gradient-flow"></div>
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with subtle gradient */}
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          <Header />
        </div>
        
        {/* Main content with enhanced styling */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6 bg-gradient-to-br from-surface-900 via-gray-900 to-surface-900">
          {/* Content container with shadow and border */}
          <div className="min-h-full rounded-xl border border-gray-800 bg-surface-800/50 shadow-2xl backdrop-blur-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default RootLayout;