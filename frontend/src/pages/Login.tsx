import React, { useState } from 'react';
import { useAuthStore } from '../lib/authStore';
import { useNavigate } from 'react-router-dom';
import { gqlClient, LOGIN_MUTATION } from '../lib/api';
import { Lock, Mail } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-12 h-12 bg-evismart-blue rounded-xl flex items-center justify-center mb-4">
          <span className="text-white text-2xl font-bold">E</span>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Sign in to EviSmart
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Reviewer Hint: <span className="font-semibold text-evismart-blue">tester@evismart.com</span> / <span className="font-semibold text-evismart-blue">password123</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue px-3 transition-shadow"
                  placeholder="tester@evismart.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue px-3 transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit" disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-evismart-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-evismart-blue transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
