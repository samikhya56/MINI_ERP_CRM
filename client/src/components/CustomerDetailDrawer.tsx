import React, { useState } from 'react';
import type { Customer, CustomerStatus, CustomerType } from '../types';
import { api } from '../services/api';
import { X, Calendar, UserCheck, MessageSquarePlus, Edit2, Save, MapPin, Phone, Mail, Building, FileText } from 'lucide-react';

interface Props {
  customer: Customer | null;
  onClose: () => void;
  onCustomerUpdated: (updated: Customer) => void;
}

export const CustomerDetailDrawer: React.FC<Props> = ({ customer, onClose, onCustomerUpdated }) => {
  if (!customer) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({ ...customer });
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.updateCustomer(customer.id, formData);
      onCustomerUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);
    try {
      const addedNote = await api.addCustomerNote(customer.id, newNote);
      const updatedNotes = [addedNote, ...(customer.customerNotes || [])];
      onCustomerUpdated({ ...customer, customerNotes: updatedNotes });
      setNewNote('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">{customer.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Building className="h-3 w-3" /> {customer.businessName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit Info
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 transition">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* EDIT FORM or DISPLAY MODE */}
          {isEditing ? (
            <form onSubmit={handleSaveCustomer} className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase text-cyan-400 tracking-wider">Update Customer Attributes</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Full Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Mobile Number</label>
                  <input
                    type="text"
                    value={formData.mobile || ''}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Email Address</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName || ''}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-400">GST Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber || ''}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Customer Type</label>
                  <select
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100"
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">CRM Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400">Address</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition"
                >
                  <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="h-3.5 w-3.5 text-cyan-400" /> {customer.mobile}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="h-3.5 w-3.5 text-cyan-400" /> {customer.email}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" /> {customer.address}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <FileText className="h-3.5 w-3.5 text-cyan-400" /> GST: {customer.gstNumber || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <UserCheck className="h-3.5 w-3.5 text-cyan-400" /> Type: <span className="font-semibold text-slate-100">{customer.customerType}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-3.5 w-3.5 text-cyan-400" /> Follow-Up:{' '}
                  {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : 'None'}
                </div>
              </div>
            </div>
          )}

          {/* FOLLOW-UP NOTES TIMELINE SECTION */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
              <span>Follow-up Interaction Notes ({customer.customerNotes?.length || 0})</span>
            </h4>

            {/* Add Note Input Area */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log a call summary, site visit outcome, or customer feedback..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingNote || !newNote.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold disabled:opacity-50 transition"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  {isSubmittingNote ? 'Saving Note...' : 'Add Note'}
                </button>
              </div>
            </form>

            {/* Notes Timeline List */}
            <div className="space-y-3 pt-2">
              {customer.customerNotes && customer.customerNotes.length > 0 ? (
                customer.customerNotes.map((note) => (
                  <div key={note.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-cyan-400">
                        {note.creator?.name || 'Logged User'} ({note.creator?.role || 'Sales'})
                      </span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{note.note}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No interaction notes logged yet. Use the textarea above to log customer calls or follow-ups.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
