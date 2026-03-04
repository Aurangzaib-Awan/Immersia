import React from 'react';
import { useEffect, useState } from 'react';
import AppRoutes from './routes';

const AdminRoute = ({ user, children }) => {
  if (!user) return <div>Redirecting to login...</div>;
  if (!user.is_admin) return <div>Access denied. Redirecting...</div>;
  return children;
};

const UserRoute = ({ user, children }) => {
  if (!user) return <div>Redirecting to login...</div>;
  if (user.is_admin) return <div>Admins cannot access user pages. Redirecting...</div>;
  return children;
};

function App() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // ── Your app uses COOKIE-based auth (credentials: 'include') ──
        // localStorage will always be empty — that is normal and correct.
        // The session cookie is sent automatically by the browser on every
        // request; we just need to call /me to confirm it is still valid.

        // Check sessionStorage for a soft cache (survives page refresh
        // within the same tab, cleared when tab closes — safe for cookies)
        const cached = sessionStorage.getItem('user');
        if (cached) {
          try {
            const userData = JSON.parse(cached);
            setUser(userData);
            console.log('✓ User restored from session cache:', userData?.email);
            setLoading(false);
            return;
          } catch {
            sessionStorage.removeItem('user');
          }
        }

        // No cache → ask the server (cookie is sent automatically)
        const { authAPI } = await import('./services/api');
        const data = await authAPI.getCurrentUser();

        if (data) {
          // Normalise: backend may return {user:{...}} or flat fields
          const u = data.user
            ? data.user
            : {
                id:       data.id       || data._id,
                email:    data.email,
                role:     data.role,
                is_admin: data.is_admin,
                name:     data.name     || data.username,
              };

          // Cache in sessionStorage so refreshes don't hit /me every time
          sessionStorage.setItem('user', JSON.stringify(u));
          setUser(u);
          console.log('✓ User fetched from /me:', u?.email);
        } else {
          setUser(null);
        }

      } catch (err) {
        // 401 just means no active session — not an error worth logging loudly
        if (err.message?.includes('Authentication required') ||
            err.message?.includes('401')) {
          console.log('No active session — user not logged in');
        } else {
          console.error('Auth init failed:', err.message);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(248,250,252)] flex items-center justify-center">
        <div className="text-[rgb(15,23,42)]">Loading...</div>
      </div>
    );
  }

  return <AppRoutes user={user} setUser={setUser} />;
}

export default App;