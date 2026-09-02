import React, { useEffect, useState } from 'react';
import type { Product, StockMovement } from '../types';
import { api } from '../services/api';
import { X, ArrowDownRight, ArrowUpRight, History, Package } from 'lucide-react';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export const StockHistoryDrawer: React.FC<Props> = ({ product, onClose }) => {
  if (!product) return null;

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .getProductMovements(product.id)
      .then(setMovements)

      .catch(() => setMovements([]))
      .finally(() => setIsLoading(false));
  }, [product]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{product.name}</h3>
              <p className="text-xs text-slate-400 font-mono">SKU: {product.sku} • Location: {product.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Stock Banner */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-400">Current Stock Level</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-slate-100">{product.currentStock} units</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${
                product.currentStock <= product.minStockAlert
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              Alert Threshold: {product.minStockAlert}
            </span>
          </div>
        </div>

        {/* Movements Audit Log List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Stock Movement Audit Trail</h4>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Loading audit logs...</div>
          ) : movements.length > 0 ? (
            movements.map((movement) => (
              <div
                key={movement.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                      movement.movementType === 'IN'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {movement.movementType === 'IN' ? (
                      <ArrowDownRight className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{movement.reason}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Logged by: <strong className="text-slate-400">{movement.creator?.name || 'Warehouse Staff'}</strong></span>
                      <span>•</span>
                      <span>{new Date(movement.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-sm">
                  <span className={movement.movementType === 'IN' ? 'text-emerald-400' : 'text-amber-400'}>
                    {movement.movementType === 'IN' ? '+' : '-'}{movement.quantityChanged}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No stock movements logged for this product yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
