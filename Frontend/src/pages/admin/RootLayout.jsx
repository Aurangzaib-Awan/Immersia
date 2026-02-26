import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar.jsx';
import Header from './Header.jsx';

const RootLayout = () => {
  return (
    <div className="flex h-screen bg-[rgb(248,250,252)]">
      {/* Sidebar */}
      <div className="relative">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[rgb(226,232,240)]"></div>
          <Header />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6 bg-[rgb(248,250,252)]">
          {/* Content container with shadow and border */}
          <div className="min-h-full rounded-xl border border-[rgb(226,232,240)] bg-white/50 backdrop-blur-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default RootLayout;