import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import {
  ClipboardCheck,
  Plus,
  X,
  Check,
  AlertCircle,
  Lock
} from 'lucide-react';

interface Asset {
  id: string;
  tag: string;
  name: string;
  serialNumber: string;
  location: string;
  categoryId: string;
}

interface AuditCycle {
  id: string;
  name: string;
  scopeType?: string;
  scopeValue?: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CLOSED';
  auditorIds?: string[];
}

interface AuditResult {
  id: string;
  auditCycleId: string;
  assetId: string;
  auditorId: string;
  status: 'VERIFIED' | 'MISSING' | 'DAMAGED';
  notes?: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

export const Audits: React.FC = () => {
  // Database lists
  const [assets, setAssets] = useState<Asset[]>([]);
  const [cycles, setCycles] = useState<AuditCycle[]>([]);
  const [results, setResults] = useState<AuditResult[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Form states - Create Cycle
  const [cycleName, setCycleName] = useState('');
  const [_scopeDeptId, setScopeDeptId] = useState('');
  const [scopeLocation, setScopeLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignedAuditorId, setAssignedAuditorId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states - Verification Checklist View
  const [activeCycleForAudit, setActiveCycleForAudit] = useState<AuditCycle | null>(null);
  const [verificationNotes, setVerificationNotes] = useState<Record<string, string>>({});

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load all data from API
  const loadTables = useCallback(() => {
    Promise.all([
      api.get<Asset[]>('/assets'),
      api.get<AuditCycle[]>('/audits'),
      api.get<User[]>('/users/directory'),
    ])
      .then(([assetsRes, cyclesRes, usersRes]) => {
        setAssets(assetsRes.data);
        setCycles(cyclesRes.data);
        setUsers(usersRes.data);
        return cyclesRes.data;
      })
      .then((cyclesData) => {
        if (cyclesData.length > 0) {
          return Promise.all(
            cyclesData.map((c) => api.get(`/audits/${c.id}`))
          );
        }
        return [];
      })
      .then((details: any[]) => {
        if (details.length > 0) {
          const allResults = details.flatMap(
            (d) => d.data.results || []
          );
          setResults(allResults);
        } else {
          setResults([]);
        }
      })
      .catch(() => setError('Failed to load audit data.'));
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const clearFeedbacks = () => {
    setError(null);
    setSuccess(null);
  };

  // Create audit cycle
  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedbacks();

    if (!cycleName.trim() || !startDate || !endDate || !assignedAuditorId) {
      setError('Please fill in Name, Dates, and assign an Auditor.');
      return;
    }

    const body: Record<string, any> = {
      name: cycleName.trim(),
      startDate,
      endDate,
      auditorIds: [assignedAuditorId],
    };

    if (scopeLocation.trim()) {
      body.scopeType = 'location';
      body.scopeValue = scopeLocation.trim();
    }

    api.post('/audits', body)
      .then(() => {
        setSuccess(`Audit Cycle "${cycleName}" created successfully.`);
        setCycleName('');
        setScopeDeptId('');
        setScopeLocation('');
        setStartDate('');
        setEndDate('');
        setAssignedAuditorId('');
        setShowAddForm(false);
        loadTables();
      })
      .catch(() => setError('Failed to create audit cycle.'));
  };

  // Run asset verification checkpoint
  const handleMarkVerification = (assetId: string, status: 'VERIFIED' | 'MISSING' | 'DAMAGED') => {
    if (!activeCycleForAudit) return;
    clearFeedbacks();

    const noteText = verificationNotes[assetId] || '';

    api.post(`/audits/${activeCycleForAudit.id}/results`, {
      assetId,
      status,
      notes: noteText || undefined,
    })
      .then(() => {
        loadTables();
      })
      .catch(() => setError('Failed to record verification.'));
  };

  const handleNotesChange = (assetId: string, text: string) => {
    setVerificationNotes({
      ...verificationNotes,
      [assetId]: text,
    });
  };

  // Close Cycle Logic (locks audit, backend handles Missing→LOST)
  const handleCloseCycle = (cycleId: string) => {
    clearFeedbacks();

    api.patch(`/audits/${cycleId}/close`)
      .then(() => {
        setSuccess('Audit cycle closed and locked. Confirmed-missing assets updated to LOST globally.');
        setActiveCycleForAudit(null);
        loadTables();
      })
      .catch(() => setError('Failed to close audit cycle.'));
  };

  // Filter assets matching the active audit scope
  const getScopeAssets = (cycle: AuditCycle) => {
    return assets.filter((asset) => {
      if (cycle.scopeType === 'location' && cycle.scopeValue) {
        return asset.location
          .toLowerCase()
          .includes(cycle.scopeValue.toLowerCase());
      }
      if (cycle.scopeType === 'department' && cycle.scopeValue) {
        return asset.categoryId === cycle.scopeValue;
      }
      return true;
    });
  };

  const activeAuditAssets = activeCycleForAudit
    ? getScopeAssets(activeCycleForAudit)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Asset Auditing</h1>
          <p className="text-muted-foreground text-sm">
            Launch audit cycles, verify physical inventory, and compile discrepancy reports.
          </p>
        </div>

        {/* Create Cycle button */}
        <button
          onClick={() => { setShowAddForm(true); clearFeedbacks(); }}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus size={14} />
          <span>New Audit Cycle</span>
        </button>
      </div>

      {/* Feedbacks */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Conditionally Render Auditor Checklist console */}
      {activeCycleForAudit ? (
        <div className="glass-panel p-6 rounded-2xl border border-border/80 bg-white space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center pb-3 border-b border-border/40">
            <div>
              <h3 className="font-extrabold text-sm text-primary uppercase tracking-wide">
                Auditor Checklist Console
              </h3>
              <p className="text-[10px] text-muted-foreground">Cycle: {activeCycleForAudit.name} | Scoped Assets: {activeAuditAssets.length}</p>
            </div>
            <button
              onClick={() => setActiveCycleForAudit(null)}
              className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-bold hover:bg-accent/20"
            >
              Exit Checklist
            </button>
          </div>

          {/* Checklist table */}
          <div className="space-y-4">
            {activeAuditAssets.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">No assets scoped to this audit cycle's department or location.</p>
            ) : (
              <div className="divide-y divide-border/20">
                {activeAuditAssets.map((asset) => {
                  const res = results.find(
                    (r) =>
                      r.auditCycleId === activeCycleForAudit.id &&
                      r.assetId === asset.id
                  );

                  return (
                    <div key={asset.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Asset identifier info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">{asset.tag}</span>
                          <h4 className="font-bold text-xs">{asset.name}</h4>
                        </div>
                        <p className="text-[9px] text-muted-foreground">Location: {asset.location} | Serial: {asset.serialNumber}</p>

                        {/* Note Input */}
                        <input
                          type="text"
                          placeholder="Add note for verification details..."
                          value={verificationNotes[asset.id] || (res ? res.notes : '') || ''}
                          onChange={(e) => handleNotesChange(asset.id, e.target.value)}
                          className="w-full max-w-xs mt-2 bg-accent/20 border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg py-1.5 px-3 text-[10px] outline-none transition-all"
                        />
                      </div>

                      {/* Verification Status toggles */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleMarkVerification(asset.id, 'VERIFIED')}
                          className={`px-3 py-2 rounded-lg border text-[10px] font-bold transition-all ${
                            res?.status === 'VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-accent/15 border-border/40 hover:bg-accent/30 text-muted-foreground'
                          }`}
                        >
                          Verified
                        </button>
                        <button
                          onClick={() => handleMarkVerification(asset.id, 'DAMAGED')}
                          className={`px-3 py-2 rounded-lg border text-[10px] font-bold transition-all ${
                            res?.status === 'DAMAGED'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-accent/15 border-border/40 hover:bg-accent/30 text-muted-foreground'
                          }`}
                        >
                          Damaged
                        </button>
                        <button
                          onClick={() => handleMarkVerification(asset.id, 'MISSING')}
                          className={`px-3 py-2 rounded-lg border text-[10px] font-bold transition-all ${
                            res?.status === 'MISSING'
                              ? 'bg-red-500/20 text-red-400 border-red-500/40'
                              : 'bg-accent/15 border-border/40 hover:bg-accent/30 text-muted-foreground'
                          }`}
                        >
                          Missing
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Close Cycle block */}
          <div className="pt-5 border-t border-border flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              ⚠️ Closing and locking this cycle updates all flagged <strong>Missing</strong> items to <strong>LOST</strong> globally.
            </div>
            <button
              onClick={() => handleCloseCycle(activeCycleForAudit.id)}
              className="px-5 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-destructive/25"
            >
              <Lock size={12} />
              <span>Close & Lock Cycle</span>
            </button>
          </div>
        </div>
      ) : (
        /* Normal Layout: Lists of active/closed audit cycles */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">

          {/* Left/Middle: Cycle Tracker */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-border/80 bg-white space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">Audit Runs</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                    <th className="pb-3">Cycle Name</th>
                    <th className="pb-3">Scope Location</th>
                    <th className="pb-3">Date Range</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Auditor Checklist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {cycles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">No active audit cycles registered.</td>
                    </tr>
                  ) : (
                    cycles.map((c) => (
                      <tr key={c.id} className="hover:bg-accent/10">
                        <td className="py-3.5 font-bold text-foreground">{c.name}</td>
                        <td className="py-3.5 text-muted-foreground">
                          {c.scopeType === 'location' && c.scopeValue
                            ? c.scopeValue
                            : 'All Locations'}
                        </td>
                        <td className="py-3.5 text-muted-foreground">
                          {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 font-bold">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase ${
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse'
                              : 'bg-muted/40 text-muted-foreground border border-border/40'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-bold">
                          {c.status === 'ACTIVE' ? (
                            <button
                              onClick={() => { setActiveCycleForAudit(c); clearFeedbacks(); }}
                              className="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] flex items-center justify-center gap-1 ml-auto shadow-md"
                            >
                              <ClipboardCheck size={12} />
                              <span>Verify Assets</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic pr-4">Locked</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side: Visual discrepancy statistics report */}
          <div className="glass-panel p-6 rounded-2xl border border-border/80 bg-white space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">Discrepancy Engine</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">Summary of missing or damaged physical inventory flagged during audit checks:</p>

            <div className="space-y-3">
              {results.filter((r) => r.status !== 'VERIFIED').length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  No discrepancy flags registered yet.
                </div>
              ) : (
                results.filter((r) => r.status !== 'VERIFIED').map((r) => {
                  const asset = assets.find((a) => a.id === r.assetId);
                  return (
                    <div key={r.id} className="p-3.5 rounded-xl bg-accent/15 border border-border/40 flex justify-between items-center hover:border-primary/20 transition-all text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            r.status === 'MISSING' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {r.status}
                          </span>
                          <h4 className="font-semibold">{asset ? asset.name : 'Asset'}</h4>
                        </div>
                        {r.notes && <p className="text-[9px] text-muted-foreground mt-1">Note: {r.notes}</p>}
                      </div>
                      <span className="text-[9px] font-black text-primary">{asset ? asset.tag : 'AF-XXXX'}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* --- CREATE AUDIT CYCLE POPUP MODAL --- */}
      {showAddForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-in fade-in">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-border/80 bg-white shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="font-bold text-sm text-primary tracking-wide uppercase">New Audit Cycle</h3>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="space-y-4">
              {/* Cycle Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Cycle Name</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Electronics Audit"
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none transition-all"
                />
              </div>

              {/* Scope Location */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Scope Location</label>
                <input
                  type="text"
                  placeholder="e.g. Room 302, Office B"
                  value={scopeLocation}
                  onChange={(e) => setScopeLocation(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none transition-all"
                />
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none text-muted-foreground"
                />
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none text-muted-foreground"
                />
              </div>

              {/* Assign Auditor */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Assign Auditor</label>
                <select
                  value={assignedAuditorId}
                  onChange={(e) => setAssignedAuditorId(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none text-muted-foreground text-left"
                >
                  <option value="">-- Choose Staff Auditor --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>

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
                  Confirm Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Audits;
