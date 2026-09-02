import React from 'react';
import type { SalesChallan, ChallanStatus } from '../types';
import { X, Printer, ShieldCheck, Building, Calendar, User, FileText } from 'lucide-react';

interface Props {
  challan: SalesChallan | null;
  onClose: () => void;
}

export const PrintChallanModal: React.FC<Props> = ({ challan, onClose }) => {
  if (!challan) return null;

  const handlePrint = () => {
    window.print();
  };

  const statusBadgeStyles: Record<ChallanStatus, { bg: string; text: string; border: string }> = {
    Draft: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    Confirmed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    Cancelled: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  };

  const grandTotal = (challan.items || []).reduce(
    (sum, item) => sum + (Number(item.snapshotUnitPrice) || 0) * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        {/* Action Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">Sales Challan Dispatch Document</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition"
            >
              <Printer className="h-4 w-4" /> Print / Export PDF
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content Area */}
        <div className="space-y-6 bg-slate-950 p-8 rounded-2xl border border-slate-800 text-slate-200 text-xs">
          {/* Header & Logo */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
                <ShieldCheck className="h-6 w-6" /> Mini ERP/CRM Logistics
              </div>
              <p className="text-slate-400">Enterprise Warehouse & Dispatch Fulfillment Desk</p>
              <p className="text-slate-500">Tax Invoice & Delivery Receipt</p>
            </div>

            <div className="text-right space-y-1 font-mono">
              <div className="text-lg font-black text-cyan-400">{challan.challanNumber}</div>
              <div className="text-slate-400 flex items-center justify-end gap-1">
                <Calendar className="h-3.5 w-3.5" /> Date: {new Date(challan.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border mt-1 ${
                    statusBadgeStyles[challan.status].bg
                  } ${statusBadgeStyles[challan.status].text} ${statusBadgeStyles[challan.status].border}`}
                >
                  {challan.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Creator Meta Info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
            <div>
              <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] block mb-1">
                Billed & Dispatched To
              </span>
              <div className="font-bold text-slate-100 text-sm">{challan.customer?.name || 'Customer'}</div>
              <div className="text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                <Building className="h-3 w-3 text-slate-500" /> {challan.customer?.businessName}
              </div>
              <div className="text-slate-400 mt-1">{challan.customer?.address}</div>
              <div className="text-slate-400 font-mono mt-0.5">
                Mobile: {challan.customer?.mobile} • GST: {challan.customer?.gstNumber || 'N/A'}
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] block mb-1">
                Issued By
              </span>
              <div className="font-semibold text-slate-200 flex items-center justify-end gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" /> {challan.createdBy?.name || 'Sales Officer'}
              </div>
              <div className="text-slate-400">{challan.createdBy?.email}</div>
              <div className="text-slate-500 font-mono">Role: {challan.createdBy?.role || 'Sales'}</div>
            </div>
          </div>

          {/* Snapshotted Itemized Line Items Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
              Snapshotted Line Items & Pricing
            </h4>
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">SKU Code</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-center">Quantity</th>
                    <th className="p-3 text-right">Line Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {challan.items && challan.items.length > 0 ? (
                    challan.items.map((item, index) => {
                      const unitPrice = Number(item.snapshotUnitPrice) || 0;
                      const lineSubtotal = unitPrice * item.quantity;
                      return (
                        <tr key={index} className="hover:bg-slate-900/40">
                          <td className="p-3 text-slate-500">{index + 1}</td>
                          <td className="p-3 font-sans font-semibold text-slate-100">
                            {item.snapshotProductName}
                          </td>
                          <td className="p-3 text-cyan-400">{item.snapshotSku}</td>
                          <td className="p-3 text-right">${unitPrice.toFixed(2)}</td>
                          <td className="p-3 text-center font-bold text-slate-200">{item.quantity}</td>
                          <td className="p-3 text-right font-bold text-slate-100">${lineSubtotal.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500">
                        No line items attached.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Totals */}
          <div className="flex justify-end pt-2">
            <div className="w-64 bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 text-right">
              <div className="flex justify-between text-slate-400">
                <span>Total Quantity:</span>
                <span className="font-mono font-bold text-slate-200">{challan.totalQuantity} units</span>
              </div>
              <div className="flex justify-between text-slate-100 text-sm font-extrabold border-t border-slate-800 pt-2">
                <span>Grand Total Value:</span>
                <span className="font-mono text-cyan-400">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
