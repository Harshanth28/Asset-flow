import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { setNotifications } from '../store/notificationSlice';
import { getDbTable } from '../utils/mockDb';
import { 
  LayoutDashboard, 
  Settings, 
  FolderTree, 
  ArrowLeftRight, 
  Calendar, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  History, 
  LogOut, 
  Bell, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, activeRole } = useAppSelector((state) => state.auth);
  const { items: notifications, unreadCount } = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const saved = getDbTable<any>('af_notifications');
    dispatch(setNotifications(saved));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Define sidebar navigation items based on active role permissions
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD', 'EMPLOYEE'] },
    { path: '/org-setup', label: 'Org Setup', icon: Settings, roles: ['ADMIN'] },
    { path: '/assets', label: 'Asset Directory', icon: FolderTree, roles: ['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD', 'EMPLOYEE'] },
    { path: '/allocations', label: 'Allocations & Transfers', icon: ArrowLeftRight, roles: ['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD'] },
    { path: '/bookings', label: 'Resource Bookings', icon: Calendar, roles: ['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD', 'EMPLOYEE'] },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD', 'EMPLOYEE'] },
    { path: '/audits', label: 'Asset Audits', icon: ClipboardCheck, roles: ['ADMIN', 'ASSET_MANAGER'] },
    { path: '/reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD'] },
    { path: '/logs', label: 'Activity Logs', icon: History, roles: ['ADMIN', 'ASSET_MANAGER'] },
  ];

  const filteredNavItems = navItems.filter(item => activeRole && item.roles.includes(activeRole));

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-lg shadow-primary/20">
              AF
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              AssetFlow
            </span>
          </div>
          <button 
            className="md:hidden p-1 rounded-lg hover:bg-accent text-muted-foreground"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider relative transition-all group ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary/10 to-blue-500/5 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                    : 'text-muted-foreground hover:bg-accent/25 hover:text-foreground border border-transparent'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-3 w-1 h-5 rounded-r bg-primary shadow-lg shadow-primary/50"></span>
                )}
                <Icon size={16} className={`transition-all ${isActive ? 'text-primary scale-110' : 'group-hover:text-foreground group-hover:scale-105'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-border bg-accent/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
              <UserIcon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{user?.name}</h4>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-semibold transition-all"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main layout area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top navbar header */}
        <header className="h-16 border-b border-border/80 bg-card/45 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="p-1 rounded-lg hover:bg-accent text-muted-foreground md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            
            {/* Display Active Role Badge & System status */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-semibold">Viewing as:</span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/20 shadow-sm shadow-primary/5">
                  {activeRole?.replace('_', ' ')}
                </span>
              </div>
              <span className="h-4 w-px bg-border/80"></span>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>System Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-time Notifications Popover */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl border border-border hover:bg-accent text-muted-foreground transition-all relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                    <h4 className="font-bold text-sm">Notifications</h4>
                    <span className="text-xs text-primary font-semibold">{unreadCount} Unread</span>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-6">No notifications yet.</p>
                    ) : (
                      notifications.map(item => (
                        <div key={item.id} className="p-2 rounded-lg bg-accent/20 hover:bg-accent/40 transition text-xs border border-border/40">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-primary">{item.title}</span>
                            <span className="text-[9px] text-muted-foreground">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{item.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* View content portal */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
