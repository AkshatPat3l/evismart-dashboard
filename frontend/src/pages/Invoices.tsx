import React, { useState, useRef } from 'react';
import { MoreHorizontal, Filter, Plus, Loader2, Download, Eye, Pencil, Trash2, X, ChevronDown, DollarSign, Receipt, Printer, FileText, CreditCard } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchInvoices, fetchClients, createInvoice } from '../lib/api';
import { useSearchStore } from '../lib/searchStore';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const getStatusColor = (status: string) => {
  switch(status) {
    case 'Paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
    case 'Draft': return 'bg-slate-100 text-slate-700 border-slate-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const exportInvoicesCSV = (data: any[]) => {
  const headers = ['Invoice #', 'Client', 'Description', 'Amount', 'Tax', 'Total', 'Status', 'Issue Date', 'Due Date', 'Paid Date'];
  const rows = data.map(inv => [inv.number, inv.client?.name || '', inv.description || '', inv.amount, inv.tax, inv.total, inv.status, inv.issueDate, inv.dueDate, inv.paidDate || '']);
  const csv = [headers.join(','), ...rows.map(r => r.map((v: any) => `"${v}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `evismart-invoices-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  const { data: invoices, isLoading, isError } = useQuery({ queryKey: ["invoices"], queryFn: fetchInvoices });
  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
  const { searchQuery } = useSearchStore();

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'delete' | null>(null);
  const [dropdownId, setDropdownId] = useState<string | null>(null);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

  // Create form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClientId, setNewClientId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newTax, setNewTax] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit form state
  const [editAmount, setEditAmount] = useState('');
  const [editTax, setEditTax] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  const openModal = (inv: any, type: 'view' | 'edit' | 'delete') => {
    setSelectedInvoice(inv);
    setModalType(type);
    setDropdownId(null);
    if (type === 'edit') {
      setEditAmount(String(inv.amount));
      setEditTax(String(inv.tax));
      setEditStatus(inv.status);
      setEditDescription(inv.description || '');
      setEditDueDate(inv.dueDate);
    }
  };

  const closeModal = () => { setSelectedInvoice(null); setModalType(null); };
  const handleEdit = () => { toast.success(`Invoice ${selectedInvoice.number} updated`); closeModal(); };
  const handleDelete = () => { toast.success(`Invoice ${selectedInvoice.number} deleted`); closeModal(); };

  const resetCreateForm = () => { setNewClientId(''); setNewAmount(''); setNewTax(''); setNewDescription(''); setNewDueDate(''); };
  const handleCreate = async () => {
    if (!newClientId || !newAmount || !newDueDate) { toast.error('Please fill in all required fields'); return; }
    setIsCreating(true);
    try {
      const result = await createInvoice({
        clientId: newClientId,
        amount: parseFloat(newAmount),
        tax: parseFloat(newTax || '0'),
        description: newDescription || undefined,
        dueDate: new Date(newDueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(`Invoice ${result.number} created — ${formatCurrency(result.total)}`);
      setShowCreateModal(false);
      resetCreateForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create invoice');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePrint = (inv: any) => {
    // We'll use window.print() and CSS @media print to do the heavy lifting
    if (inv) setSelectedInvoice(inv);
    setDropdownId(null); // Close dropdown
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadPDF = (inv: any) => {
    if (!inv) return;
    setSelectedInvoice(inv);
    setDropdownId(null); // Close dropdown
    setTimeout(() => {
      const element = printRef.current;
      if (!element) return;
      
      const opt = {
        margin: 0,
        filename: `${inv.number}_${inv.client?.name || 'Invoice'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      html2pdf().from(element).set(opt).save().then(() => {
        toast.success(`Downloaded ${inv.number}`);
      });
    }, 100);
  };

  const activeFilterCount = filterStatus !== 'All' ? 1 : 0;

  const filteredInvoices = invoices?.filter((inv: any) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = inv.number?.toLowerCase().includes(q) || inv.client?.name?.toLowerCase().includes(q) || inv.description?.toLowerCase().includes(q) || inv.status?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterStatus !== 'All' && inv.status !== filterStatus) return false;
    return true;
  });

  // Summary stats
  const totalRevenue = invoices?.reduce((sum: number, inv: any) => inv.status === 'Paid' ? sum + inv.total : sum, 0) || 0;
  const totalPending = invoices?.reduce((sum: number, inv: any) => inv.status === 'Pending' ? sum + inv.total : sum, 0) || 0;
  const totalOverdue = invoices?.reduce((sum: number, inv: any) => inv.status === 'Overdue' ? sum + inv.total : sum, 0) || 0;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>
          <p className="text-slate-500 mt-1">Manage billing, payments, and financial records.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium text-sm transition-colors ${showFilters ? 'border-evismart-blue bg-blue-50 text-evismart-blue' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}>
            <Filter className="w-4 h-4" /> Filter
            {activeFilterCount > 0 && <span className="ml-1 bg-evismart-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          <button onClick={() => { if (!filteredInvoices?.length) { toast.error('No invoices to export'); return; } exportInvoicesCSV(filteredInvoices); toast.success(`Exported ${filteredInvoices.length} invoices`); }} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm text-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-evismart-blue hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-emerald-600" /></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400">Paid</p><p className="text-xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center"><Receipt className="w-6 h-6 text-amber-600" /></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400">Pending</p><p className="text-xl font-bold text-slate-900">{formatCurrency(totalPending)}</p></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-red-600" /></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400">Overdue</p><p className="text-xl font-bold text-slate-900">{formatCurrency(totalOverdue)}</p></div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 bg-white border border-slate-200 rounded-xl shadow-sm p-5 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Filter Invoices</h3>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && <button onClick={() => setFilterStatus('All')} className="text-xs text-evismart-blue hover:underline font-medium">Clear all</button>}
              <button onClick={() => setShowFilters(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="min-w-[180px] max-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
            <div className="relative">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue">
                <option>All</option><option>Draft</option><option>Pending</option><option>Paid</option><option>Overdue</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          {activeFilterCount > 0 && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-evismart-blue text-xs font-medium rounded-full">
                Status: {filterStatus} <button onClick={() => setFilterStatus('All')} className="hover:text-blue-800"><X className="w-3 h-3" /></button>
              </span>
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-12 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-evismart-blue mb-4" /><p>Loading invoices...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-red-500 text-center">Failed to load invoices.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices?.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">No invoices match your filters.</td></tr>
                  ) : filteredInvoices?.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{inv.number}</td>
                      <td className="px-6 py-4 text-slate-600">{inv.client?.name}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">{inv.description}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">{formatCurrency(inv.total)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(inv.status)}`}>{inv.status}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{inv.dueDate}</td>
                      <td className="px-6 py-4 text-right relative">
                        <button onClick={() => setDropdownId(dropdownId === inv.id ? null : inv.id)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        {dropdownId === inv.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setDropdownId(null)} />
                            <div className="absolute right-6 top-10 z-50 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                              <button onClick={() => openModal(inv, 'view')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-500" /> View Details
                              </button>
                              {inv.status !== 'Paid' && (
                                <button onClick={() => navigate(`/invoices/pay/${inv.id}`)} className="w-full text-left px-4 py-2 text-sm text-evismart-blue hover:bg-blue-50 flex items-center gap-2 font-medium">
                                  <CreditCard className="w-4 h-4" /> Pay Now
                                </button>
                              )}
                              <button onClick={() => handlePrint(inv)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Printer className="w-4 h-4 text-slate-400" /> Print Invoice
                              </button>
                              <button onClick={() => handleDownloadPDF(inv)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" /> Export PDF
                              </button>
                              <button onClick={() => openModal(inv, 'edit')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Pencil className="w-4 h-4 text-amber-500" /> Edit Invoice
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button onClick={() => openModal(inv, 'delete')} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Delete Invoice
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
              <span>Showing {filteredInvoices?.length} of {invoices?.length} invoices</span>
            </div>
          </>
        )}
      </div>

      {/* View Details Modal */}
      <Modal isOpen={modalType === 'view' && !!selectedInvoice} onClose={closeModal} title={`Invoice ${selectedInvoice?.number}`} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Client</p><p className="text-sm font-medium text-slate-900">{selectedInvoice?.client?.name}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Status</p><span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedInvoice?.status || '')}`}>{selectedInvoice?.status}</span></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Subtotal</p><p className="text-sm font-medium text-slate-900">{formatCurrency(selectedInvoice?.amount || 0)}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Tax</p><p className="text-sm font-medium text-slate-900">{formatCurrency(selectedInvoice?.tax || 0)}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Total</p><p className="text-lg font-bold text-slate-900">{formatCurrency(selectedInvoice?.total || 0)}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Issue Date</p><p className="text-sm font-medium text-slate-900">{selectedInvoice?.issueDate}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Due Date</p><p className="text-sm font-medium text-slate-900">{selectedInvoice?.dueDate}</p></div>
            {selectedInvoice?.paidDate && <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Paid Date</p><p className="text-sm font-medium text-emerald-600">{selectedInvoice?.paidDate}</p></div>}
          </div>
          {selectedInvoice?.description && (
            <div className="pt-3 border-t border-slate-100"><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Description</p><p className="text-sm text-slate-600">{selectedInvoice.description}</p></div>
          )}
          {selectedInvoice?.case && (
            <div className="pt-3 border-t border-slate-100"><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Linked Case</p><p className="text-sm font-medium text-evismart-blue">{selectedInvoice.case.id} — {selectedInvoice.case.patient}</p></div>
          )}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 no-print">
            <button onClick={() => handlePrint(selectedInvoice)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm text-slate-700 transition-colors">
              <Printer className="w-4 h-4 text-slate-400" /> Print
            </button>
            <button onClick={() => handleDownloadPDF(selectedInvoice)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm text-slate-700 transition-colors">
              <FileText className="w-4 h-4 text-slate-400" /> Download PDF
            </button>
            {selectedInvoice?.status !== 'Paid' && (
              <button onClick={() => navigate(`/invoices/pay/${selectedInvoice.id}`)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm">
                <CreditCard className="w-4 h-4" /> Pay Now
              </button>
            )}
            <button onClick={() => { closeModal(); openModal(selectedInvoice, 'edit'); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Edit</button>
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-white bg-evismart-blue rounded-lg hover:bg-blue-600 transition-colors">Close</button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modalType === 'edit' && !!selectedInvoice} onClose={closeModal} title={`Edit ${selectedInvoice?.number}`} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
              <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tax ($)</label>
              <input type="number" value={editTax} onChange={(e) => setEditTax(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue">
              <option>Draft</option><option>Pending</option><option>Paid</option><option>Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
            <input value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue" />
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={handleEdit} className="px-4 py-2 text-sm font-medium text-white bg-evismart-blue rounded-lg hover:bg-blue-600 transition-colors">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={modalType === 'delete' && !!selectedInvoice} onClose={closeModal} title="Confirm Deletion" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Are you sure you want to delete invoice <span className="font-semibold text-slate-900">{selectedInvoice?.number}</span> ({formatCurrency(selectedInvoice?.total || 0)})? This action cannot be undone.</p>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Delete</button>
          </div>
        </div>
      </Modal>

      {/* Create Invoice Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetCreateForm(); }} title="Create New Invoice" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client <span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={newClientId} onChange={(e) => setNewClientId(e.target.value)} className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue">
                <option value="">Select a client...</option>
                {clients?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" min="0" placeholder="0.00" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tax ($)</label>
              <input type="number" step="0.01" min="0" placeholder="0.00" value={newTax} onChange={(e) => setNewTax(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue" />
            </div>
          </div>
          {(newAmount || newTax) && (
            <div className="bg-slate-50 rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-slate-500">Estimated Total</span>
              <span className="text-lg font-bold text-slate-900">{formatCurrency((parseFloat(newAmount) || 0) + (parseFloat(newTax) || 0))}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input list="desc-suggestions" placeholder="Type or select a description..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue" />
            <datalist id="desc-suggestions">
              {[...new Set(invoices?.map((inv: any) => inv.description).filter(Boolean))].map((desc: string) => (
                <option key={desc} value={desc} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date <span className="text-red-500">*</span></label>
            <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue" />
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={() => { setShowCreateModal(false); resetCreateForm(); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={isCreating} className="px-4 py-2 text-sm font-medium text-white bg-evismart-blue rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isCreating ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Print-Only Invoice Template */}
      {selectedInvoice && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8 overflow-y-auto pointer-events-none opacity-0 print:opacity-100">
          <div ref={printRef} className="max-w-4xl mx-auto p-12 bg-white flex flex-col min-h-[1050px] border border-[#f1f5f9]" style={{ color: '#0f172a' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl font-extrabold text-[#0f62fe] mb-2">EviSmart</h1>
                <p className="text-[#64748b] font-medium tracking-wide uppercase text-xs" style={{ color: '#64748b' }}>Innovation in Dentistry</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-1" style={{ color: '#0f172a' }}>INVOICE</h2>
                <p className="text-[#64748b] text-sm font-medium" style={{ color: '#64748b' }}>#{selectedInvoice.number}</p>
              </div>
            </div>

            {/* Billing Info */}
            <div className="grid grid-cols-2 gap-12 mb-12">
              <div>
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-3" style={{ color: '#94a3b8' }}>From</p>
                <p className="font-bold text-[#0f172a] text-lg" style={{ color: '#0f172a' }}>EviSmart Dental Lab</p>
                <p className="text-[#475569] text-sm leading-relaxed mt-1" style={{ color: '#475569' }}>
                  123 Innovation Drive<br />
                  Suite 400<br />
                  New York, NY 10001
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-3" style={{ color: '#94a3b8' }}>Bill To</p>
                <p className="font-bold text-[#0f172a] text-lg" style={{ color: '#0f172a' }}>{selectedInvoice.client?.name}</p>
                <p className="text-[#475569] text-sm leading-relaxed mt-1" style={{ color: '#475569' }}>
                  Attn: {selectedInvoice.client?.dentist}<br />
                  {selectedInvoice.client?.location}
                </p>
              </div>
            </div>

            {/* Date Info */}
            <div className="grid grid-cols-3 gap-6 p-6 rounded-xl mb-12" style={{ backgroundColor: '#f8fafc' }}>
              <div>
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Issue Date</p>
                <p className="font-bold text-[#0f172a]" style={{ color: '#0f172a' }}>{selectedInvoice.issueDate}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Due Date</p>
                <p className="font-bold text-[#0f172a]" style={{ color: '#0f172a' }}>{selectedInvoice.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[#10b981] uppercase tracking-wider mb-1" style={{ color: '#10b981' }}>Status</p>
                <p className="font-bold uppercase tracking-tighter text-sm" style={{ color: '#059669' }}>{selectedInvoice.status}</p>
              </div>
            </div>

            {/* Description Table */}
            <div className="flex-grow">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th className="py-4 text-xs font-bold text-[#94a3b8] uppercase tracking-wider" style={{ color: '#94a3b8' }}>Description</th>
                    <th className="py-4 text-right text-xs font-bold text-[#94a3b8] uppercase tracking-wider" style={{ color: '#94a3b8' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td className="py-6">
                      <p className="font-bold text-[#0f172a]" style={{ color: '#0f172a' }}>{selectedInvoice.description || 'Dental Laboratory Services'}</p>
                      {selectedInvoice.case && <p className="text-[#64748b] text-sm mt-1" style={{ color: '#64748b' }}>Related Case: {selectedInvoice.case.patient} ({selectedInvoice.case.id})</p>}
                    </td>
                    <td className="py-6 text-right font-bold text-[#0f172a]" style={{ color: '#0f172a' }}>{formatCurrency(selectedInvoice.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="pt-8 mt-12" style={{ borderTop: '2px solid #f1f5f9' }}>
              <div className="w-64 ml-auto space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748b]" style={{ color: '#64748b' }}>Subtotal</span>
                  <span className="font-bold text-[#0f172a]" style={{ color: '#0f172a' }}>{formatCurrency(selectedInvoice.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748b]" style={{ color: '#64748b' }}>Tax</span>
                  <span className="font-bold text-[#0f172a]" style={{ color: '#0f172a' }}>{formatCurrency(selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between pt-4 text-lg" style={{ borderTop: '1px solid #f1f5f9' }}>
                  <span className="font-bold text-[#0f172a]" style={{ color: '#0f172a' }}>Total</span>
                  <span className="font-extrabold text-[#0f62fe]" style={{ color: '#0f62fe' }}>{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-24 pt-12 text-center" style={{ borderTop: '1px solid #f1f5f9' }}>
              <p className="text-[#94a3b8] text-sm italic font-medium" style={{ color: '#94a3b8' }}>Thank you for choosing EviSmart Dental Lab. We appreciate your business.</p>
              <p className="text-[#cbd5e1] text-xs mt-4" style={{ color: '#cbd5e1' }}>This is a system generated invoice. No signature required.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
