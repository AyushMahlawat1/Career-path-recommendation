import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Compass, Mail, Lock, ArrowRight, AlertCircle, Loader } from 'lucide-react';
import { authApi } from '../utils/api';

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      onLoginSuccess(response.user, response.token);
      
      if (response.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-md bg-white p-10 rounded-[28px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-white mx-auto mb-4">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="text-3xl font-display font-medium text-slate-950">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-2 font-sans">Sign in to initialize evaluation engines</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs flex items-start gap-2 border border-rose-100">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="jane.doe@test.com"
                {...register('email')}
                className={`w-full bg-slate-50 focus:bg-white text-sm text-slate-800 py-3 pl-11 pr-4 rounded-full border focus:outline-none focus:ring-1 transition-all ${
                  errors.email ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-slate-400 focus:border-slate-400'
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-rose-500 mt-1.5 ml-2 block">{errors.email.message as string}</span>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={`w-full bg-slate-50 focus:bg-white text-sm text-slate-800 py-3 pl-11 pr-4 rounded-full border focus:outline-none focus:ring-1 transition-all ${
                  errors.password ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-slate-400 focus:border-slate-400'
                }`}
              />
            </div>
            {errors.password && (
              <span className="text-xs text-rose-500 mt-1.5 ml-2 block">{errors.password.message as string}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-full transition-all mt-8 shadow-sm disabled:opacity-70 text-sm"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500">
          New to CareerMap?{' '}
          <Link to="/register" className="text-slate-900 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
