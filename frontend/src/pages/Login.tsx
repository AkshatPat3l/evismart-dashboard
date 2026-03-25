import React, { useState } from 'react';
import { useAuthStore } from '../lib/authStore';
import { useNavigate } from 'react-router-dom';
import { gqlClient, LOGIN_MUTATION } from '../lib/api';
import { Lock, Mail } from 'lucide-react';

import { PulsingSignature } from '../components/ui/PulsingSignature';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await gqlClient.request<{ login: { token: string, user: any } }>(LOGIN_MUTATION, { email, password });
      login(response.login.token, response.login.user);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.response?.errors?.[0]?.message) {
        setError(err.response.errors[0].message);
      } else {
        setError('Login failed. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Pane - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center mb-8">
            <span className="text-white text-3xl font-bold tracking-tighter">E</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome to EviSmart
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your lab portal and manage cases.
          </p>

          <div className="mt-8">
            <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-md p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email" required
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 sm:text-sm border-slate-200 rounded-xl py-3 border outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-evismart-blue focus:border-transparent transition-all"
                      placeholder="tester@evismart.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password" required
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 sm:text-sm border-slate-200 rounded-xl py-3 border outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-evismart-blue focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 text-sm font-bold text-white bg-evismart-blue hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-evismart-blue transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Authenticating...' : 'Sign in safely'}
                </button>
              </form>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-slate-400">
            Hint: <span className="font-medium text-slate-500">tester@evismart.com / password123</span>
          </p>
        </div>
      </div>

      {/* Right Pane - 3D Animation */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-[#0f172a] to-[#1e293b] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[800px] h-[800px] opacity-80">
            <PulsingSignature color="#3b82f6" speed={1.2} distort={0.1} scale={0.8} />
          </div>
        </div>
        <div className="absolute bottom-12 left-12 right-12 text-center pointer-events-none text-white/40 font-medium tracking-widest text-sm uppercase">
          Intelligent Dental Operating Web System
        </div>
      </div>
    </div>
  );
};
