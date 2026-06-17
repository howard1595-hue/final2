import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddPhoto from './pages/AddPhoto';
import EditPhoto from './pages/EditPhoto';
import PhotoDetail from './pages/PhotoDetail';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

// Protected Route Wrapper to intercept unauthorized users
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-gold mb-3" />
        <p className="text-xs font-mono uppercase tracking-widest">驗證登入狀態中...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Redirect if already logged in (helper for Login/Register)
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) return null;
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

// Layout wrapper which includes the Navbar and Footer with gorgeous dark photographic design
function PageLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-gold selection:text-black">
      <Navbar />
      
      {/* Dynamic route animation wrapper using motion */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/photo/:id" element={<PhotoDetail />} />
              
              {/* Public only Auth routes */}
              <Route path="/login" element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              } />
              <Route path="/register" element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              } />

              {/* Private creator management routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/add-photo" element={
                <ProtectedRoute>
                  <AddPhoto />
                </ProtectedRoute>
              } />
              <Route path="/edit-photo/:id" element={
                <ProtectedRoute>
                  <EditPhoto />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modern minimal branding footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-8 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p>© {new Date().getFullYear()} SHUTTER PORTFOLIO MANAGER. ALL RIGHTS RESERVED.</p>
          <p className="text-[10px] text-zinc-650 tracking-wider">
            CRAFTED WITH REACT & TAILWIND CSS • DESIGNED FOR FINE ART CAPTURES
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PageLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
