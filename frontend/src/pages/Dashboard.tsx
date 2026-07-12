import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import api from '../utils/api';
import { 
  Folder, 
  CheckCircle2, 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  Clock, 
  Plus, 
  UserCheck,
  Sliders,
  History,
  FolderPlus,
  QrCode,
  ArrowLeftRight,
  CalendarRange,
  RefreshCw,
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface KpiMetrics {
  assetsAvailable: number;
  assetsAllocated: number;
  maintenanceToday: number;
  activeBookings: number;
  pendingTransfers: number;
  upcomingReturns: number;
  overdueReturns: number;
}

interface OverdueItem {
  id: string;
  assetTag: string;
  assetName: string;
  holderName: string;
  expectedReturn: string;
  daysOverdue: number;
}

interface EmployeeAllocation {
  id: string;
  tag: string;
  name: string;
  condition: string;
  expectedReturn: string;
}

interface BookingItem {
  id: string;
  assetName: string;
  bookerName: string;
  date: string;
  time: string;
  status: string;
}

interface LogItem {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeRole } = useAppSelector((state) => state.auth);
  
  // Dashboard states
  const [metrics, setMetrics] = useState({
    total: 0,
    available: 0,
    allocated: 0,
    maintenance: 0,
    bookings: 0,
    transfers: 0,
    upcomingReturns: 0,
    overdueReturns: 0,
  });

  const [overdueList, setOverdueList] = useState<OverdueItem[]>([]);
  const [employeeAllocations, setEmployeeAllocations] = useState<EmployeeAllocation[]>([]);
  const [recentBookings, setRecentBookings] = useState<BookingItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<LogItem[]>([]);

  // Interactivity states
  const [isOverdueExpanded, setIsOverdueExpanded] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);

  const handleSendReminder = (e: React.MouseEvent, holderName: string, assetName: string) => {
    e.stopPropagation();

    const newLog: LogItem = {
      id: `log-remind-${Date.now()}`,
      action: 'FOLLOW_UP_REMINDER',
      details: `Dispatched return notification reminder to ${holderName} for ${assetName}.`,
      createdAt: new Date().toISOString()
    };

    setRecentLogs(prev => [newLog, ...prev].slice(0, 4));
    setReminderStatus(`Reminder sent to ${holderName}!`);
    setTimeout(() => setReminderStatus(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const kpiRes = await api.get<KpiMetrics>('/dashboard/kpis');
        const k = kpiRes.data;
        setMetrics({
          total: k.assetsAvailable + k.assetsAllocated + k.maintenanceToday,
          available: k.assetsAvailable,
          allocated: k.assetsAllocated,
          maintenance: k.maintenanceToday,
          bookings: k.activeBookings,
          transfers: k.pendingTransfers,
          upcomingReturns: k.upcomingReturns,
          overdueReturns: k.overdueReturns,
        });
      } catch (err) {
        console.error('Failed to fetch KPI metrics', err);
      }

      try {
        const overdueRes = await api.get<OverdueItem[]>('/allocations/overdue');
        setOverdueList(overdueRes.data);
      } catch (err) {
        console.error('Failed to fetch overdue allocations', err);
      }

      try {
        if (activeRole === 'EMPLOYEE' && user) {
          const allocRes = await api.get<EmployeeAllocation[]>('/allocations', {
            params: { employeeId: user.id }
          });
          setEmployeeAllocations(allocRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch employee allocations', err);
      }

      try {
        const bookingsRes = await api.get<BookingItem[]>('/bookings/my');
        setRecentBookings(bookingsRes.data);
      } catch (err) {
        console.error('Failed to fetch bookings', err);
      }

      try {
        const logsRes = await api.get<LogItem[]>('/logs');
        setRecentLogs(logsRes.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch activity logs', err);
      }
    };

    fetchData();
  }, [activeRole, user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Greetings Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, <span className="text-primary font-bold">{user?.name}</span>. Here is your operational status today.
          </p>
        </div>

        {/* Current Date Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-xs text-muted-foreground font-semibold">
          <Clock size={14} className="text-primary" />
          <span>{new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Available Assets */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between hover:scale-[1.02] hover:border-emerald-300 hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-4xl md:text-5xl font-black text-emerald-600 tracking-tight leading-none">
              {metrics.available}
            </h3>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Available Assets</p>
        </div>

        {/* KPI: Allocated Assets */}
        <div className="glass-panel p-5 rounded-2xl border-slate-200 bg-slate-50/40 flex flex-col justify-between hover:scale-[1.02] hover:border-slate-300 hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none">
              {metrics.allocated}
            </h3>
            <span className="p-1.5 rounded-lg bg-slate-500/10 text-slate-500">
              <Folder size={16} />
            </span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Allocated</p>
        </div>

        {/* KPI: Maintenance */}
        <div className="glass-panel p-5 rounded-2xl border-amber-200 bg-amber-50/40 flex flex-col justify-between hover:scale-[1.02] hover:border-amber-300 hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-4xl md:text-5xl font-black text-amber-600 tracking-tight leading-none">
              {metrics.maintenance}
            </h3>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Wrench size={16} />
            </span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Maintenances</p>
        </div>

        {/* KPI: Active Bookings */}
        <div className="glass-panel p-5 rounded-2xl border-indigo-200 bg-indigo-50/40 flex flex-col justify-between hover:scale-[1.02] hover:border-indigo-300 hover:shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-4xl md:text-5xl font-black text-indigo-600 tracking-tight leading-none">
              {metrics.bookings}
            </h3>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Calendar size={16} />
            </span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Bookings</p>
        </div>
      </div>

      {/* Overdue Warning Alert Panel */}
      {metrics.overdueReturns > 0 && (
        <div 
          onClick={() => setIsOverdueExpanded(!isOverdueExpanded)}
          className="glass-panel p-4 rounded-xl border border-red-200 bg-red-50/40 hover:bg-red-50/60 cursor-pointer transition-all flex flex-col gap-3"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-500 w-5 h-5 animate-pulse" />
              <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
                {metrics.overdueReturns} {metrics.overdueReturns === 1 ? 'Asset Return is Overdue' : 'Assets are Overdue'} — {overdueList.map(o => `${o.assetName} (${o.daysOverdue} days)`).join(', ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {reminderStatus && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {reminderStatus}
                </span>
              )}
              {isOverdueExpanded ? <ChevronUp size={16} className="text-red-500" /> : <ChevronDown size={16} className="text-red-500" />}
            </div>
          </div>

          {isOverdueExpanded && (
            <div className="overflow-x-auto border-t border-red-200/60 pt-3 mt-1 animate-in fade-in" onClick={(e) => e.stopPropagation()}>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-red-200/40 text-red-800 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Tag</th>
                    <th className="pb-2">Asset Name</th>
                    <th className="pb-2">Current Holder</th>
                    <th className="pb-2">Expected Return</th>
                    <th className="pb-2">Overdue</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-200/20 text-red-900">
                  {overdueList.map(item => (
                    <tr key={item.id} className="hover:bg-red-50/30">
                      <td className="py-2.5 font-bold text-primary">{item.assetTag}</td>
                      <td className="py-2.5 font-semibold">{item.assetName}</td>
                      <td className="py-2.5">{item.holderName}</td>
                      <td className="py-2.5">{new Date(item.expectedReturn).toLocaleDateString()}</td>
                      <td className="py-2.5 font-black text-red-600">{item.daysOverdue} days</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={(e) => handleSendReminder(e, item.holderName, item.assetName)}
                          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all ml-auto"
                        >
                          <Send size={8} />
                          <span>Send Reminder</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Layout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column (Main Content depending on Role) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Employee Focus: My Allocations */}
          {activeRole === 'EMPLOYEE' && (
            <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
              <h3 className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-2">
                <CheckCircle2 size={18} className="text-primary" />
                <span>Your Checked-out Devices</span>
              </h3>

              {employeeAllocations.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground italic">
                  No assets are currently allocated directly to you.
                </div>
              ) : (
                <div className="space-y-3">
                  {employeeAllocations.map(alloc => (
                    <div key={alloc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center hover:border-primary/30 transition-all">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{alloc.tag}</span>
                          <h4 className="font-semibold text-sm">{alloc.name}</h4>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Condition: {alloc.condition}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block font-medium">Expected Return:</span>
                        <span className="text-xs font-bold text-foreground">{new Date(alloc.expectedReturn).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admin / Manager Focus: Active Bookings Overview */}
          {activeRole !== 'EMPLOYEE' && (
            <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
              <h3 className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                <span>Current & Upcoming Bookings</span>
              </h3>

              {recentBookings.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground italic">
                  No upcoming resource bookings scheduled today.
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const groupedBookings: Record<string, typeof recentBookings> = {};
                    recentBookings.forEach(b => {
                      if (!groupedBookings[b.assetName]) {
                        groupedBookings[b.assetName] = [];
                      }
                      groupedBookings[b.assetName].push(b);
                    });

                    return Object.entries(groupedBookings).map(([assetName, slots]) => (
                      <div key={assetName} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                          <h4 className="font-extrabold text-sm text-foreground">{assetName}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                            {slots.length} {slots.length === 1 ? 'Booking' : 'Bookings'}
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="text-muted-foreground font-semibold border-b border-slate-100/80 text-[10px] uppercase tracking-wider">
                                <th className="pb-1.5">Booked By</th>
                                <th className="pb-1.5">Date</th>
                                <th className="pb-1.5">Time Slot</th>
                                <th className="pb-1.5 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                              {slots.map(b => (
                                <tr key={b.id} className="hover:bg-slate-100/30">
                                  <td className="py-2 font-medium text-slate-800">{b.bookerName}</td>
                                  <td className="py-2 text-muted-foreground">{new Date(b.date).toLocaleDateString()}</td>
                                  <td className="py-2 font-semibold text-slate-700">{b.time}</td>
                                  <td className="py-2 text-right">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                      b.status === 'ONGOING' 
                                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                        : 'bg-primary/10 text-primary border border-primary/20'
                                    }`}>
                                      {b.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Timelines & Quick Actions */}
        <div className="space-y-6">
          
          {/* Issue 6: Real-time Activity Feed Card moved to the TOP of the right column with scroll limits */}
          <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
            <h3 className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-2">
              <Clock size={18} className="text-primary animate-pulse" />
              <span>Live Activity Stream</span>
            </h3>

            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-4">
              {recentLogs.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground italic">
                  No recent activity logged.
                </div>
              ) : (
                recentLogs.map((log, idx) => (
                  <div key={log.id} className="flex gap-3 text-xs relative">
                    {/* Connecting line */}
                    {idx !== recentLogs.length - 1 && (
                      <span className="absolute left-[7px] top-4 bottom-0 w-px bg-border/40"></span>
                    )}
                    {/* Bullet */}
                    <span className="w-4 h-4 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 mt-0.5 relative z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.2 rounded text-[7px] font-black uppercase ${
                          log.action === 'REGISTER' 
                            ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' 
                            : log.action === 'ALLOCATE' 
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : log.action === 'RETURN'
                            ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-semibold">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 text-[10px] mt-1 leading-relaxed line-clamp-2">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Issue 4: Quick Actions redesigned with button styled layout & icons */}
          <div className="glass-panel p-6 rounded-2xl border border-border/80 space-y-4">
            <h3 className="font-extrabold text-base tracking-tight text-foreground flex items-center gap-2">
              <Plus size={18} className="text-primary" />
              <span>Quick Shortcuts</span>
            </h3>

            <div className="flex flex-col gap-3">
              {/* Admin Quick Actions */}
              {activeRole === 'ADMIN' && (
                <>
                  <button 
                    onClick={() => navigate('/org-setup')}
                    className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-bold text-xs flex items-center gap-2.5 justify-start transition-all shadow-md shadow-primary/10 group"
                  >
                    <UserCheck size={16} className="shrink-0" />
                    <span>Promote Employee</span>
                  </button>
                  <button 
                    onClick={() => navigate('/org-setup')}
                    className="w-full px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-foreground font-bold text-xs flex items-center gap-2.5 justify-start transition-all group"
                  >
                    <Sliders size={16} className="text-primary shrink-0" />
                    <span>Manage Categories & Fields</span>
                  </button>
                  <button 
                    onClick={() => navigate('/logs')}
                    className="w-full px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-foreground font-bold text-xs flex items-center gap-2.5 justify-start transition-all group"
                  >
                    <History size={16} className="text-primary shrink-0" />
                    <span>Inspect Activity Logs</span>
                  </button>
                </>
              )}

              {/* Manager Quick Actions */}
              {activeRole === 'ASSET_MANAGER' && (
                <>
                  <button 
                    onClick={() => navigate('/assets')}
                    className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-bold text-xs flex items-center gap-2.5 justify-start transition-all shadow-md shadow-primary/10 group"
                  >
                    <FolderPlus size={16} className="shrink-0" />
                    <span>Register Physical Asset</span>
                  </button>
                  <button 
                    onClick={() => navigate('/audits')}
                    className="w-full px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-foreground font-bold text-xs flex items-center gap-2.5 justify-start transition-all group"
                  >
                    <QrCode size={16} className="text-primary shrink-0" />
                    <span>Scaffold Scheduled Audit Run</span>
                  </button>
                  <button 
                    onClick={() => navigate('/allocations')}
                    className="w-full px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-foreground font-bold text-xs flex items-center gap-2.5 justify-start transition-all group"
                  >
                    <ArrowLeftRight size={16} className="text-primary shrink-0" />
                    <span>Approve Asset Transfer</span>
                  </button>
                </>
              )}

              {/* Department Head Quick Actions */}
              {activeRole === 'DEPT_HEAD' && (
                <>
                  <button 
                    onClick={() => navigate('/bookings')}
                    className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-bold text-xs flex items-center gap-2.5 justify-start transition-all shadow-md shadow-primary/10 group"
                  >
                    <CalendarRange size={16} className="shrink-0" />
                    <span>Reserve Shared Space / Room</span>
                  </button>
                  <button 
                    onClick={() => navigate('/allocations')}
                    className="w-full px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-foreground font-bold text-xs flex items-center gap-2.5 justify-start transition-all group"
                  >
                    <ArrowLeftRight size={16} className="text-primary shrink-0" />
                    <span>Review Department Transfers</span>
                  </button>
                </>
              )}

              {/* Employee Quick Actions */}
              {activeRole === 'EMPLOYEE' && (
                <>
                  <button 
                    onClick={() => navigate('/bookings')}
                    className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-bold text-xs flex items-center gap-2.5 justify-start transition-all shadow-md shadow-primary/10 group"
                  >
                    <CalendarRange size={16} className="shrink-0" />
                    <span>Book Shared Vehicle / Room</span>
                  </button>
                  <button 
                    onClick={() => navigate('/maintenance')}
                    className="w-full px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-foreground font-bold text-xs flex items-center gap-2.5 justify-start transition-all group"
                  >
                    <Wrench size={16} className="text-primary shrink-0" />
                    <span>Raise Broken Asset Maintenance</span>
                  </button>
                  <button 
                    onClick={() => navigate('/assets')}
                    className="w-full px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-foreground font-bold text-xs flex items-center gap-2.5 justify-start transition-all group"
                  >
                    <RefreshCw size={16} className="text-primary shrink-0" />
                    <span>Initiate Allocation Return</span>
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
