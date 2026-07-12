import React, { useEffect, useState } from 'react';
import { getDbTable, type MockAsset, type MockCategory, type MockAllocation, type MockBooking, type MockDepartment } from '../utils/mockDb';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { 
  Download, 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export const Reports: React.FC = () => {
  // Database tables
  const [assets, setAssets] = useState<MockAsset[]>([]);
  const [categories, setCategories] = useState<MockCategory[]>([]);

  // Chart data states
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [bookingTrendData, setBookingTrendData] = useState<any[]>([]);
  const [deptAllocationData, setDeptAllocationData] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch tables
    const assetsList = getDbTable<MockAsset>('af_assets');
    const categoriesList = getDbTable<MockCategory>('af_categories');
    const allocationsList = getDbTable<MockAllocation>('af_allocations');
    const bookingsList = getDbTable<MockBooking>('af_bookings');
    const deptsList = getDbTable<MockDepartment>('af_departments');

    setAssets(assetsList);
    setCategories(categoriesList);

    // 2. Prepare Category Pie Chart Data
    const catCounts: Record<string, number> = {};
    assetsList.forEach(asset => {
      const cat = categoriesList.find(c => c.id === asset.categoryId);
      const catName = cat ? cat.name : 'Unknown';
      catCounts[catName] = (catCounts[catName] || 0) + 1;
    });
    const pieData = Object.entries(catCounts).map(([name, value]) => ({ name, value }));
    setCategoryData(pieData);

    // 3. Prepare Asset Status Bar Chart Data
    const statusCounts: Record<string, number> = {};
    assetsList.forEach(asset => {
      statusCounts[asset.status] = (statusCounts[asset.status] || 0) + 1;
    });
    const barData = Object.entries(statusCounts).map(([name, value]) => ({ 
      name: name.replace('_', ' '), 
      count: value 
    }));
    setStatusData(barData);

    // 4. Prepare Booking Trend Data (Line chart)
    const bookingCounts: Record<string, number> = {};
    bookingsList.forEach(b => {
      const dateStr = new Date(b.date).toLocaleDateString([], { month: 'short', day: 'numeric' });
      bookingCounts[dateStr] = (bookingCounts[dateStr] || 0) + 1;
    });
    const lineData = Object.entries(bookingCounts).map(([date, count]) => ({
      date,
      Bookings: count
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setBookingTrendData(lineData);

    // 5. Prepare Department Allocation Table summaries
    const activeAllocations = allocationsList.filter(a => a.status === 'ACTIVE');
    const deptSummaries = deptsList.map(dept => {
      const directAllocCount = activeAllocations.filter(a => a.departmentId === dept.id).length;
      
      // Get count of employees belonging to this department who hold assets
      // (Simplified mapping count for sandbox visualization)
      const empHoldingsCount = activeAllocations.filter(a => a.userId && a.userId !== '').length;

      return {
        id: dept.id,
        name: dept.name,
        directAssets: directAllocCount,
        employeeAssets: dept.name === 'Engineering' ? empHoldingsCount : 0 // Seeding simulation split
      };
    });
    setDeptAllocationData(deptSummaries);

  }, []);

  // CSV Exporter engine
  const handleExportCSV = () => {
    if (assets.length === 0) return;

    // Header row
    const headers = ['Asset Tag', 'Asset Name', 'Serial Number', 'Category', 'Acquisition Cost ($)', 'Condition', 'Location', 'Lifecycle Status', 'Bookable'];
    const rows = assets.map(a => {
      const cat = categories.find(c => c.id === a.categoryId);
      return [
        `"${a.tag}"`,
        `"${a.name}"`,
        `"${a.serialNumber}"`,
        `"${cat ? cat.name : 'Unknown'}"`,
        a.acquisitionCost,
        `"${a.condition}"`,
        `"${a.location}"`,
        `"${a.status}"`,
        a.isBookable ? 'Yes' : 'No'
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Create download link element
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AssetFlow_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Glowing HSL colors mapping matching our custom style system
  const CHART_COLORS = ['#00e5ff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Review physical inventory utilization metrics, maintenance statistics, and reservation heatmaps.
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 transition-all"
        >
          <Download size={14} />
          <span>Export Asset CSV</span>
        </button>
      </div>

      {/* Chart Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* CHART 1: Category Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="font-bold text-xs text-primary tracking-wide uppercase flex items-center gap-1.5">
            <PieIcon size={14} />
            <span>Category Distribution</span>
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No category data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(13, 20, 38, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={10} 
                    formatter={(val) => <span className="text-[10px] text-muted-foreground">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 2: Status Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="font-bold text-xs text-primary tracking-wide uppercase flex items-center gap-1.5">
            <BarChart3 size={14} />
            <span>Inventory Lifecycle status</span>
          </h3>

          <div className="h-64 w-full">
            {statusData.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No status data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(13, 20, 38, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#00e5ff" radius={[4, 4, 0, 0]}>
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 3: Resource Booking Trends */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 md:col-span-2 xl:col-span-1">
          <h3 className="font-bold text-xs text-primary tracking-wide uppercase flex items-center gap-1.5">
            <TrendingUp size={14} />
            <span>Resource Reservation Volume</span>
          </h3>

          <div className="h-64 w-full">
            {bookingTrendData.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-20">No active reservation cycles today.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(13, 20, 38, 0.95)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="Bookings" stroke="#00e5ff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Grid: Department Allocation Table Summary */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <h3 className="font-bold text-sm text-foreground uppercase tracking-wide flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-primary" />
          <span>Department-wise Allocation Summary</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground font-semibold">
                <th className="pb-3 w-1/3">Department Division</th>
                <th className="pb-3">Assets Checked out to Division</th>
                <th className="pb-3">Assets Checked out to Division Employees</th>
                <th className="pb-3 text-right">Total Assets Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {deptAllocationData.map(d => (
                <tr key={d.id} className="hover:bg-accent/10">
                  <td className="py-3.5 font-bold text-foreground">{d.name}</td>
                  <td className="py-3.5 text-muted-foreground">{d.directAssets}</td>
                  <td className="py-3.5 text-muted-foreground">{d.employeeAssets}</td>
                  <td className="py-3.5 text-right font-black text-primary">
                    {d.directAssets + d.employeeAssets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Reports;
