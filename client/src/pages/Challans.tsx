import React, { useEffect, useState } from 'react';
import type { SalesChallan, Customer, Product, ChallanStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { canCreateChallan, canConfirmChallan } from '../utils/rbac';
import { FilePlus, Search, Filter, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight, User, Printer } from 'lucide-react';
import { CreateChallanModal } from '../components/CreateChallanModal';
import { PrintChallanModal } from '../components/PrintChallanModal';

export const Challans: React.FC = () => {
  const { user } = useAuth();

  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPrintChallan, setSelectedPrintChallan] = useState<SalesChallan | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const userCanCreate = canCreateChallan(user?.role);
  const userCanConfirm = canConfirmChallan(user?.role);

  const fetchChallans = () => {
    setIsLoading(true);
    api
      .getChallans({ page, limit: 10, search, status: statusFilter || undefined })
      .then((res) => {
        setChallans(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.totalCount);
      })
      .catch((err) => console.error('Fetch error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchChallans();
    api.getCustomers({ limit: 100 }).then((res) => setCustomers(res.data));
    api.getProducts({ limit: 100 }).then((res) => setProducts(res.data));
  }, [page, search, statusFilter]);

  const handleStatusTransition = async (challanId: string, targetStatus: ChallanStatus) => {
    setActionError(null);
    try {
      const updated = await api.updateChallanStatus(challanId, targetStatus);
      setChallans(challans.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Status transition failed');
    }
  };

  const statusBadgeStyles: Record<ChallanStatus, string> = {
    Draft: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Sales Challans & Dispatch</h1>
          <p className="text-xs text-slate-400">Manage dispatch lifecycle with atomic stock deduction transactions</p>
        </div>

        {/* RBAC Protected Create Button */}
        {userCanCreate ? (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition"
          >
            <FilePlus className="h-4 w-4" /> Create Sales Challan
          </button>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 italic">
            Read-Only Access ({user?.role} Role)
          </div>
        )}
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span className="font-semibold">{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-xs text-rose-400 underline">
            Dismiss
          </button>
        </div>
      )}

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
            placeholder="Search challan #, customer name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Lifecycle Status:</span>
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
            <option value="Draft">Draft (Yellow)</option>
            <option value="Confirmed">Confirmed (Green)</option>
            <option value="Cancelled">Cancelled (Red)</option>
          </select>
        </div>
      </div>

      {/* Challans Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Challan Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total Quantity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created By</th>
                <th className="p-4 text-right">Lifecycle & Print Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 animate-pulse">
                    Loading sales challans...
                  </td>
                </tr>
              ) : challans.length > 0 ? (
                challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4 font-mono font-bold text-cyan-400 text-sm">{ch.challanNumber}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{ch.customer?.name || 'Customer'}</div>
                      <div className="text-[11px] text-slate-400">{ch.customer?.businessName}</div>
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-200">{ch.totalQuantity} units</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${statusBadgeStyles[ch.status]}`}>
                        {ch.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                        <span>{ch.createdBy?.name || 'Sales Officer'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {/* View & Print Action Button */}
                      <button
                        onClick={() => setSelectedPrintChallan(ch)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
                        title="View and Print Challan Document"
                      >
                        <Printer className="h-3.5 w-3.5 text-cyan-400" /> View/Print
                      </button>

                      {/* RBAC Status Transition Actions */}
                      {userCanConfirm && ch.status === 'Draft' && (
                        <button
                          onClick={() => handleStatusTransition(ch.id, 'Confirmed')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 transition"
                          title="Confirm & Deduct Stock"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
                        </button>
                      )}

                      {userCanConfirm && ch.status === 'Confirmed' && (
                        <button
                          onClick={() => handleStatusTransition(ch.id, 'Cancelled')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30 transition"
                          title="Cancel & Restore Stock"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 border-dashed">
                    No sales challans recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
          <div>
            Showing <strong className="text-slate-200">{challans.length}</strong> of{' '}
            <strong className="text-slate-200">{totalCount}</strong> challans
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

      {/* Printable View Modal */}
      <PrintChallanModal challan={selectedPrintChallan} onClose={() => setSelectedPrintChallan(null)} />

      {/* Creation Modal */}
      <CreateChallanModal
        isOpen={isAddModalOpen}
        customers={customers}
        products={products}
        onClose={() => setIsAddModalOpen(false)}
        onChallanCreated={() => fetchChallans()}
      />
    </div>
  );
};
