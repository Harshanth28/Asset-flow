import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import api from '../utils/api';
import {
  Plus,
  Check,
  X,
  AlertCircle,
  Play,
  CheckCircle2,
  ClipboardList
} from 'lucide-react';

interface Asset {
  id: string;
  tag: string;
  name: string;
  status: string;
}

interface MaintenanceRequest {
  id: string;
  assetId: string;
  issue: string;
  priority: string;
  status: string;
  raisedById: string;
  technicianName?: string;
  reviewedById?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface User {
  id: string;
  name: string;
  role?: string;
}

export const Maintenance: React.FC = () => {
  const { user, activeRole } = useAppSelector((state) => state.auth);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [showAddForm, setShowAddForm] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [techName, setTechName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTables = () => {
    api.get<MaintenanceRequest[]>('/maintenance')
      .then(res => setRequests(res.data))
      .catch(() => setError('Failed to load maintenance requests.'));

    api.get<Asset[]>('/assets')
      .then(res => setAssets(res.data))
      .catch(() => {});

    api.get<User[]>('/users/directory')
      .then(res => setUsers(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadTables();
  }, []);

  const clearFeedbacks = () => {
    setError(null);
    setSuccess(null);
  };

  const handleRaiseRequest = (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedbacks();

    if (!selectedAssetId || !issueDescription.trim()) {
      setError('Please select an asset and describe the issue.');
      return;
    }

    api.post('/maintenance', {
      assetId: selectedAssetId,
      description: issueDescription.trim(),
      priority
    })
      .then(() => {
        setSuccess('Maintenance request submitted successfully for manager review.');
        setSelectedAssetId('');
        setIssueDescription('');
        setPriority('MEDIUM');
        setShowAddForm(false);
        loadTables();
      })
      .catch(() => setError('Failed to submit maintenance request.'));
  };

  const handleApproveAndAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAssignModal || !techName.trim()) return;

    const reqId = showAssignModal;

    api.patch(`/maintenance/${reqId}/approve`)
      .then(() => api.patch(`/maintenance/${reqId}/assign`, { technician: techName.trim() }))
      .then(() => {
        setSuccess('Maintenance request approved and scheduled.');
        setShowAssignModal(null);
        setTechName('');
        loadTables();
      })
      .catch(() => setError('Failed to approve maintenance request.'));
  };

  const handleStartWork = (_reqId: string) => {
    clearFeedbacks();
    setSuccess('Technician work started.');
    loadTables();
  };

  const handleResolveWork = (reqId: string) => {
    clearFeedbacks();

    api.patch(`/maintenance/${reqId}/resolve`)
      .then(() => {
        setSuccess('Maintenance task successfully resolved. Asset returned to inventory.');
        loadTables();
      })
      .catch(() => setError('Failed to resolve maintenance request.'));
  };

  const handleRejectRequest = (reqId: string) => {
    clearFeedbacks();

    api.patch(`/maintenance/${reqId}/reject`)
      .then(() => {
        setSuccess('Maintenance request rejected.');
        loadTables();
      })
      .catch(() => setError('Failed to reject maintenance request.'));
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const approvedRequests = requests.filter(r => r.status === 'APPROVED');
  const inProgressRequests = requests.filter(r => r.status === 'IN_PROGRESS');
  const resolvedRequests = requests.filter(r => r.status === 'RESOLVED');

  const employeeRequests = requests.filter(r => r.raisedById === (user ? user.id : 'emp-4'));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Maintenance Pipeline</h1>
          <p className="text-muted-foreground text-sm">
            Route damaged assets through review, schedule technicians, and track resolution states.
          </p>
        </div>

        {/* Raise request button */}
        <button
          onClick={() => { setShowAddForm(true); clearFeedbacks(); }}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus size={14} />
          <span>Raise Request</span>
        </button>
      </div>

      {/* Feedbacks */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Kanban Pipeline Dashboard (Managers / Admins only) */}
      {activeRole !== 'EMPLOYEE' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">

          {/* COLUMN 1: Pending review */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Pending Review</h3>
              <span className="px-2 py-0.5 rounded-full bg-accent/35 text-[10px] font-bold">{pendingRequests.length}</span>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {pendingRequests.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic text-center py-6">No pending requests.</p>
              ) : (
                pendingRequests.map(r => {
                  const asset = assets.find(a => a.id === r.assetId);
                  const raiser = users.find(u => u.id === r.raisedById);
                  return (
                    <div key={r.id} className="p-3.5 rounded-xl bg-accent/15 border border-border/40 space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-primary">{asset ? asset.tag : 'AF-XXXX'}</span>
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            r.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>{r.priority}</span>
                        </div>
                        <h4 className="font-semibold text-xs text-foreground line-clamp-1">{asset ? asset.name : 'Asset'}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">{r.issue}</p>
                      </div>

                      <div className="pt-2 border-t border-border/30 flex justify-between items-center text-[9px] text-muted-foreground">
                        <span>By: {raiser ? raiser.name : 'Staff'}</span>
                        <div className="flex gap-1.5">
                          <button onClick={() => handleRejectRequest(r.id)} className="text-red-400 hover:text-red-500 font-bold">Reject</button>
                          <button onClick={() => { setShowAssignModal(r.id); clearFeedbacks(); }} className="text-primary hover:text-primary-foreground hover:bg-primary px-1.5 py-0.5 rounded font-extrabold border border-primary/20">Approve</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 2: Approved & Scheduled */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <h3 className="font-bold text-xs text-primary tracking-wider uppercase">Scheduled</h3>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{approvedRequests.length}</span>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {approvedRequests.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic text-center py-6">No scheduled tasks.</p>
              ) : (
                approvedRequests.map(r => {
                  const asset = assets.find(a => a.id === r.assetId);
                  return (
                    <div key={r.id} className="p-3.5 rounded-xl bg-accent/15 border border-border/40 space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-primary">{asset ? asset.tag : 'AF-XXXX'}</span>
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">Tech: {r.technicianName}</span>
                        </div>
                        <h4 className="font-semibold text-xs text-foreground truncate">{asset ? asset.name : 'Asset'}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{r.issue}</p>
                      </div>

                      <button
                        onClick={() => handleStartWork(r.id)}
                        className="w-full py-1.5 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all"
                      >
                        <Play size={10} />
                        <span>Start Repair</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 3: In Progress */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <h3 className="font-bold text-xs text-amber-500 tracking-wider uppercase">In Progress</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold">{inProgressRequests.length}</span>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {inProgressRequests.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic text-center py-6">No work in progress.</p>
              ) : (
                inProgressRequests.map(r => {
                  const asset = assets.find(a => a.id === r.assetId);
                  return (
                    <div key={r.id} className="p-3.5 rounded-xl bg-accent/15 border border-border/40 space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-primary">{asset ? asset.tag : 'AF-XXXX'}</span>
                          <span className="text-[8px] font-bold text-amber-400 uppercase">Working</span>
                        </div>
                        <h4 className="font-semibold text-xs text-foreground truncate">{asset ? asset.name : 'Asset'}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{r.issue}</p>
                      </div>

                      <button
                        onClick={() => handleResolveWork(r.id)}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/25 transition-all"
                      >
                        <CheckCircle2 size={10} />
                        <span>Resolve Work</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 4: Resolved */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <h3 className="font-bold text-xs text-emerald-500 tracking-wider uppercase">Resolved Logs</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">{resolvedRequests.length}</span>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {resolvedRequests.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic text-center py-6">No resolved logs.</p>
              ) : (
                resolvedRequests.map(r => {
                  const asset = assets.find(a => a.id === r.assetId);
                  return (
                    <div key={r.id} className="p-3 rounded-xl bg-emerald-950/5 border border-emerald-950/20 text-emerald-400/90 text-[10px] space-y-1 relative">
                      <div className="flex justify-between">
                        <span className="font-bold">{asset ? asset.tag : 'AF-XXXX'}</span>
                        <span>Fixed</span>
                      </div>
                      <h4 className="font-semibold text-foreground line-clamp-1">{asset ? asset.name : 'Asset'}</h4>
                      <p className="text-muted-foreground line-clamp-2 mt-1">{r.issue}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Employee view: Simplified history tracker */
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wide flex items-center gap-1.5">
            <ClipboardList size={16} className="text-primary" />
            <span>Your Submitted Maintenance Requests</span>
          </h3>

          {employeeRequests.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-10 text-center">No maintenance logs registered under your account.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                    <th className="pb-3">Asset Tag</th>
                    <th className="pb-3">Issue Reported</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Assigned Tech</th>
                    <th className="pb-3 text-right">Job Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {employeeRequests.map(r => {
                    const asset = assets.find(a => a.id === r.assetId);
                    return (
                      <tr key={r.id} className="hover:bg-accent/10">
                        <td className="py-3.5 font-bold text-primary">{asset ? asset.tag : 'AF-XXXX'}</td>
                        <td className="py-3.5 text-foreground max-w-xs truncate">{r.issue}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            r.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {r.priority}
                          </span>
                        </td>
                        <td className="py-3.5 text-muted-foreground">{r.technicianName || 'Pending Review'}</td>
                        <td className="py-3.5 text-right font-bold">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            r.status === 'RESOLVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-primary/10 text-primary border border-primary/20'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- MOCK ASSIGN TECHNICIAN MODAL POPUP --- */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-in fade-in">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="font-bold text-sm text-primary tracking-wide uppercase">Approve & Assign Technician</h3>
              <button onClick={() => setShowAssignModal(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApproveAndAssign} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Assign Technician Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bob the Builder, Alice Tech"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  className="w-full bg-accent/20 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2.5 px-4 text-xs outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(null)}
                  className="px-4 py-2 rounded-xl border border-border text-muted-foreground text-xs font-bold hover:bg-accent/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold shadow-lg"
                >
                  Approve Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SUBMIT REPAIR REQUEST POPUP MODAL --- */}
      {showAddForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-in fade-in">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-white/10 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="font-bold text-sm text-primary tracking-wide uppercase">File Maintenance Ticket</h3>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRaiseRequest} className="space-y-4">

              {/* Select Asset */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Asset</label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none text-muted-foreground"
                >
                  <option value="">-- Choose Asset --</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.tag} - {a.name} ({a.status})</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none text-muted-foreground"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              {/* Issue Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Problem Description</label>
                <textarea
                  placeholder="Describe the defect, damage, broken parts or issue reported..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl border border-border text-muted-foreground text-xs font-bold hover:bg-accent/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold shadow-lg"
                >
                  Submit Ticket
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Maintenance;
