import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import axios from 'axios';

const Register = () => {
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
      const res = await axios.post('/api/auth/register', { email, password });
      setCredentials({ _id: res.data._id, email: res.data.email }, res.data.token);
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('An account with this email already exists.');
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-foreground bg-background">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Create an account</h1>
            <p className="text-stale">Start tracking your career journey today.</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-light-border/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                placeholder="alex@example.com"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-light-border/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                placeholder="••••••••"
                required 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] flex justify-center items-center"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-stale">
            Already have an account? <Link to="/login" className="text-foreground hover:underline font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex w-1/2 relative bg-surface overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tl from-secondary/20 via-background to-background z-0"></div>
        <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
           {/* Decorative UI element */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="w-full max-w-sm rounded-3xl bg-background/50 backdrop-blur-xl border border-white/5 shadow-2xl p-8 space-y-6"
           >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">✨</div>
                <div>
                  <div className="h-4 w-24 bg-white/20 rounded mb-2"></div>
                  <div className="h-3 w-16 bg-white/10 rounded"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-white/5 rounded"></div>
                <div className="h-2 w-5/6 bg-white/5 rounded"></div>
                <div className="h-2 w-4/6 bg-white/5 rounded"></div>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
