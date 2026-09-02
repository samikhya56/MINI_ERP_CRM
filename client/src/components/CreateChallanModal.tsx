import React, { useState } from 'react';
import type { Customer, Product, SalesChallan, ChallanStatus } from '../types';
import { api } from '../services/api';
import { X, FilePlus, Plus, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  customers: Customer[];
  products: Product[];
  onClose: () => void;
  onChallanCreated: (challan: SalesChallan) => void;
}

export const CreateChallanModal: React.FC<Props> = ({
  isOpen,
  customers,
  products,
  onClose,
  onChallanCreated,
}) => {
  if (!isOpen) return null;

  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [lineItems, setLineItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: products[0]?.id || '', quantity: 1 },
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.businessName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.mobile.includes(customerSearch)
  );

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  // Real-time Total Calculations
  const totalQuantity = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalOrderValue = lineItems.reduce((sum, item) => {
    const p = products.find((prod) => prod.id === item.productId);
    return sum + (p ? p.unitPrice * (Number(item.quantity) || 0) : 0);
  }, 0);

  const handleSubmitWithStatus = async (targetStatus: ChallanStatus) => {
    setErrorMsg(null);
    if (!selectedCustomerId) {
      setErrorMsg('Please select a customer for this sales challan.');
      return;
    }

    // Verify stock if confirming
    if (targetStatus === 'Confirmed') {
      for (const item of lineItems) {
        const p = products.find((prod) => prod.id === item.productId);
        if (p && p.currentStock < item.quantity) {
          setErrorMsg(`Insufficient stock for product: ${p.name} (Requested: ${item.quantity}, Available: ${p.currentStock})`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const created = await api.createChallan({
        customerId: selectedCustomerId,
        status: targetStatus,
        items: lineItems,
      });
      onChallanCreated(created);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create sales challan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FilePlus className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">Create New Sales Challan</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Customer Selection with Search */}
          <div className="space-y-1.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                1. Select Customer *
              </label>
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customer name or business..."
                className="bg-slate-900 border border-slate-700 rounded-lg py-1 px-2.5 text-xs text-slate-100 placeholder-slate-500"
              />
            </div>

            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-medium"
            >
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.businessName}) • {c.mobile}
                  </option>
                ))
              ) : (
                <option value="">No matching customers found</option>
              )}
            </select>
          </div>

          {/* Dynamic Line Items Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                2. Dynamic Line Items ({lineItems.length})
              </span>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> Add Product Line
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {lineItems.map((item, idx) => {
                const selProd = products.find((p) => p.id === item.productId);
                const isOverStock = selProd && item.quantity > selProd.currentStock;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition ${
                      isOverStock
                        ? 'bg-rose-500/10 border-rose-500/40'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Product Selector */}
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 mb-0.5 block">Product</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Unit Price Snapshot */}
                      <div className="w-28 text-center">
                        <label className="text-[10px] text-slate-400 mb-0.5 block">Unit Price</label>
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono font-bold">
                          ${selProd ? selProd.unitPrice.toFixed(2) : '0.00'}
                        </div>
                      </div>

                      {/* Stock Indicator & Quantity Field */}
                      <div className="w-28 text-center">
                        <label className="text-[10px] text-slate-400 mb-0.5 block">
                          Stock: <span className={isOverStock ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{selProd ? selProd.currentStock : 0} units</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center text-slate-100 font-bold"
                        />
                      </div>

                      {/* Line Subtotal */}
                      <div className="w-28 text-right">
                        <label className="text-[10px] text-slate-400 mb-0.5 block">Line Total</label>
                        <div className="font-mono font-bold text-slate-100 text-sm py-1.5">
                          ${selProd ? (selProd.unitPrice * item.quantity).toFixed(2) : '0.00'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        disabled={lineItems.length === 1}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 disabled:opacity-30 self-end mb-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Order Summary */}
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-400 font-medium">Real-Time Order Summary</span>
              <div className="text-slate-300 font-mono">Total Line Items: {lineItems.length}</div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Total Quantity</span>
                <span className="font-mono font-bold text-slate-100 text-base">{totalQuantity} units</span>
              </div>
              <div className="text-right border-l border-slate-800 pl-6">
                <span className="text-slate-400 block text-[10px]">Grand Order Value</span>
                <span className="font-mono font-black text-cyan-400 text-lg">${totalOrderValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Dual Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmitWithStatus('Draft')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 shadow-lg disabled:opacity-50 transition"
            >
              <Clock className="h-4 w-4" /> Save as Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmitWithStatus('Confirmed')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/20 disabled:opacity-50 transition"
            >
              <CheckCircle2 className="h-4 w-4" /> Confirm & Deduct Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
