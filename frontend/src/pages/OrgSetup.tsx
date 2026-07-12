import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Building2, 
  FolderLock, 
  Users2, 
  Plus, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  headId?: string;
  parentId?: string;
  status: 'active' | 'inactive';
}

interface Category {
  id: string;
  name: string;
  customFields: string[];
  status: 'active' | 'inactive';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';
  departmentId?: string;
  status: 'active' | 'inactive';
}

export const OrgSetup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'depts' | 'categories' | 'directory'>('depts');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states - Department
  const [deptName, setDeptName] = useState('');
  const [deptHeadId, setDeptHeadId] = useState('');
  const [deptParentId, setDeptParentId] = useState('');

  // Form states - Category
  const [catName, setCatName] = useState('');
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldsList, setCustomFieldsList] = useState<string[]>([]);

  const loadTables = () => {
    api.get<Department[]>('/departments')
      .then(res => setDepartments(res.data))
      .catch(() => setError('Failed to load departments.'));

    api.get<Category[]>('/categories')
      .then(res => setCategories(res.data))
      .catch(() => setError('Failed to load categories.'));

    api.get<User[]>('/users/directory')
      .then(res => setUsers(res.data))
      .catch(() => setError('Failed to load users.'));
  };

  useEffect(() => {
    loadTables();
  }, []);

  const clearFeedbacks = () => {
    setError(null);
    setSuccess(null);
  };

  // --- TAB A: Department Logic ---
  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedbacks();

    if (!deptName.trim()) {
      setError('Department name is required.');
      return;
    }

    api.post('/departments', {
      name: deptName.trim(),
      headId: deptHeadId || undefined,
      parentId: deptParentId || undefined,
    })
      .then(() => {
        setSuccess(`Department "${deptName}" created successfully.`);
        setDeptName('');
        setDeptHeadId('');
        setDeptParentId('');
        loadTables();
      })
      .catch(() => setError('Failed to create department.'));
  };

  // --- TAB B: Category Logic ---
  const handleAddCustomField = () => {
    if (!customFieldName.trim()) return;
    if (customFieldsList.includes(customFieldName.trim())) {
      setError('Field already exists.');
      return;
    }
    setCustomFieldsList([...customFieldsList, customFieldName.trim()]);
    setCustomFieldName('');
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFieldsList(customFieldsList.filter((_, i) => i !== index));
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedbacks();

    if (!catName.trim()) {
      setError('Category name is required.');
      return;
    }

    api.post('/categories', {
      name: catName.trim(),
      customFields: customFieldsList,
    })
      .then(() => {
        setSuccess(`Category "${catName}" added.`);
        setCatName('');
        setCustomFieldsList([]);
        loadTables();
      })
      .catch(() => setError('Failed to create category.'));
  };

  // --- TAB C: Directory promotions ---
  const handlePromoteRole = (userId: string, newRole: 'DEPARTMENT_HEAD' | 'ASSET_MANAGER' | 'EMPLOYEE') => {
    clearFeedbacks();

    api.post('/users/promote', { userId, role: newRole })
      .then(() => {
        setSuccess(`Role updated successfully.`);
        loadTables();
      })
      .catch(() => setError('Failed to update role.'));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Organization Setup</h1>
        <p className="text-muted-foreground text-sm">
          Maintain departments, manage custom asset field templates, and promote employees.
        </p>
      </div>

      {/* Status Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab('depts'); clearFeedbacks(); }}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'depts' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 size={16} />
          <span>Departments</span>
        </button>
        <button
          onClick={() => { setActiveTab('categories'); clearFeedbacks(); }}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'categories' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FolderLock size={16} />
          <span>Asset Categories</span>
        </button>
        <button
          onClick={() => { setActiveTab('directory'); clearFeedbacks(); }}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'directory' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users2 size={16} />
          <span>Employee Directory</span>
        </button>
      </div>

      {/* TAB A: Department Management */}
      {activeTab === 'depts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Creation Form */}
          <div className="glass-panel p-6 rounded-2xl border border-border/80 bg-white space-y-4 h-fit">
            <h3 className="font-bold text-sm text-primary tracking-wide uppercase">New Department</h3>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sales, Marketing"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full bg-accent/25 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2.5 px-4 text-xs outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Department Head</label>
                <select
                  value={deptHeadId}
                  onChange={(e) => setDeptHeadId(e.target.value)}
                  className="w-full bg-accent/25 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2.5 px-4 text-xs outline-none transition-all text-muted-foreground"
                >
                  <option value="">-- Assign Head User --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Parent Department (Hierarchy)</label>
                <select
                  value={deptParentId}
                  onChange={(e) => setDeptParentId(e.target.value)}
                  className="w-full bg-accent/25 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2.5 px-4 text-xs outline-none transition-all text-muted-foreground"
                >
                  <option value="">-- No Parent (Root) --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 transition-all"
              >
                <Plus size={14} />
                <span>Create Department</span>
              </button>
            </form>
          </div>

          {/* Department List Grid */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-border/80 bg-white space-y-4">
            <h3 className="font-bold text-sm text-foreground tracking-wide uppercase">Active Departments</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Assigned Head</th>
                    <th className="pb-3">Parent Hierarchy</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">No departments registered.</td>
                    </tr>
                  ) : (
                    departments.map(dept => {
                      const head = users.find(u => u.id === dept.headId);
                      const parent = departments.find(d => d.id === dept.parentId);
                      return (
                        <tr key={dept.id} className="hover:bg-accent/10">
                          <td className="py-3.5 font-bold text-foreground">{dept.name}</td>
                          <td className="py-3.5 text-muted-foreground">{head ? head.name : 'Unassigned'}</td>
                          <td className="py-3.5 text-muted-foreground">{parent ? parent.name : '—'}</td>
                          <td className="py-3.5 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {dept.status}
                            </span>
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
      )}

      {/* TAB B: Asset Category Management */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Category Creation Form */}
          <div className="glass-panel p-6 rounded-2xl border border-border/80 bg-white space-y-4 h-fit">
            <h3 className="font-bold text-sm text-primary tracking-wide uppercase">New Asset Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Laptops, Vehicles, Desks"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-accent/25 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2.5 px-4 text-xs outline-none transition-all"
                />
              </div>

              {/* Dynamic Field Creation */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-semibold block">Category Custom Fields</label>
                <p className="text-[10px] text-muted-foreground leading-relaxed">Define custom columns specific to assets of this category.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Warranty, Fuel Type"
                    value={customFieldName}
                    onChange={(e) => setCustomFieldName(e.target.value)}
                    className="flex-1 bg-accent/25 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 text-xs outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="px-3 rounded-xl bg-accent hover:bg-accent/70 border border-border/80 text-xs font-black"
                  >
                    Add
                  </button>
                </div>

                {/* Display added fields */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {customFieldsList.map((field, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-primary/10 border border-primary/25 text-primary"
                    >
                      <span>{field}</span>
                      <button type="button" onClick={() => handleRemoveCustomField(idx)} className="text-red-400 hover:text-red-600">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 transition-all"
              >
                <Plus size={14} />
                <span>Save Category</span>
              </button>
            </form>
          </div>

          {/* Categories display list */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-border/80 bg-white space-y-4">
            <h3 className="font-bold text-sm text-foreground tracking-wide uppercase">Configured Templates</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                    <th className="pb-3 w-1/3">Category Name</th>
                    <th className="pb-3">Dynamic Field Template</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-accent/10">
                      <td className="py-3.5 font-bold text-foreground">{cat.name}</td>
                      <td className="py-3.5 text-muted-foreground flex flex-wrap gap-1">
                        {cat.customFields.length === 0 ? (
                          <span className="text-[10px] text-muted-foreground font-medium">Standard attributes only</span>
                        ) : (
                          cat.customFields.map((f, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-accent/20 border border-border/40 text-[9px] font-bold text-foreground">
                              {f}
                            </span>
                          ))
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {cat.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: Employee Directory */}
      {activeTab === 'directory' && (
        <div className="glass-panel p-6 rounded-2xl border border-border/80 bg-white space-y-4 animate-in fade-in duration-200">
          <h3 className="font-bold text-sm text-foreground tracking-wide uppercase">Employee Directory</h3>
          <p className="text-xs text-muted-foreground">Admin-only promotions. Directory is the sole authority to assign and modify system roles.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Active System Role</th>
                  <th className="pb-3 text-right">Promotions & Role Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-accent/10">
                    <td className="py-3.5 font-bold text-foreground">{u.name}</td>
                    <td className="py-3.5 text-muted-foreground">{u.email}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                        u.role === 'ADMIN' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : u.role === 'ASSET_MANAGER' 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : u.role === 'DEPARTMENT_HEAD'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-muted/30 text-muted-foreground border border-border/40'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {u.role !== 'ADMIN' ? (
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => handlePromoteRole(u.id, 'EMPLOYEE')}
                            className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                              u.role === 'EMPLOYEE'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-accent/15 border-border/40 hover:bg-accent/30 text-muted-foreground'
                            }`}
                          >
                            Employee
                          </button>
                          <button
                            onClick={() => handlePromoteRole(u.id, 'DEPARTMENT_HEAD')}
                            className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                              u.role === 'DEPARTMENT_HEAD'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : 'bg-accent/15 border-border/40 hover:bg-accent/30 text-muted-foreground'
                            }`}
                          >
                            Dept Head
                          </button>
                          <button
                            onClick={() => handlePromoteRole(u.id, 'ASSET_MANAGER')}
                            className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                              u.role === 'ASSET_MANAGER'
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                : 'bg-accent/15 border-border/40 hover:bg-accent/30 text-muted-foreground'
                            }`}
                          >
                            Asset Manager
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic pr-4">Super Administrator</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgSetup;
