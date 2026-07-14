import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Compass, Mail, Lock, User, ArrowRight, AlertCircle, Loader } from 'lucide-react';
import { authApi } from '../utils/api';

const schema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

interface RegisterProps {
  onRegisterSuccess: (user: any, token: string) => void;
}

export default function Register({ onRegisterSuccess }: RegisterProps) {
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
      const response = await authApi.register(data);
      onRegisterSuccess(response.user, response.token);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
          <h2 className="text-3xl font-display font-medium text-slate-950">Create Account</h2>
          <p className="text-sm text-slate-400 mt-2 font-sans">Start your career evaluation assessment</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs flex items-start gap-2 border border-rose-100">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Jane Doe"
                {...register('fullName')}
                className={`w-full bg-slate-50 focus:bg-white text-sm text-slate-800 py-3 pl-11 pr-4 rounded-full border focus:outline-none focus:ring-1 transition-all ${
                  errors.fullName ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200 focus:ring-slate-400 focus:border-slate-400'
                }`}
              />
            </div>
            {errors.fullName && (
              <span className="text-xs text-rose-500 mt-1.5 ml-2 block">{errors.fullName.message as string}</span>
            )}
          </div>

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
                Registering...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-slate-900 font-semibold hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
