import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { History, Search, Clock, User } from 'lucide-react';

interface LogUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LogEntry {
  id: string;
  userId: string;
  assetId?: string;
  action: string;
  details: string;
  createdAt: string;
  user: LogUser;
}

export const Logs: React.FC = () => {
  const [logsList, setLogsList] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get<LogEntry[]>('/logs')
      .then((res) => setLogsList(res.data))
      .catch((err) => console.error('Failed to fetch logs:', err));
  }, []);

  const filteredLogs = logsList.filter(log => {
    const searchString = `${log.action} ${log.details} ${log.user?.name ?? ''}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            System Logs
          </h1>
          <p className="text-muted-foreground text-sm">
            Review the immutable audit logs of all administrative, management, and employee transactions.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-accent/15 border border-border/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/25 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none transition-all"
          />
        </div>
      </div>

      {/* Logs Table list */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <h3 className="font-bold text-sm text-foreground uppercase tracking-wide flex items-center gap-2">
          <History size={16} className="text-primary" />
          <span>Security Audit Trail</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                <th className="pb-3 w-1/6">Timestamp</th>
                <th className="pb-3 w-1/6">Action Block</th>
                <th className="pb-3 w-1/4">Operator</th>
                <th className="pb-3">Transaction Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-muted-foreground italic">No audit transactions recorded.</td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  return (
                    <tr key={log.id} className="hover:bg-accent/10">
                      <td className="py-4 text-muted-foreground font-medium flex items-center gap-1.5">
                        <Clock size={12} className="text-primary" />
                        <span>{new Date(log.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                      </td>
                      <td className="py-4 font-bold text-foreground">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${
                          log.action === 'REGISTER' 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                            : log.action === 'ALLOCATE' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.action === 'RETURN'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-muted-foreground font-medium flex items-center gap-1.5">
                        <User size={12} />
                        <span>{log.user ? log.user.name : 'System Scheduler'}</span>
                      </td>
                      <td className="py-4 text-foreground font-semibold leading-relaxed">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Logs;
