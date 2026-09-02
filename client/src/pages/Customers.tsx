import React, { useEffect, useState } from 'react';
import type { Customer, CustomerStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { canModifyCustomer } from '../utils/rbac';
import { Search, UserPlus, Filter, ChevronLeft, ChevronRight, Eye, Building, Phone, Mail } from 'lucide-react';
import { CustomerDetailDrawer } from '../components/CustomerDetailDrawer';
import { AddCustomerModal } from '../components/AddCustomerModal';

export const Customers: React.FC = () => {
  const { user } = useAuth();
  const userCanModify = canModifyCustomer(user?.role);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCustomers = () => {
    setIsLoading(true);
    api
      .getCustomers({ page, limit: 10, search, status: statusFilter || undefined })
      .then((res) => {
        setCustomers(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.totalCount);
      })
      .catch((err) => console.error('Fetch error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, statusFilter]);

  const handleCustomerCreated = (newCust: Customer) => {
    fetchCustomers();
  };

  const handleCustomerUpdated = (updatedCust: Customer) => {
    setCustomers(customers.map((c) => (c.id === updatedCust.id ? updatedCust : c)));
    setSelectedCustomer(updatedCust);
  };

  const statusBadgeStyles: Record<CustomerStatus, string> = {
    Lead: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Customer CRM Registry</h1>
          <p className="text-xs text-slate-400">Manage client relationships, leads, and follow-up interaction notes</p>
        </div>
        {userCanModify ? (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition"
          >
            <UserPlus className="h-4 w-4" /> Add Customer
          </button>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 italic">
            Read-Only Access ({user?.role} Role)
          </div>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, business, mobile, or email..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Business</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 animate-pulse">
                    Loading CRM registry...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-100 text-sm">{c.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">GST: {c.gstNumber || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        <Building className="h-3.5 w-3.5 text-cyan-400" /> {c.businessName}
                      </div>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Phone className="h-3 w-3 text-slate-500" /> {c.mobile}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Mail className="h-3 w-3 text-slate-500" /> {c.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium border border-slate-700">
                        {c.customerType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${statusBadgeStyles[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-semibold transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> Notes & Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 border-dashed">
                    No customers match your filter or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
          <div>
            Showing <strong className="text-slate-200">{customers.length}</strong> of{' '}
            <strong className="text-slate-200">{totalCount}</strong> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-slate-300">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Detail & Notes Slide-Over Drawer */}
      <CustomerDetailDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onCustomerUpdated={handleCustomerUpdated}
      />

      {/* Add New Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </div>
  );
};
