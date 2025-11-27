import React, { useState } from "react"; 
import { FaTachometerAlt, FaUsers, FaBook, FaChartLine, FaCog } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    
    const menuItems = [
        { name: "Dashboard", icon: <FaTachometerAlt />, path: "/admin" }, 
        { name: 'Users', icon: <FaUsers />, path: "/admin/users" },
        { name: 'Content', icon: <FaBook />, path: "/admin/content" },
        { name: 'Settings', icon: <FaCog />, path: "/admin/settings" }
    ];

    const closeMobileSidebar = () => {
        setIsMobileOpen(false);
    };

    return (
        <>
            {/* Mobile Sidebar Toggle Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button 
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="bg-card text-card-foreground p-2 rounded-lg hover:bg-background-700 transition-colors"
                >
                    ☰
                </button>
            </div>

            {/* Sidebar */}
            <div className={`w-16 lg:w-64 bg-surface-800 shadow-lg transition-all duration-300 fixed lg:relative h-screen z-40 ${
                isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
                <div className="p-4 lg:p-6">
                    <h1 className="text-xl lg:text-2xl font-bold text-text-white text-center lg:text-left">
                        <span className="lg:hidden">I</span>
                        <span className="hidden lg:inline">Immersia.</span>
                    </h1>
                </div>
                <nav className="mt-6">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={closeMobileSidebar}
                            className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start px-2 lg:px-6 py-3 transition-colors group ${
                                location.pathname === item.path
                                    ? 'bg-primary-500 text-text-white'
                                    : 'text-text-gray hover:bg-background-700 hover:text-text-white'
                            }`}
                        >
                            <span className={`text-lg ${
                                location.pathname === item.path 
                                    ? 'text-white' 
                                    : 'text-primary-400'
                            } group-hover:text-white`}>
                                {item.icon}
                            </span>
                            <span className="text-xs lg:text-base mt-1 lg:mt-0 lg:ml-3 text-center">
                                {item.name}
                            </span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={closeMobileSidebar}
                ></div>
            )}
        </>
    );
};

export default Sidebar;