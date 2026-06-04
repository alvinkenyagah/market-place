import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);         // avatar dropdown
  const [menuOpen, setMenuOpen] = useState(false);     // mobile hamburger menu
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setIsOpen(false);
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const BACKEND_URL = 'https://market-place-api-xlwv.onrender.com';

  const getAvatarSrc = () => {
    if (user?.profileImage) {
      if (user.profileImage.startsWith('http')) return user.profileImage;
      const cleanImagePath = user.profileImage.startsWith('/')
        ? user.profileImage
        : `/${user.profileImage}`;
      return `${BACKEND_URL}${cleanImagePath}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff`;
  };

  const handleMobileLinkClick = () => setMenuOpen(false);

  // Helper function to dynamically add active link styles
  const getLinkClass = (path) => {
    const baseClass = "text-sm font-medium px-3 py-2 rounded-lg transition-all duration-150 whitespace-nowrap";
    const activeClass = "bg-amber-50 text-amber-900";
    const inactiveClass = "text-slate-600 hover:bg-slate-50 hover:text-slate-900";
    return `${baseClass} ${location.pathname === path ? activeClass : inactiveClass}`;
  };

  const getMobileLinkClass = (path, isSpecial = false) => {
    const baseClass = "block w-full text-left px-5 py-3 text-base font-medium transition-colors";
    if (isSpecial) return `${baseClass} text-amber-600 font-semibold bg-amber-50/50`;
    return `${baseClass} ${location.pathname === path ? 'bg-slate-50 text-slate-950 border-l-4 border-amber-500 pl-4' : 'text-slate-700 hover:bg-slate-50'}`;
  };

  return (
    <>
      <nav className="sticky top-0 z-50 h-16 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm px-4 md:px-6 lg:px-8 flex items-center justify-between font-sans">
        
        {/* ── Left: Brand ── */}
        <div className="flex items-center shrink-0">
          <Link 
            to="/" 
            className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
          >
            Marketplace
          </Link>
        </div>

        {/* ── Centre: Desktop Navigation Links ── */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/search" className={getLinkClass('/search')}>Search</Link>

          {user && (
            <Link to="/messages" className={getLinkClass('/messages')}>Messages</Link>
          )}

          {user?.role === 'customer' && (
            <>
              <Link to="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
              <Link to="/my-bookings" className={getLinkClass('/my-bookings')}>My Bookings</Link>
            </>
          )}
          {user?.role === 'provider' && (
            <>
              <Link to="/provider/dashboard" className={getLinkClass('/provider/dashboard')}>Dashboard</Link>
              <Link to="/provider/services" className={getLinkClass('/provider/services')}>My Services</Link>
              <Link to="/provider/bookings" className={getLinkClass('/provider/bookings')}>Bookings</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={getLinkClass('/admin')}>Admin Panel</Link>
          )}
        </div>

        {/* ── Right: Profile Dropdown / Auth Menu ── */}
        <div className="flex items-center gap-4">
          
          {/* Desktop Auth Links */}
          {!user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-xl shadow-sm transition-all active:scale-[0.98]">
                Register
              </Link>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                className="group flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="Open user menu"
              >
                <img
                  src={getAvatarSrc()}
                  alt={`${user.name}'s avatar`}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:border-amber-500 transition-colors duration-150"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`;
                  }}
                />
              </button>

              {/* Account Dropdown Menu Frame */}
              {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-50 origin-top-right transition transform animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 rounded-t-2xl">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs font-medium text-slate-500 capitalize mt-0.5">{user.role}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <div className="border-t border-slate-100" />
                  <button 
                    onClick={handleLogout} 
                    className="block w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50/60 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger Mobile Toggle Switch */}
          <button
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`block w-5 h-0.5 bg-slate-800 rounded transition-transform duration-200 origin-center ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block w-5 h-0.5 bg-slate-800 rounded transition-all duration-200 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-slate-800 rounded transition-transform duration-200 origin-center ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </nav>

      {/* ── Mobile Backdrop overlay ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity duration-200 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Slide-in Drawer Menu ── */}
      <aside 
        className={`fixed top-0 right-0 h-screen w-[280px] max-w-[85vw] bg-white border-l border-slate-200/60 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!menuOpen}
      >
        {/* User context information wrapper */}
        {user && (
          <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-100 bg-slate-50/50">
            <img
              src={getAvatarSrc()}
              alt={`${user.name}'s avatar`}
              className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`;
              }}
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs font-medium text-slate-400 capitalize mt-0.5">{user.role}</p>
            </div>
          </div>
        )}

        {/* Dynamic Drawer Route Navigation Target Stack */}
        <nav className="flex flex-col py-3 overflow-y-auto grow">
          <Link to="/search" className={getMobileLinkClass('/search')} onClick={handleMobileLinkClick}>Search</Link>

          {user && (
              <Link to="/messages" className={getMobileLinkClass('/messages')} onClick={handleMobileLinkClick}>Messages</Link>
            )}

          {user?.role === 'customer' && (
            <>
              <Link to="/dashboard" className={getMobileLinkClass('/dashboard')} onClick={handleMobileLinkClick}>Dashboard</Link>
              <Link to="/my-bookings" className={getMobileLinkClass('/my-bookings')} onClick={handleMobileLinkClick}>My Bookings</Link>
            </>
          )}
          {user?.role === 'provider' && (
            <>
              <Link to="/provider/dashboard" className={getMobileLinkClass('/provider/dashboard')} onClick={handleMobileLinkClick}>Dashboard</Link>
              <Link to="/provider/services" className={getMobileLinkClass('/provider/services')} onClick={handleMobileLinkClick}>My Services</Link>
              <Link to="/provider/bookings" className={getMobileLinkClass('/provider/bookings')} onClick={handleMobileLinkClick}>Bookings</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={getMobileLinkClass('/admin')} onClick={handleMobileLinkClick}>Admin Panel</Link>
          )}

          {user ? (
            <>
              <Link to="/profile" className={getMobileLinkClass('/profile')} onClick={handleMobileLinkClick}>Profile Settings</Link>
              <div className="h-px bg-slate-100 my-2 mx-5" />
              <button 
                onClick={handleLogout} 
                className="block w-full text-left px-5 py-3 text-base font-medium text-rose-600 hover:bg-rose-50/60 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="h-px bg-slate-100 my-2 mx-5" />
              <Link to="/login" className={getMobileLinkClass('/login')} onClick={handleMobileLinkClick}>Login</Link>
              <Link to="/register" className={getMobileLinkClass('/register', true)} onClick={handleMobileLinkClick}>Register</Link>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}