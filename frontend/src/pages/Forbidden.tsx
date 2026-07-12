import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center px-4 animate-in fade-in duration-300">
      <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-white/10 text-center space-y-6 shadow-2xl relative">
        {/* Glow */}
        <div className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-destructive/10 blur-[40px] pointer-events-none"></div>

        {/* Lock Icon */}
        <div className="inline-flex w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center shadow-xl shadow-destructive/10 animate-bounce">
          <ShieldAlert size={32} />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">403 Access Denied</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your current account credentials do not hold the required authorization credentials to access this system module.
          </p>
        </div>

        {/* Return Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent/70 border border-border text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
        >
          <ArrowLeft size={14} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default Forbidden;
