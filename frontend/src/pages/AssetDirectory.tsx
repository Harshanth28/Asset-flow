import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store';
import api from '../utils/api';
import { 
  Plus, 
  Search, 
  QrCode, 
  Clock, 
  Wrench, 
  X, 
  Check, 
  AlertCircle,
  ScanLine
} from 'lucide-react';

interface Asset {
  id: string;
  tag: string;
  name: string;
  categoryId: string;
  serialNumber: string;
  acquisitionDate: string;
  acquisitionCost: number;
  condition: string;
  location: string;
  isBookable: boolean;
  status: string;
  meta?: Record<string, string>;
}

interface Category {
  id: string;
  name: string;
  customFields: string[];
  status: string;
}

interface Allocation {
  id: string;
  assetId: string;
  userId?: string;
  departmentId?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  conditionOnReturn?: string;
  status: string;
  createdAt: string;
}

interface Maintenance {
  id: string;
  assetId: string;
  issue: string;
  priority: string;
  status: string;
  technicianName?: string;
  raisedById: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId?: string;
  status: string;
}

export const AssetDirectory: React.FC = () => {
  const { activeRole } = useAppSelector((state) => state.auth);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanTagInput, setScanTagInput] = useState('');

  const [name, setName] = useState('');
  const [catId, setCatId] = useState('');
  const [serial, setSerial] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [condition, setCondition] = useState('NEW');
  const [location, setLocation] = useState('');
  const [isBookable, setIsBookable] = useState(false);
  const [metaFields, setMetaFields] = useState<Record<string, string>>({});

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTables = () => {
    api.get<Asset[]>('/assets').then(res => setAssets(res.data)).catch(() => {});
    api.get<Category[]>('/categories').then(res => setCategories(res.data)).catch(() => {});
    api.get<Allocation[]>('/allocations').then(res => setAllocations(res.data)).catch(() => {});
    api.get<Maintenance[]>('/maintenance').then(res => setMaintenance(res.data)).catch(() => {});
    api.get<User[]>('/users/directory').then(res => setUsers(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadTables();
  }, []);

  const clearFeedbacks = () => {
    setError(null);
    setSuccess(null);
  };

  const activeCategory = categories.find(c => c.id === catId);

  const handleMetaFieldChange = (key: string, value: string) => {
    setMetaFields({
      ...metaFields,
      [key]: value,
    });
  };

  const handleRegisterAsset = (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedbacks();

    if (!name.trim() || !catId || !serial.trim() || !acquisitionDate || !acquisitionCost || !location.trim()) {
      setError('Please fill in all mandatory asset attributes.');
      return;
    }

    api.post('/assets', {
      name: name.trim(),
      serialNumber: serial.trim(),
      acquisitionDate,
      acquisitionCost: parseFloat(acquisitionCost),
      condition,
      location: location.trim(),
      isBookable,
      categoryId: catId,
      meta: metaFields,
    }).then(() => {
      setSuccess('Asset successfully registered.');
      setName('');
      setCatId('');
      setSerial('');
      setAcquisitionDate('');
      setAcquisitionCost('');
      setCondition('NEW');
      setLocation('');
      setIsBookable(false);
      setMetaFields({});
      setShowAddForm(false);
      loadTables();
    }).catch(err => {
      setError(err.response?.data?.message || 'Failed to register asset.');
    });
  };

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedbacks();
    
    const matchedAsset = assets.find(
      a => a.tag.toLowerCase() === scanTagInput.trim().toLowerCase() ||
           a.serialNumber.toLowerCase() === scanTagInput.trim().toLowerCase()
    );

    if (matchedAsset) {
      setSelectedAsset(matchedAsset);
      setShowScanner(false);
      setScanTagInput('');
    } else {
      setError(`No registered asset found matching scanner tag/serial: "${scanTagInput}"`);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory ? asset.categoryId === selectedCategory : true;
    const matchesStatus = selectedStatus ? asset.status === selectedStatus : true;
    const matchesLocation = selectedLocation ? asset.location.toLowerCase().includes(selectedLocation.toLowerCase()) : true;

    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  const selectedAssetAllocations = allocations
    .filter(a => a.assetId === selectedAsset?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selectedAssetMaintenance = maintenance
    .filter(m => m.assetId === selectedAsset?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Asset Directory</h1>
          <p className="text-muted-foreground text-sm">
            Search physical assets, inspect lifecycle history, and generate barcodes.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => { setShowScanner(true); clearFeedbacks(); }}
            className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-accent/25 border border-border/80 text-foreground text-xs font-bold flex items-center justify-center gap-2 hover:bg-accent/40 transition-all"
          >
            <ScanLine size={14} className="text-primary animate-pulse" />
            <span>Scan QR Code</span>
          </button>

          {(activeRole === 'ADMIN' || activeRole === 'ASSET_MANAGER') && (
            <button
              onClick={() => { setShowAddForm(true); clearFeedbacks(); }}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 transition-all"
            >
              <Plus size={14} />
              <span>Register Asset</span>
            </button>
          )}
        </div>
      </div>

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

      <div className="glass-panel p-4 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Tag, Name, Serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-accent/15 border border-border/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/25 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none transition-all"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-accent/15 border border-border/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/25 rounded-xl py-2.5 px-4 text-xs outline-none transition-all text-muted-foreground"
        >
          <option value="">-- All Categories --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-accent/15 border border-border/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/25 rounded-xl py-2.5 px-4 text-xs outline-none transition-all text-muted-foreground"
        >
          <option value="">-- All Statuses --</option>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="ALLOCATED">ALLOCATED</option>
          <option value="RESERVED">RESERVED</option>
          <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
          <option value="LOST">LOST</option>
          <option value="RETIRED">RETIRED</option>
          <option value="DISPOSED">DISPOSED</option>
        </select>

        <input
          type="text"
          placeholder="Filter by Location..."
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full bg-accent/15 border border-border/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/25 rounded-xl py-2.5 px-4 text-xs outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full text-center py-20 text-xs text-muted-foreground glass-panel rounded-2xl">
            No assets found matching the selected filters.
          </div>
        ) : (
          filteredAssets.map(asset => {
            const cat = categories.find(c => c.id === asset.categoryId);
            return (
              <div 
                key={asset.id} 
                onClick={() => setSelectedAsset(asset)}
                className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-primary/20 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-48 group shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[9px] font-black tracking-wide text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                      {asset.tag}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      asset.status === 'AVAILABLE' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : asset.status === 'ALLOCATED'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : asset.status === 'UNDER_MAINTENANCE'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {asset.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-all line-clamp-1">{asset.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">Serial: {asset.serialNumber}</p>
                </div>

                <div className="pt-4 border-t border-border/30 flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>Loc: {asset.location}</span>
                  <span className="font-semibold text-foreground">
                    {cat ? cat.name : 'Asset'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showScanner && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-in fade-in">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="font-extrabold text-sm text-primary flex items-center gap-1.5">
                <ScanLine size={16} />
                <span>QR Scanner Simulator</span>
              </h3>
              <button onClick={() => setShowScanner(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            
            <div className="relative w-full h-36 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
              <span className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-primary"></span>
              <span className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-primary"></span>
              <span className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-primary"></span>
              <span className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-primary"></span>
              
              <div className="laser-scan-line"></div>

              <QrCode size={44} className="text-primary/20 animate-pulse" />
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Enter any sequential asset tag (e.g. <strong>AF-0002</strong>) or serial number to simulate scanning its physical QR barcode:
            </p>

            <form onSubmit={handleSimulateScan} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. AF-0002 or SN-MBP16-M3"
                value={scanTagInput}
                onChange={(e) => setScanTagInput(e.target.value)}
                className="w-full bg-accent/25 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2.5 px-4 text-xs outline-none transition-all uppercase"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"
              >
                <QrCode size={14} />
                <span>Simulate Scan</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-white/10 space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="font-bold text-sm text-primary tracking-wide uppercase">Register Physical Asset</h3>
              <button onClick={() => { setShowAddForm(false); setMetaFields({}); }} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterAsset} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 15, Dell Monitor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3.5 text-xs outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Asset Category</label>
                <select
                  value={catId}
                  onChange={(e) => { setCatId(e.target.value); setMetaFields({}); }}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3.5 text-xs outline-none transition-all text-muted-foreground"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Serial Number</label>
                <input
                  type="text"
                  placeholder="SN-XXXX-XXXX"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3.5 text-xs outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Acquisition Cost ($)</label>
                <input
                  type="number"
                  placeholder="250"
                  value={acquisitionCost}
                  onChange={(e) => setAcquisitionCost(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3.5 text-xs outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Acquisition Date</label>
                <input
                  type="date"
                  value={acquisitionDate}
                  onChange={(e) => setAcquisitionDate(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3.5 text-xs outline-none transition-all text-muted-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Physical Location</label>
                <input
                  type="text"
                  placeholder="e.g. Headquarters room 302"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3.5 text-xs outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Current Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-accent/20 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3.5 text-xs outline-none transition-all text-muted-foreground"
                >
                  <option value="NEW">New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="SCRAPPED">Scrapped</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="bookable"
                  checked={isBookable}
                  onChange={(e) => setIsBookable(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary bg-accent/20 focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="bookable" className="text-xs font-semibold text-foreground cursor-pointer">
                  Shared / Bookable Resource
                </label>
              </div>

              {activeCategory && activeCategory.customFields.length > 0 && (
                <div className="col-span-full border-t border-border/50 pt-4 mt-2 space-y-3">
                  <h4 className="text-[11px] font-bold text-primary tracking-wide uppercase">
                    Category Specific attributes ({activeCategory.name})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeCategory.customFields.map((field) => (
                      <div key={field} className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">{field}</label>
                        <input
                          type="text"
                          placeholder={`Enter ${field.toLowerCase()}`}
                          value={metaFields[field] || ''}
                          onChange={(e) => handleMetaFieldChange(field, e.target.value)}
                          className="w-full bg-accent/15 border border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3.5 text-xs outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="col-span-full pt-4 border-t border-border/50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setMetaFields({}); }}
                  className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground text-xs font-bold hover:bg-accent/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 transition-all"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedAsset && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-card border-l border-border shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-200 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                  {selectedAsset.tag}
                </span>
                <span className="font-bold text-sm text-foreground">Asset Details</span>
              </div>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-4 items-center bg-accent/10 p-4 rounded-2xl border border-border/40">
              <div className="w-16 h-16 bg-white rounded-lg p-1 shrink-0 flex flex-col justify-between relative shadow-lg shadow-white/5">
                <div className="grid grid-cols-4 gap-0.5 h-full w-full">
                  <div className="bg-black rounded-sm"></div>
                  <div className="bg-black rounded-sm"></div>
                  <div className="bg-white"></div>
                  <div className="bg-black rounded-sm"></div>
                  
                  <div className="bg-white"></div>
                  <div className="bg-black rounded-sm"></div>
                  <div className="bg-black rounded-sm"></div>
                  <div className="bg-white"></div>
                  
                  <div className="bg-black rounded-sm"></div>
                  <div className="bg-white"></div>
                  <div className="bg-black rounded-sm"></div>
                  <div className="bg-black rounded-sm"></div>
                  
                  <div className="bg-black rounded-sm"></div>
                  <div className="bg-black rounded-sm"></div>
                  <div className="bg-white"></div>
                  <div className="bg-black rounded-sm"></div>
                </div>
                <span className="absolute inset-0 m-auto w-4 h-4 bg-primary text-primary-foreground text-[8px] font-extrabold flex items-center justify-center rounded-sm">
                  AF
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{selectedAsset.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">SN: {selectedAsset.serialNumber}</p>
                <p className="text-[10px] text-muted-foreground">Acquired: {new Date(selectedAsset.acquisitionDate).toLocaleDateString()} for ${selectedAsset.acquisitionCost}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 py-1.5 border-b border-border/20">
                <span className="text-muted-foreground">Lifecycle State</span>
                <span className="font-bold text-foreground uppercase text-right">{selectedAsset.status}</span>
              </div>
              <div className="grid grid-cols-2 py-1.5 border-b border-border/20">
                <span className="text-muted-foreground">Physical Location</span>
                <span className="font-semibold text-foreground text-right">{selectedAsset.location}</span>
              </div>
              <div className="grid grid-cols-2 py-1.5 border-b border-border/20">
                <span className="text-muted-foreground">Asset Condition</span>
                <span className="font-semibold text-foreground text-right">{selectedAsset.condition}</span>
              </div>
              <div className="grid grid-cols-2 py-1.5 border-b border-border/20">
                <span className="text-muted-foreground">Bookable shared</span>
                <span className="font-semibold text-foreground text-right">{selectedAsset.isBookable ? 'Yes' : 'No'}</span>
              </div>

              {selectedAsset.meta && Object.keys(selectedAsset.meta).length > 0 && (
                <div className="pt-2">
                  <h4 className="text-[10px] font-bold text-primary tracking-wide uppercase mb-2">Category-Specific Meta</h4>
                  <div className="bg-accent/5 p-3 rounded-xl border border-border/30 space-y-2">
                    {Object.entries(selectedAsset.meta).map(([key, val]) => (
                      <div key={key} className="grid grid-cols-2 text-[11px]">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-semibold text-foreground text-right">{val || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                <span>Asset History Timeline</span>
              </h4>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Allocations</p>
                {selectedAssetAllocations.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">No historical allocations recorded.</p>
                ) : (
                  selectedAssetAllocations.map((alloc) => {
                    const assignee = users.find(u => u.id === alloc.userId);
                    return (
                      <div key={alloc.id} className="p-2.5 rounded-lg bg-accent/15 border border-border/40 text-[11px] space-y-1 relative">
                        <div className="flex justify-between font-semibold">
                          <span className="text-foreground">{assignee ? assignee.name : 'Organization'}</span>
                          <span className="text-[9px] text-primary">{alloc.status}</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground">Checked out: {new Date(alloc.createdAt).toLocaleDateString()}</p>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase flex items-center gap-1">
                  <Wrench size={10} />
                  <span>Maintenance History</span>
                </p>
                {selectedAssetMaintenance.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">No past maintenance requests found.</p>
                ) : (
                  selectedAssetMaintenance.map((m) => (
                    <div key={m.id} className="p-2.5 rounded-lg bg-accent/15 border border-border/40 text-[11px] space-y-1 relative">
                      <div className="flex justify-between font-semibold">
                        <span className="text-foreground text-left line-clamp-1">{m.issue}</span>
                        <span className="text-[9px] text-amber-400">{m.status}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground">Logged: {new Date(m.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

          <button
            onClick={() => setSelectedAsset(null)}
            className="w-full mt-6 py-2.5 bg-accent hover:bg-accent/70 text-foreground text-xs font-bold rounded-xl"
          >
            Close Details
          </button>
        </div>
      )}

    </div>
  );
};

export default AssetDirectory;
