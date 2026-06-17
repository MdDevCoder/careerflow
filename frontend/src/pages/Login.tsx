import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, { email, password });
      setCredentials({ _id: res.data._id, email: res.data.email }, res.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/auth/demo`);
      setCredentials({ _id: res.data._id, email: res.data.email }, res.data.token);
      navigate('/');
    } catch (err: any) {
      setError('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-foreground bg-background">
      {/* Left Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back</h1>
            <p className="text-muted">Enter your details to access your dashboard.</p>
          </div>

          {error && <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger rounded-md text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="login_email" className="block text-sm font-medium mb-2">Email</label>
              <input 
                id="login_email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                placeholder="alex@example.com"
                required 
              />
            </div>
            <div>
              <label htmlFor="login_password" className="block text-sm font-medium mb-2">Password</label>
              <input 
                id="login_password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                placeholder="••••••••"
                required 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-foreground text-background font-semibold rounded-xl hover:opacity-90 transition-all flex justify-center items-center"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <hr className="w-full border-border" />
            <span className="px-3 text-sm text-muted">or</span>
            <hr className="w-full border-border" />
          </div>

          <button 
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="mt-6 w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]"
          >
            One-Click Demo Login
          </button>

          <p className="mt-8 text-center text-sm text-muted">
            Don't have an account? <Link to="/register" className="text-foreground hover:underline font-medium">Sign up</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Pane - Visual */}
      <div className="hidden lg:flex w-1/2 relative bg-surface overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background z-0"></div>
        <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="w-full max-w-lg aspect-square rounded-3xl bg-background/50 backdrop-blur-xl border border-border shadow-2xl p-8 flex flex-col relative overflow-hidden"
           >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
              <h2 className="text-2xl font-semibold mb-6">Your Kanban Board</h2>
              <div className="flex gap-4 h-full">
                <div className="flex-1 bg-surface-elevated/50 rounded-lg p-3 space-y-3">
                  <div className="w-20 h-4 bg-border rounded"></div>
                  <div className="w-full h-24 bg-surface-elevated rounded-md border border-border"></div>
                  <div className="w-full h-24 bg-surface-elevated rounded-md border border-border"></div>
                </div>
                <div className="flex-1 bg-surface-elevated/50 rounded-lg p-3 space-y-3">
                  <div className="w-20 h-4 bg-border rounded"></div>
                  <div className="w-full h-24 bg-primary/20 rounded-md border border-primary/30"></div>
                </div>
                <div className="flex-1 bg-surface-elevated/50 rounded-lg p-3 space-y-3">
                  <div className="w-20 h-4 bg-border rounded"></div>
                </div>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
