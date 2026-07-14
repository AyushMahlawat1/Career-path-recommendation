import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Assessment from './pages/Assessment';
import Report from './pages/Report';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import { authApi } from './utils/api';
import { Loader } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Authenticate user check on reload
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('career_token');
      if (token) {
        try {
          const userData = await authApi.me();
          setUser(userData);
        } catch (error) {
          console.error('Session authentication failed:', error);
          localStorage.removeItem('career_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData: any, token: string) => {
    localStorage.setItem('career_token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('career_token');
    localStorage.removeItem('career_student_level');
    localStorage.removeItem('latest_assessment_id');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-slate-500">Checking credentials...</p>
      </div>
    );
  }

  // Route protectors
  const StudentRoute = ({ children }: { children: JSX.Element }) => {
    if (!user) return <Navigate to="/login" replace />;
    return children;
  };

  const AdminRoute = ({ children }: { children: JSX.Element }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-secondary flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        
        <div className="flex-grow">
          <Routes>
            {/* Public */}
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/profile" replace /> : <Register onRegisterSuccess={handleLoginSuccess} />} 
            />

            {/* Student Protected */}
            <Route path="/profile" element={<StudentRoute><Profile /></StudentRoute>} />
            <Route path="/assessment" element={<StudentRoute><Assessment /></StudentRoute>} />
            <Route path="/report" element={<StudentRoute><Report /></StudentRoute>} />
            <Route path="/dashboard" element={<StudentRoute><Dashboard /></StudentRoute>} />

            {/* Admin Protected */}
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
