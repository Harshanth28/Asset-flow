import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import { 
  getDbTable, 
  saveDbTable, 
  type MockAsset, 
  type MockAllocation, 
  type MockTransfer, 
  type MockUser,
  type MockDepartment 
} from '../utils/mockDb';
import { 
  ArrowLeftRight, 
  Check, 
  X, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const Allocations: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Database lists
  const [assets, setAssets] = useState<MockAsset[]>([]);
  const [allocations, setAllocations] = useState<MockAllocation[]>([]);
  const [transfers, setTransfers] = useState<MockTransfer[]>([]);
  const [users, setUsers] = useState<MockUser[]>([]);
  const [departments, setDepartments] = useState<MockDepartment[]>([]);

  // Form states
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetDeptId, setTargetDeptId] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [assigneeType, setAssigneeType] = useState<'employee' | 'department'>('employee');

  // Conflict state
  const [conflictDetail, setConflictDetail] = useState<{
    holderName: string;
    expectedReturn: string;
    assetId: string;
    allocId: string;
  } | null>(null);

  // Return asset modal state
  const [showReturnModal, setShowReturnModal] = useState<string | null>(null); // allocId
  const [returnCondition, setReturnCondition] = useState<'Excellent' | 'Good' | 'Fair' | 'Poor'>('Excellent');
  const [returnNotes, setReturnNotes] = useState('');

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load lists
  const loadTables = () => {
    setAssets(getDbTable<MockAsset>('af_assets'));
    setAllocations(getDbTable<MockAllocation>('af_allocations'));
    setTransfers(getDbTable<MockTransfer>('af_transfers'));
    setUsers(getDbTable<MockUser>('af_users'));
    setDepartments(getDbTable<MockDepartment>('af_departments'));
  };

  useEffect(() => {
    loadTables();
  }, []);

  const clearFeedbacks = () => {
    setError(null);
    setSuccess(null);
    setConflictDetail(null);
  };

  // Submit allocation request
  const handleAllocate = (e: React.FormEvent) => {
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

    // 1. Conflict Check: Is the asset already held?
    const targetAsset = assets.find(a => a.id === selectedAssetId);
    if (!targetAsset) return;

    if (targetAsset.status === 'ALLOCATED') {
      // Find the active allocation
      const activeAlloc = allocations.find(a => a.assetId === selectedAssetId && a.status === 'ACTIVE');
      if (activeAlloc) {
        const holder = users.find(u => u.id === activeAlloc.userId);
        const holderDept = departments.find(d => d.id === activeAlloc.departmentId);
        
        setConflictDetail({
          holderName: holder ? holder.name : (holderDept ? holderDept.name : 'Unknown Holder'),
          expectedReturn: activeAlloc.expectedReturnDate || 'No return date specified',
          assetId: selectedAssetId,
          allocId: activeAlloc.id
        });
        setError('CONFLICT: This asset is currently checked out by another employee.');
        return;
      }
    }

    if (targetAsset.status === 'UNDER_MAINTENANCE' || targetAsset.status === 'LOST') {
      setError(`Cannot allocate: This asset is currently marked as ${targetAsset.status.replace('_', ' ')}.`);
      return;
    }

    // 2. Process allocation
    const newAlloc: MockAllocation = {
      id: `alloc-${Date.now().toString().slice(-4)}`,
      assetId: selectedAssetId,
      userId: assigneeType === 'employee' ? targetUserId : undefined,
      departmentId: assigneeType === 'department' ? targetDeptId : undefined,
      expectedReturnDate: expectedReturn || undefined,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    // Update asset status to ALLOCATED
    const updatedAssets = assets.map(a => {
      if (a.id === selectedAssetId) {
        return { ...a, status: 'ALLOCATED' as const };
      }
      return a;
    });

    saveDbTable('af_allocations', [...allocations, newAlloc]);
    saveDbTable('af_assets', updatedAssets);

    // Log action
    const logs = getDbTable<any>('af_logs');
    logs.unshift({
      id: `log-${Date.now()}`,
      action: 'ALLOCATE',
      details: `Allocated asset ${targetAsset.tag} (${targetAsset.name}) to ${assigneeType === 'employee' ? 'Employee' : 'Department'}.`,
      createdAt: new Date().toISOString()
    });
    saveDbTable('af_logs', logs);

    setSuccess(`Asset ${targetAsset.tag} allocated successfully.`);
    setSelectedAssetId('');
    setTargetUserId('');
    setTargetDeptId('');
    setExpectedReturn('');
    loadTables();
  };

  // Initiate Transfer Request from conflict window
  const handleInitiateTransfer = (assetId: string, allocId: string) => {
    clearFeedbacks();
    
    // Find current active user
    const requesterId = user ? user.id : 'seed-employee';

    const newTransfer: MockTransfer = {
      id: `trans-${Date.now().toString().slice(-4)}`,
      allocationId: allocId,
      targetUserId: assigneeType === 'employee' ? targetUserId : undefined,
      targetDeptId: assigneeType === 'department' ? targetDeptId : undefined,
      status: 'PENDING',
      requestedById: requesterId,
      createdAt: new Date().toISOString()
    };

    saveDbTable('af_transfers', [...transfers, newTransfer]);

    // Send visual notification
    const notifications = getDbTable<any>('af_notifications');
    notifications.unshift({
      id: `notify-${Date.now()}`,
      userId: 'emp-2', // Send notification alert to Asset Manager (Sarah)
      title: '🔄 Transfer Request Raised',
      message: `A transfer request has been initiated for asset ${assets.find(a => a.id === assetId)?.tag}`,
      type: 'TRANSFER_REQUEST',
      isRead: false,
      createdAt: new Date().toISOString()
    });
    saveDbTable('af_notifications', notifications);

    setSuccess('Transfer request has been submitted to the Asset Manager for review.');
    setConflictDetail(null);
    setSelectedAssetId('');
    setTargetUserId('');
    setTargetDeptId('');
    setExpectedReturn('');
    loadTables();
  };

  // Approve Transfer Logic
  const handleApproveTransfer = (transferId: string) => {
    clearFeedbacks();
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return;

    // 1. Find the old allocation
    const oldAlloc = allocations.find(a => a.id === transfer.allocationId);
    if (!oldAlloc) return;

    const asset = assets.find(a => a.id === oldAlloc.assetId);
    if (!asset) return;

    // 2. Mark old allocation as TRANSFERRED
    const updatedAllocations = allocations.map(a => {
      if (a.id === oldAlloc.id) {
        return { ...a, status: 'TRANSFERRED', actualReturnDate: new Date().toISOString().split('T')[0] };
      }
      return a;
    });

    // 3. Create new active allocation
    const newAlloc: MockAllocation = {
      id: `alloc-tr-${Date.now().toString().slice(-4)}`,
      assetId: oldAlloc.assetId,
      userId: transfer.targetUserId || undefined,
      departmentId: transfer.targetDeptId || undefined,
      expectedReturnDate: oldAlloc.expectedReturnDate,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    // 4. Update transfer request status
    const updatedTransfers = transfers.map(t => {
      if (t.id === transferId) {
        return { ...t, status: 'APPROVED' };
      }
      return t;
    });

    saveDbTable('af_allocations', [...updatedAllocations, newAlloc]);
    saveDbTable('af_transfers', updatedTransfers);

    // Save activity logs
    const logs = getDbTable<any>('af_logs');
    logs.unshift({
      id: `log-${Date.now()}`,
      action: 'TRANSFER_APPROVE',
      details: `Approved transfer of asset ${asset.tag} (${asset.name}) to target holder.`,
      createdAt: new Date().toISOString()
    });
    saveDbTable('af_logs', logs);

    setSuccess('Transfer request approved. Asset has been re-allocated.');
    loadTables();
  };

  // Reject Transfer Logic
  const handleRejectTransfer = (transferId: string) => {
    clearFeedbacks();
    const updatedTransfers = transfers.map(t => {
      if (t.id === transferId) {
        return { ...t, status: 'REJECTED' };
      }
      return t;
    });
    saveDbTable('af_transfers', updatedTransfers);
    setSuccess('Transfer request rejected.');
    loadTables();
  };

  // Return Asset Submission
  const handleReturnAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReturnModal) return;

    const allocId = showReturnModal;
    const activeAlloc = allocations.find(a => a.id === allocId);
    if (!activeAlloc) return;

    const asset = assets.find(a => a.id === activeAlloc.assetId);
    if (!asset) return;

    // 1. Update Allocation
    const updatedAllocations = allocations.map(a => {
      if (a.id === allocId) {
        return { 
          ...a, 
          status: 'RETURNED', 
          actualReturnDate: new Date().toISOString().split('T')[0],
          conditionOnReturn: returnCondition
        };
      }
      return a;
    });

    // 2. Revert Asset back to AVAILABLE and update condition
    const updatedAssets = assets.map(a => {
      if (a.id === activeAlloc.assetId) {
        return { ...a, status: 'AVAILABLE' as const, condition: returnCondition };
      }
      return a;
    });

    saveDbTable('af_allocations', updatedAllocations);
    saveDbTable('af_assets', updatedAssets);

    // Log Action
    const logs = getDbTable<any>('af_logs');
    logs.unshift({
      id: `log-${Date.now()}`,
      action: 'RETURN',
      details: `Asset ${asset.tag} returned in ${returnCondition} condition. Notes: ${returnNotes}`,
      createdAt: new Date().toISOString()
    });
    saveDbTable('af_logs', logs);

    setSuccess(`Asset ${asset.tag} returned successfully and is now AVAILABLE.`);
    setShowReturnModal(null);
    setReturnCondition('Excellent');
    setReturnNotes('');
    loadTables();
  };

  // Filters active allocations for directory
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
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 h-fit">
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
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
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
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
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
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-white/10 space-y-4">
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
