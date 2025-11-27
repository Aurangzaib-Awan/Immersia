import React from 'react';
import { useEffect, useState } from 'react';
import AppRoutes from './routes';

// Protected Route Components (defined outside App component)
const AdminRoute = ({ user, children }) => {
  if (!user) {
    return <div>Redirecting to login...</div>;
  }
  
  if (!user.is_admin) {
    return <div>Access denied. Redirecting...</div>;
  }
  
  return children;
};

const UserRoute = ({ user, children }) => {
  if (!user) {
    return <div>Redirecting to login...</div>;
  }
  
  if (user.is_admin) {
    return <div>Admins cannot access user pages. Redirecting...</div>;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setTimeout(() => {
          setUser(JSON.parse(userData));
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Wrap AppRoutes with user context and protection logic
  return <AppRoutes user={user} setUser={setUser} />;
}

export default App;