import React, { useEffect, useState } from 'react';
import type { Product } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { canModifyInventory } from '../utils/rbac';
import { Search, PackagePlus, AlertTriangle, History, ChevronLeft, ChevronRight, MapPin, Tag } from 'lucide-react';
import { AddProductModal } from '../components/AddProductModal';
import { StockHistoryDrawer } from '../components/StockHistoryDrawer';
import { useSearchParams } from 'react-router-dom';

export const Inventory: React.FC = () => {
  const { user } = useAuth();
  const userCanModify = canModifyInventory(user?.role);
  const [searchParams] = useSearchParams();
  const initialLowStock = searchParams.get('lowStockOnly') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(initialLowStock);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = () => {
    setIsLoading(true);
    api
      .getProducts({ page, limit: 10, search, lowStockOnly })
      .then((res) => {
        setProducts(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.totalCount);
      })
      .catch((err) => console.error('Fetch error:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, lowStockOnly]);

  const handleProductCreated = (newProd: Product) => {
    fetchProducts();
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Inventory & Stock Control</h1>
          <p className="text-xs text-slate-400">Monitor stock levels, safety thresholds, and audit movement logs</p>
        </div>
        {userCanModify ? (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition"
          >
            <PackagePlus className="h-4 w-4" /> Add Product
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
            placeholder="Search product name, SKU, category, or location..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Low Stock Toggle Button */}
        <button
          onClick={() => {
            setLowStockOnly(!lowStockOnly);
            setPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            lowStockOnly
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Low Stock Alerts Only ({products.filter((p) => p.currentStock <= p.minStockAlert).length})</span>
        </button>
      </div>

      {/* Inventory Products Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Product Name & SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Current Stock Status</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-right">Audit Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 animate-pulse">
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => {
                  const isLowStock = p.currentStock <= p.minStockAlert;
                  return (
                    <tr
                      key={p.id}
                      className={`transition ${
                        isLowStock ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                          <span>{p.name}</span>
                          {isLowStock && (
                            <span className="flex h-2 w-2 relative" title="Low Stock Warning">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-cyan-400 font-mono">SKU: {p.sku}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-slate-300 font-medium">
                          <Tag className="h-3.5 w-3.5 text-slate-500" /> {p.category}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-100">${p.unitPrice.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                              isLowStock
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {p.currentStock} units
                          </span>
                          <span className="text-[11px] text-slate-500">(Min: {p.minStockAlert})</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" /> {p.location}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                        >
                          <History className="h-3.5 w-3.5 text-cyan-400" /> Movement Logs
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 border-dashed">
                    No products found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
          <div>
            Showing <strong className="text-slate-200">{products.length}</strong> of{' '}
            <strong className="text-slate-200">{totalCount}</strong> items
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

      {/* Stock History Audit Drawer */}
      <StockHistoryDrawer product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
};
