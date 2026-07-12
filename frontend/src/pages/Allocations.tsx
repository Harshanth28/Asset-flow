import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import api from '../utils/api';
import { 
  ArrowLeftRight, 
  Check, 
  X, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface ApiAsset {
  id: string;
  tag: string;
  name: string;
  status: string;
  condition: string;
}

interface ApiAllocation {
  id: string;
  assetId: string;
  userId?: string;
  departmentId?: string;
  expectedReturnDate?: string;
  status: string;
  actualReturnDate?: string;
  conditionOnReturn?: string;
  createdAt: string;
}

interface ApiTransfer {
  id: string;
  allocationId: string;
  targetUserId?: string;
  targetDeptId?: string;
  status: string;
  requestedById: string;
  createdAt: string;
}

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ApiDepartment {
  id: string;
  name: string;
}

export const Allocations: React.FC = () => {
  useAppSelector((state) => state.auth);

  const [assets, setAssets] = useState<ApiAsset[]>([]);
  const [allocations, setAllocations] = useState<ApiAllocation[]>([]);
  const [transfers, setTransfers] = useState<ApiTransfer[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetDeptId, setTargetDeptId] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [assigneeType, setAssigneeType] = useState<'employee' | 'department'>('employee');

  const [conflictDetail, setConflictDetail] = useState<{
    holderName: string;
    expectedReturn: string;
    assetId: string;
    allocId: string;
  } | null>(null);

  const [showReturnModal, setShowReturnModal] = useState<string | null>(null);
  const [returnCondition, setReturnCondition] = useState<'Excellent' | 'Good' | 'Fair' | 'Poor'>('Excellent');
  const [returnNotes, setReturnNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTables = async () => {
    try {
      const [assetsRes, allocationsRes, transfersRes, usersRes, departmentsRes] = await Promise.all([
        api.get<ApiAsset[]>('/assets'),
        api.get<ApiAllocation[]>('/allocations'),
        api.get<ApiTransfer[]>('/allocations/transfers'),
        api.get<ApiUser[]>('/users/directory'),
        api.get<ApiDepartment[]>('/departments'),
      ]);
      setAssets(assetsRes.data);
      setAllocations(allocationsRes.data);
      setTransfers(transfersRes.data);
      setUsers(usersRes.data);
      setDepartments(departmentsRes.data);
    } catch {
      setError('Failed to load data. Please try again.');
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const clearFeedbacks = () => {
    setError(null);
    setSuccess(null);
    setConflictDetail(null);
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedbacks();

    if (!selectedAssetId) {
      setError('Please select an asset.');
      return;
    }

    if (assigneeType === 'employee' && !targetUserId) {
      setError('Please select an employee.');
      return;
    }

    if (assigneeType === 'department' && !targetDeptId) {
      setError('Please select a department.');
      return;
    }

    const payload: Record<string, any> = { assetId: selectedAssetId };
    if (assigneeType === 'employee') {
      payload.employeeId = targetUserId;
    } else {
      payload.departmentId = targetDeptId;
    }
    if (expectedReturn) {
      payload.expectedReturnDate = expectedReturn;
    }

    try {
      await api.post('/allocations', payload);
      const targetAsset = assets.find(a => a.id === selectedAssetId);
      setSuccess(`Asset ${targetAsset?.tag ?? ''} allocated successfully.`);
      setSelectedAssetId('');
      setTargetUserId('');
      setTargetDeptId('');
      setExpectedReturn('');
      await loadTables();
    } catch (err: any) {
      if (err.response?.status === 409) {
        const data = err.response.data;
        const activeAlloc = allocations.find(a => a.assetId === selectedAssetId && a.status === 'ACTIVE');
        setConflictDetail({
          holderName: data.heldBy ?? data.heldByDept ?? 'Unknown Holder',
          expectedReturn: activeAlloc?.expectedReturnDate || 'No return date specified',
          assetId: selectedAssetId,
          allocId: activeAlloc?.id ?? '',
        });
        setError('CONFLICT: This asset is currently checked out by another employee.');
      } else {
        setError(err.response?.data?.message || 'Failed to allocate asset. Please try again.');
      }
    }
  };

  const handleInitiateTransfer = async (_assetId: string, allocId: string) => {
    clearFeedbacks();

    const payload: Record<string, any> = { allocationId: allocId };
    if (assigneeType === 'employee' && targetUserId) {
      payload.toEmployeeId = targetUserId;
    }

    try {
      await api.post('/allocations/transfers/request', payload);
      setSuccess('Transfer request has been submitted to the Asset Manager for review.');
      setConflictDetail(null);
      setSelectedAssetId('');
      setTargetUserId('');
      setTargetDeptId('');
      setExpectedReturn('');
      await loadTables();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request transfer.');
    }
  };

  const handleApproveTransfer = async (transferId: string) => {
    clearFeedbacks();
    try {
      await api.patch(`/allocations/transfers/${transferId}/approve`);
      setSuccess('Transfer request approved. Asset has been re-allocated.');
      await loadTables();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve transfer.');
    }
  };

  const handleRejectTransfer = async (transferId: string) => {
    clearFeedbacks();
    try {
      await api.patch(`/allocations/transfers/${transferId}/reject`);
      setSuccess('Transfer request rejected.');
      await loadTables();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject transfer.');
    }
  };

  const handleReturnAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReturnModal) return;

    try {
      await api.patch(`/allocations/${showReturnModal}/return`, {
        checkInNotes: returnNotes,
      });

      const activeAlloc = allocations.find(a => a.id === showReturnModal);
      const asset = assets.find(a => a.id === activeAlloc?.assetId);
      setSuccess(`Asset ${asset?.tag ?? ''} returned successfully and is now AVAILABLE.`);
      setShowReturnModal(null);
      setReturnCondition('Excellent');
      setReturnNotes('');
      await loadTables();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to return asset.');
    }
  };

  const activeAllocationsList = allocations.filter(a => a.status === 'ACTIVE');
  const pendingTransfersList = transfers.filter(t => t.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Allocations & Transfers</h1>
        <p className="text-muted-foreground text-sm">
          Allocate physical inventory to employees, handle conflicts, and manage item transfer approvals.
        </p>
      </div>

      {/* Feedbacks */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <div className="flex-1">
            <span>{error}</span>
            {conflictDetail && (
              <div className="mt-2 p-3 bg-card border border-destructive/30 rounded-xl space-y-2 text-foreground">
                <p className="text-[11px] font-bold text-muted-foreground">Currently Held By:</p>
                <p className="text-xs font-semibold text-primary">{conflictDetail.holderName}</p>
                <p className="text-[10px] text-muted-foreground">Expected return date: {new Date(conflictDetail.expectedReturn).toLocaleDateString()}</p>
                <button
                  type="button"
                  onClick={() => handleInitiateTransfer(conflictDetail.assetId, conflictDetail.allocId)}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-[10px] flex items-center gap-1 transition-all"
                >
                  <ArrowLeftRight size={10} />
                  <span>Request Transfer Instead</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Create Allocation Form (Managers / Admins only) */}
        <div className="glass-panel p-6 rounded-2xl border border-border/80 bg-white space-y-4 h-fit">
          <h3 className="font-bold text-sm text-primary tracking-wide uppercase">New Asset Allocation</h3>
          
          <form onSubmit={handleAllocate} className="space-y-4">
            {/* Select Asset */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Asset</label>
              <select
                value={selectedAssetId}
                onChange={(e) => { setSelectedAssetId(e.target.value); clearFeedbacks(); }}
                className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none text-muted-foreground"
              >
                <option value="">-- Choose Asset --</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.tag} - {a.name} ({a.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Type Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase block">Allocate to:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setAssigneeType('employee'); clearFeedbacks(); }}
                  className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                    assigneeType === 'employee' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-accent/15 border-border/40 text-muted-foreground'
                  }`}
                >
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => { setAssigneeType('department'); clearFeedbacks(); }}
                  className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                    assigneeType === 'department' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-accent/15 border-border/40 text-muted-foreground'
                  }`}
                >
                  Department
                </button>
              </div>
            </div>

            {/* Target Select */}
            {assigneeType === 'employee' ? (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Employee</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none text-muted-foreground"
                >
                  <option value="">-- Choose Employee --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Department</label>
                <select
                  value={targetDeptId}
                  onChange={(e) => setTargetDeptId(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none text-muted-foreground"
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Expected Return Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Expected Return Date (Optional)</label>
              <input
                type="date"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none text-muted-foreground"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 transition-all"
            >
              <CheckCircle2 size={14} />
              <span>Checkout Allocation</span>
            </button>
          </form>
        </div>

        {/* Right Side: Active Allocations & Pending Transfers list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Pending Transfers */}
          {pendingTransfersList.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-border/80 bg-white space-y-4">
              <h3 className="font-extrabold text-sm text-amber-400 tracking-wide uppercase flex items-center gap-2">
                <ArrowLeftRight size={16} />
                <span>Pending Transfer Requests ({pendingTransfersList.length})</span>
              </h3>

              <div className="space-y-3">
                {pendingTransfersList.map((trans) => {
                  const alloc = allocations.find(a => a.id === trans.allocationId);
                  const asset = assets.find(a => a.id === alloc?.assetId);
                  const requester = users.find(u => u.id === trans.requestedById);
                  const targetUser = users.find(u => u.id === trans.targetUserId);
                  const targetDept = departments.find(d => d.id === trans.targetDeptId);

                  return (
                    <div key={trans.id} className="p-4 rounded-xl bg-amber-950/10 border border-amber-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-foreground">
                          Transfer Request: <span className="text-primary font-bold">{asset ? asset.tag : 'AF-XXXX'}</span>
                        </p>
                        <p className="text-muted-foreground text-[10px]">
                          Requested by: {requester ? requester.name : 'Unknown'}
                        </p>
                        <div className="flex items-center gap-1.5 font-bold pt-1">
                          <span className="text-muted-foreground font-normal">Target:</span>
                          <span className="text-primary">{targetUser ? targetUser.name : (targetDept ? targetDept.name : 'Unknown')}</span>
                        </div>
                      </div>

                      {/* Action buttons (Approve/Reject) */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRejectTransfer(trans.id)}
                          className="px-3 py-1.5 rounded-lg border border-red-900/40 bg-red-950/20 text-red-400 font-bold text-[10px] flex items-center gap-1 hover:bg-red-950/45 transition-all"
                        >
                          <X size={10} />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleApproveTransfer(trans.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-lg shadow-emerald-500/25 transition-all"
                        >
                          <Check size={10} />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Active Allocations */}
          <div className="glass-panel p-6 rounded-2xl border border-border/80 bg-white space-y-4">
            <h3 className="font-bold text-sm text-foreground tracking-wide uppercase">Active Checked-out Inventory</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                    <th className="pb-3">Tag</th>
                    <th className="pb-3">Asset</th>
                    <th className="pb-3">Allocated To</th>
                    <th className="pb-3">Expected Return</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {activeAllocationsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">No active checkouts logged.</td>
                    </tr>
                  ) : (
                    activeAllocationsList.map((alloc) => {
                      const asset = assets.find(a => a.id === alloc.assetId);
                      const targetUser = users.find(u => u.id === alloc.userId);
                      const targetDept = departments.find(d => d.id === alloc.departmentId);

                      return (
                        <tr key={alloc.id} className="hover:bg-accent/10">
                          <td className="py-3 font-bold text-primary">{asset ? asset.tag : 'AF-XXXX'}</td>
                          <td className="py-3 font-semibold">{asset ? asset.name : 'Asset'}</td>
                          <td className="py-3 text-muted-foreground">
                            {targetUser ? targetUser.name : (targetDept ? targetDept.name : '—')}
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toLocaleDateString() : 'No Limit'}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => { setShowReturnModal(alloc.id); clearFeedbacks(); }}
                              className="px-2.5 py-1.5 rounded-lg border border-border/80 hover:bg-accent text-foreground hover:text-primary hover:border-primary/50 text-[10px] font-extrabold transition-all"
                            >
                              Return Asset
                            </button>
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
      </div>

      {/* --- RETURN ASSET CHECK-IN MODAL --- */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-in fade-in">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-border/80 bg-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="font-bold text-sm text-primary tracking-wide uppercase">Asset Return Check-in</h3>
              <button onClick={() => setShowReturnModal(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReturnAsset} className="space-y-4">
              {/* Return Condition */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Condition Check-in</label>
                <select
                  value={returnCondition}
                  onChange={(e: any) => setReturnCondition(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none text-muted-foreground"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Condition check-in notes</label>
                <textarea
                  placeholder="Describe condition details, scratches, defects or reports..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(null)}
                  className="px-4 py-2 rounded-xl border border-border text-muted-foreground text-xs font-bold hover:bg-accent/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold shadow-lg"
                >
                  Complete Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Allocations;
