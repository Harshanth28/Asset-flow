import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { overrideActiveRole, setCredentials, type UserRole } from '../store/authSlice';
import { addNotification } from '../store/notificationSlice';
import api from '../utils/api';
import { Wrench, Shield, Users, Calendar, FastForward, BellRing, Settings, Sparkles } from 'lucide-react';

export const JudgePanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, activeRole } = useAppSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  const handleSIHReset = async () => {
    setSeedStatus('Seeding demo users into backend...');

    const demoUsers = [
      { name: 'Alice Chen', email: 'admin@assetflow.com', password: 'password' },
      { name: 'Sarah Connor', email: 'manager@assetflow.com', password: 'password' },
      { name: 'Priya Sharma', email: 'priya@assetflow.com', password: 'password' },
      { name: 'Raj Patel', email: 'raj@assetflow.com', password: 'password' },
    ];

    for (const u of demoUsers) {
      try {
        await api.post('/users/signup', u);
      } catch {
        // User may already exist — ignore conflict errors
      }
    }

    setSeedStatus('Users seeded. Logging in as Admin...');

    try {
      const res = await api.post('/users/login', {
        email: 'admin@assetflow.com',
        password: 'password',
      });
      const { accessToken, user: userData } = res.data;
      dispatch(
        setCredentials({
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role.toUpperCase().replace('DEPARTMENT_HEAD', 'DEPT_HEAD') as UserRole,
            status: userData.status,
          },
          token: accessToken,
        })
      );
      setSeedStatus('Done! Admin session active.');
      setTimeout(() => setSeedStatus(null), 2000);
    } catch {
      setSeedStatus('Backend unavailable. Start the server first.');
      setTimeout(() => setSeedStatus(null), 3000);
    }
  };

  // Mock accounts mapping to the seeded database profiles
  const accounts = [
    { name: 'Alice (Admin)', email: 'admin@assetflow.com', role: 'ADMIN' as UserRole },
    { name: 'Sarah (Manager)', email: 'manager@assetflow.com', role: 'ASSET_MANAGER' as UserRole },
    { name: 'Priya (Dept Head)', email: 'priya@assetflow.com', role: 'DEPT_HEAD' as UserRole },
    { name: 'Raj (Employee)', email: 'raj@assetflow.com', role: 'EMPLOYEE' as UserRole },
  ];

  const handleQuickLogin = async (email: string, role: UserRole, name: string) => {
    try {
      const res = await api.post('/users/login', {
        email,
        password: 'password',
      });
      const { accessToken, user: userData } = res.data;
      dispatch(
        setCredentials({
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role.toUpperCase().replace('DEPARTMENT_HEAD', 'DEPT_HEAD') as UserRole,
            status: userData.status,
          },
          token: accessToken,
        })
      );
    } catch {
      // Fallback: if backend is not running, use mock credentials for demo
      dispatch(
        setCredentials({
          user: {
            id: `seed-${role.toLowerCase()}`,
            name,
            email,
            role,
            status: 'active',
          },
          token: 'mock-jwt-token-for-judges',
        })
      );
    }
  };

  const handleRoleOverride = (role: UserRole) => {
    dispatch(overrideActiveRole(role));
  };

  // Mock triggers to simulate real-time socket events or backend cron occurrences
  const triggerNotification = (type: 'OVERDUE' | 'MAINTENANCE' | 'TRANSFER' | 'BOOKING') => {
    const id = `mock-notify-${Date.now()}`;
    const now = new Date().toISOString();
    
    switch (type) {
      case 'OVERDUE':
        dispatch(
          addNotification({
            id,
            userId: 'active-user',
            title: '⚠️ Overdue Return Alert',
            message: 'Asset Lenovo Thinkpad T14 (AF-0002) is past expected return date.',
            type: 'OVERDUE_RETURN',
            isRead: false,
            createdAt: now,
          })
        );
        break;
      case 'MAINTENANCE':
        dispatch(
          addNotification({
            id,
            userId: 'active-user',
            title: '🔧 Maintenance Approved',
            message: 'Maintenance request #MR-871 for MacBook Pro has been approved.',
            type: 'MAINTENANCE_ALERT',
            isRead: false,
            createdAt: now,
          })
        );
        break;
      case 'TRANSFER':
        dispatch(
          addNotification({
            id,
            userId: 'active-user',
            title: '🔄 Transfer Requested',
            message: 'Raj Patel has requested to transfer MacBook Pro (AF-0001) to Engineering.',
            type: 'TRANSFER_REQUEST',
            isRead: false,
            createdAt: now,
          })
        );
        break;
      case 'BOOKING':
        dispatch(
          addNotification({
            id,
            userId: 'active-user',
            title: '📅 Booking Confirmed',
            message: 'Your booking for Conference Room B2 today at 09:00 is confirmed.',
            type: 'BOOKING_REMINDER',
            isRead: false,
            createdAt: now,
          })
        );
        break;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-blue-500 text-primary-foreground flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all relative border border-white/20"
        title="Judge Developer Controls"
      >
        <Settings className={`w-6 h-6 ${isOpen ? 'animate-spin' : ''}`} />
      </button>

      {/* Controller Panel Card */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 glass-panel rounded-2xl p-5 shadow-2xl space-y-4 border border-white/10 animate-in slide-in-from-bottom-5 fade-in">
          <div>
            <h3 className="font-extrabold text-sm text-primary tracking-wide flex items-center gap-2">
              <Shield size={16} />
              <span>JUDGE PANEL CONTROLLER</span>
            </h3>
            <p className="text-[10px] text-muted-foreground">Quick actions to test system capabilities and roles.</p>
          </div>

          {/* SIH Hackathon Presentation Mode Seeder */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-primary/15 to-blue-500/10 border border-primary/25 space-y-2">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} className="text-primary animate-pulse" />
              <span>SIH Presentation Seeder</span>
            </h4>
            <p className="text-[9px] text-muted-foreground leading-relaxed">
              Seed demo users into the backend database and login as Admin.
            </p>
            {seedStatus && (
              <p className="text-[9px] font-bold text-primary">{seedStatus}</p>
            )}
            <button
              onClick={handleSIHReset}
              className="w-full py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-black text-[10px] uppercase tracking-wider rounded-lg shadow-lg shadow-primary/25 transition-all"
            >
              Initialize SIH Demo Data
            </button>
          </div>

          {/* Quick Logins Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Session Login</h4>
            <div className="grid grid-cols-2 gap-2">
              {accounts.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => handleQuickLogin(acc.email, acc.role, acc.name.split(' ')[0])}
                  className="px-2.5 py-1.5 rounded-lg bg-accent/25 border border-border/60 hover:bg-primary/20 hover:border-primary/50 text-left text-xs transition-all font-medium truncate"
                >
                  {acc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Role Overrides (only visible when logged in) */}
          {isAuthenticated && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Override Active Role</h4>
              <div className="grid grid-cols-4 gap-1.5">
                {(['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD', 'EMPLOYEE'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleOverride(role)}
                    className={`px-1 py-1 rounded text-[9px] font-extrabold transition-all border ${
                      activeRole === role 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-accent/15 border-border/40 hover:bg-accent/40 text-muted-foreground'
                    }`}
                  >
                    {role === 'ASSET_MANAGER' ? 'MGR' : role.replace('_', '').substring(0, 4)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Event Simulators (Time Travel / Socket.io) */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FastForward size={12} />
              <span>Simulate Real-time Events</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => triggerNotification('OVERDUE')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/20 border border-red-900/30 hover:bg-red-950/45 text-red-400 text-[10px] font-semibold transition-all text-left"
              >
                <BellRing size={10} />
                <span>Overdue Alert</span>
              </button>
              <button 
                onClick={() => triggerNotification('MAINTENANCE')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-950/20 border border-blue-900/30 hover:bg-blue-950/45 text-blue-400 text-[10px] font-semibold transition-all text-left"
              >
                <Wrench size={10} />
                <span>Maint Resolve</span>
              </button>
              <button 
                onClick={() => triggerNotification('TRANSFER')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/20 border border-amber-900/30 hover:bg-amber-950/45 text-amber-400 text-[10px] font-semibold transition-all text-left"
              >
                <Users size={10} />
                <span>Transfer Req</span>
              </button>
              <button 
                onClick={() => triggerNotification('BOOKING')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 hover:bg-emerald-950/45 text-emerald-400 text-[10px] font-semibold transition-all text-left"
              >
                <Calendar size={10} />
                <span>Booking Conf</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
