import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Mail, Key, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      localStorage.setItem('token', response.data.token);
      router.push('/'); // Successful login redirects to index.js
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* MAIN LOGIN SECTION - Centered using flex-grow */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-8">
          
          {/* LOGO AND HEADER SECTION */}
          <div className="text-center mb-8">
            <img 
              src="/img.png" 
              alt="SkillForge Logo" 
              className="h-16 mx-auto mb-6 object-contain" 
            />
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-2 text-sm md:text-base">Login to access SkillForge AI</p>
          </div>

          {/* ERROR MESSAGE ALERT */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 text-center animate-in fade-in">
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-700 font-medium"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-700 font-medium"
                  placeholder="••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3.5 rounded-xl transition-all font-bold shadow-md shadow-teal-600/20 disabled:opacity-70 mt-4 text-base"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          {/* SIGN UP LINK */}
          <p className="text-center text-slate-500 mt-8 text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <footer className="w-full py-6 px-4 md:px-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 mt-auto border-t border-slate-200/60">
        <p className="font-medium">© 2026 SkillForge by Rafay Khalil.</p>
        <div className="flex items-center gap-4 mt-3 md:mt-0 font-medium">
          <Link href="/privacy" className="hover:text-teal-600 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/terms" className="hover:text-teal-600 transition-colors">
            Terms & Conditions
          </Link>
        </div>
      </footer>

    </div>
  );
}