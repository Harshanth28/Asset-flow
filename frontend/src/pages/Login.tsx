import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch } from '../store';
import { setCredentials } from '../store/authSlice';
import api from '../utils/api';
import { KeyRound, Mail, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/users/login', {
        email: data.email,
        password: data.password,
      });

      const { accessToken, user: userData } = res.data;

      dispatch(
        setCredentials({
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role.toUpperCase().replace('DEPARTMENT_HEAD', 'DEPT_HEAD'),
            status: userData.status,
          },
          token: accessToken,
        })
      );
      navigate('/dashboard');
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Authentication failed. Please verify your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
            AF
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-primary bg-clip-text text-transparent">
            AssetFlow
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Centralized ERP Asset & Resource Manager
          </p>
        </div>

        {/* Login Form Panel */}
        <div className="glass-panel p-8 rounded-2xl shadow-xl hover:shadow-2xl border border-slate-200/90 bg-white relative transition-all">
          <h2 className="text-xl font-bold mb-6 text-foreground tracking-wide">Sign In</h2>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                 <input
                  type="email"
                  placeholder="name@company.com"
                  {...register('email')}
                  autoComplete="off"
                  className={`w-full bg-accent/20 border ${
                    errors.email ? 'border-destructive' : 'border-border'
                  } focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-destructive font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  autoComplete="new-password"
                  className={`w-full bg-accent/20 border ${
                    errors.password ? 'border-destructive' : 'border-border'
                  } focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-xl py-3 pl-11 pr-10 text-sm outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-destructive font-semibold">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Direct Link to Sign Up */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            New employee?{' '}
            <Link to="/signup" className="text-muted-foreground hover:text-primary font-semibold hover:underline transition-colors">
              Create an account
            </Link>
          </p>
        </div>


      </div>
    </div>
  );
};

export default Login;
