import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Product, Customer, SalesChallan } from '../types';
import { Users, Package, FileText, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProducts({ limit: 100 }),
      api.getCustomers({ limit: 100 }),
      api.getChallans({ limit: 10 }),
    ])
      .then(([pRes, cRes, chRes]) => {
        setProducts(pRes.data);
        setCustomers(cRes.data);
        setChallans(chRes.data);
      })
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const lowStockItems = products.filter((p) => p.currentStock <= p.minStockAlert);
  const activeLeads = customers.filter((c) => c.status === 'Lead');
  const activeCustomers = customers.filter((c) => c.status === 'Active');

  return (
    <div className="p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            Operations Control Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Mini ERP/CRM Monitoring • Node.js, Prisma & PostgreSQL Architecture
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/challans"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition"
          >
            <FileText className="h-4 w-4" /> New Sales Challan
          </Link>
        </div>
      </div>

      {/* Low Stock Warning Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm">Inventory Alert Threshold Triggered!</span>
              <p className="text-slate-400 text-xs">
                {lowStockItems.length} product(s) are currently at or below their minimum safety stock alert levels ({lowStockItems.map((p) => p.name).join(', ')}).
              </p>
            </div>
          </div>
          <Link
            to="/inventory?lowStockOnly=true"
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 font-bold text-xs text-amber-200 transition"
          >
            Review Inventory
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total CRM Customers</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100">{customers.length}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">{activeCustomers.length} Active</span> • {activeLeads.length} Leads
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Products</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100">{products.length}</div>
          <div className="text-xs text-slate-500">Total Catalog Items</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Alerts</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">{lowStockItems.length}</div>
          <div className="text-xs text-slate-500">Requires PO Replenishment</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Sales Challans</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100">{challans.length}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-400" /> Confirmed Dispatch Orders
          </div>
        </div>
      </div>

      {/* Recent Challans Overview */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <h3 className="text-base font-bold text-slate-100">Recent Sales Challans Lifecycle</h3>
          <Link to="/challans" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading dashboard activity...</div>
        ) : challans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Challan #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total Qty</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {challans.slice(0, 5).map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-cyan-400">{ch.challanNumber}</td>
                    <td className="p-3 font-medium text-slate-200">{ch.customer?.name || 'Enterprise Customer'}</td>
                    <td className="p-3 font-mono">{ch.totalQuantity} units</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          ch.status === 'Confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : ch.status === 'Cancelled'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {ch.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{new Date(ch.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No sales challans recorded yet. Use the "New Sales Challan" button above to get started.
          </div>
        )}
      </div>
    </div>
  );
};
