import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, LayoutDashboard, ClipboardList, ShieldAlert, LogOut, LogIn, UserPlus } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 px-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white transition-transform group-hover:scale-105 duration-300 shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors duration-200">
            CareerMap<span className="text-slate-400 font-normal">.ai</span>
          </span>
        </Link>

        {/* Dynamic Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 p-1 rounded-full text-sm font-medium">
          {user && (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 transition-all py-1.5 px-4 rounded-full ${
                  isActive('/dashboard') 
                    ? 'text-slate-900 bg-white shadow-sm font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/assessment"
                className={`flex items-center gap-1.5 transition-all py-1.5 px-4 rounded-full ${
                  isActive('/assessment') 
                    ? 'text-slate-900 bg-white shadow-sm font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Assessment
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 transition-all py-1.5 px-4 rounded-full ${
                    isActive('/admin') 
                      ? 'text-rose-600 bg-white shadow-sm font-semibold' 
                      : 'text-slate-600 hover:text-rose-600'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right side authentication button actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Student</span>
                <span className="text-sm font-medium text-slate-800">{user.fullName}</span>
              </div>
              
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold py-2 px-4 rounded-full transition-all border border-slate-200/60"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-4 rounded-full transition-all border border-slate-200/60"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-5 rounded-full transition-all shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
