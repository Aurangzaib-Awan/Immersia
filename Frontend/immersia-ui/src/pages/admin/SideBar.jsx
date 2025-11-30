import React, { useState } from "react"; 
import { FaTachometerAlt, FaUsers, FaBook, FaChartLine, FaProjectDiagram  } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    
    const menuItems = [
        { name: "Dashboard", icon: <FaTachometerAlt />, path: "/admin" }, 
        { name: 'Users', icon: <FaUsers />, path: "/admin/users" },
        { name: 'Learning Content', icon: <FaBook />, path: "/admin/learningContent" },
        { name: 'Projects', icon: <FaProjectDiagram  />, path: "/admin/projects" }
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
    {/* Animated Title */}
    <div className="flex justify-center lg:justify-start">
        <h1 className="text-3xl lg:text-4xl font-bold text-center lg:text-left bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text">
            <span className="lg:hidden">I</span>
            <span className="hidden lg:inline">Immersia.</span>
        </h1>
    </div>
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

            {/* Add the gradient animation keyframes */}
            <style jsx>{`
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
        </>
    );
};

export default Sidebar;