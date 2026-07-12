import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, Mail, Lock, User as UserIcon, ShieldAlert } from 'lucide-react';
import api from '../utils/api';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setError(null);
    setLoading(true);

    try {
      await api.post('/users/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Signup failed. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background blur decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl shadow-xl shadow-primary/20">
            AF
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            AssetFlow
          </h1>
          <p className="text-muted-foreground text-sm">
            Join the Enterprise Asset Registry System
          </p>
        </div>

        {/* Form Panel */}
        <div className="glass-panel p-8 rounded-2xl shadow-2xl relative border border-white/10">
          <h2 className="text-xl font-bold mb-6 text-foreground tracking-wide">Register Account</h2>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs font-semibold text-center animate-pulse">
              🎉 Registration Successful! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  className={`w-full bg-accent/20 border ${
                    errors.name ? 'border-destructive' : 'border-border'
                  } focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all`}
                />
              </div>
              {errors.name && (
                <p className="text-[10px] text-destructive font-semibold">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  {...register('email')}
                  className={`w-full bg-accent/20 border ${
                    errors.email ? 'border-destructive' : 'border-border'
                  } focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-destructive font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full bg-accent/20 border ${
                    errors.password ? 'border-destructive' : 'border-border'
                  } focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all`}
                />
              </div>
              {errors.password && (
                <p className="text-[10px] text-destructive font-semibold">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={`w-full bg-accent/20 border ${
                    errors.confirmPassword ? 'border-destructive' : 'border-border'
                  } focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] text-destructive font-semibold">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Warning Role Note */}
            <p className="text-[10px] text-amber-400 bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-lg leading-relaxed">
              ⚠️ Note: Custom account registrations default strictly to an <strong>Employee</strong> profile. Administrators assign roles from the employee directory.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Register Employee</span>
                </>
              )}
            </button>
          </form>

          {/* Direct Link to Sign In */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
