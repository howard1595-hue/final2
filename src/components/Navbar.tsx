import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Home, Image, PlusCircle, LayoutDashboard, LogIn, LogOut, UserPlus, Menu, X, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, logout, isEmulator } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const activeClass = "text-white border-b-2 border-gold font-medium pt-1 pb-4";
  const inactiveClass = "text-zinc-400 hover:text-white transition-colors duration-200 border-b-2 border-transparent pt-1 pb-4";
  
  const mobileActiveClass = "bg-white/5 text-gold border-l-2 border-gold font-semibold block px-4 py-2 text-base";
  const mobileInactiveClass = "text-zinc-400 hover:bg-white/5 hover:text-white block px-4 py-2 text-base transition-colors duration-200";

  return (
    <nav className="bg-[#0A0A0A]/90 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:scale-105 transition-all duration-305">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-serif font-bold tracking-tighter text-gold group-hover:text-gold-hover transition-colors">
                  SHUTTER
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 block leading-none font-sans font-semibold mt-0.5">
                  Portfolio Manager
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 h-full pt-4">
            <Link to="/" className={`text-sm ${isActive('/') ? activeClass : inactiveClass}`}>
              <div className="flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                首頁
              </div>
            </Link>
            
            <Link to="/gallery" className={`text-sm ${isActive('/gallery') ? activeClass : inactiveClass}`}>
              <div className="flex items-center gap-1.5">
                <Image className="w-4 h-4" />
                作品集
              </div>
            </Link>

            {currentUser && (
              <>
                <Link to="/add-photo" className={`text-sm ${isActive('/add-photo') ? activeClass : inactiveClass}`}>
                  <div className="flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4" />
                    上傳作品
                  </div>
                </Link>
                <Link to="/dashboard" className={`text-sm ${isActive('/dashboard') ? activeClass : inactiveClass}`}>
                  <div className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    主控台
                  </div>
                </Link>
              </>
            )}
          </div>

          {/* User Profile & CTA / Login controls */}
          <div className="hidden md:flex items-center space-x-4">
            {isEmulator && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gold font-mono" title="此應用程式目前在 LocalStorage 模擬模式運行">
                <Database className="w-3.5 h-3.5 animate-pulse" />
                <span>模擬預覽中</span>
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold font-serif font-bold text-sm shadow-[0_0_12px_rgba(212,175,55,0.15)]">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-zinc-100 max-w-[125px] truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate max-w-[125px] font-mono">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-red-500/40 hover:bg-red-950/20 hover:text-red-400 text-zinc-400 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  登出
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white py-2.5 px-4 text-xs font-bold uppercase tracking-widest transition-colors duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  登入
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 bg-gold hover:bg-gold-hover text-black font-bold py-2.5 px-5 rounded-lg text-xs uppercase tracking-widest transition-all duration-200 shadow-lg shadow-gold/10 hover:shadow-gold/20"
                >
                  <UserPlus className="w-4 h-4" />
                  註冊成員
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            {isEmulator && (
              <span className="p-1.5 rounded bg-zinc-900 border border-zinc-750 text-amber-400 text-xs">
                <Database className="w-3.5 h-3.5" />
              </span>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-xl border border-zinc-800 focus:outline-none transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800/80 shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-top-4">
          <div className="px-2 pt-2 pb-4 space-y-1.5 sm:px-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={isActive('/') ? mobileActiveClass : mobileInactiveClass}
            >
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                首頁
              </div>
            </Link>
            <Link
              to="/gallery"
              onClick={() => setIsOpen(false)}
              className={isActive('/gallery') ? mobileActiveClass : mobileInactiveClass}
            >
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                作品集
              </div>
            </Link>
            {currentUser && (
              <>
                <Link
                  to="/add-photo"
                  onClick={() => setIsOpen(false)}
                  className={isActive('/add-photo') ? mobileActiveClass : mobileInactiveClass}
                >
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    上傳作品
                  </div>
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={isActive('/dashboard') ? mobileActiveClass : mobileInactiveClass}
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    我的作品
                  </div>
                </Link>
              </>
            )}

            <div className="border-t border-zinc-800 my-4 pt-4 px-3 flex flex-col gap-4">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-serif font-bold">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                      <p className="text-xs text-zinc-400 font-mono">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-950/20 text-red-400 font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-widest transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    登出系統
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 border border-white/10 text-zinc-300 font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-widest hover:bg-white/5"
                  >
                    <LogIn className="w-4 h-4" />
                    登入
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-gold text-black font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-widest"
                  >
                    <UserPlus className="w-4 h-4" />
                    註冊成員
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
