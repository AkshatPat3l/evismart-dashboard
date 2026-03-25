import React, { useState } from 'react';
import { MoreHorizontal, Filter, Plus, Loader2, Download, Eye, Pencil, Trash2, X, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCases } from '../lib/api';
import { useSearchStore } from '../lib/searchStore';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';

const getStatusColor = (status: string) => {
  switch(status) {
    case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Review': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const exportToCSV = (data: any[]) => {
  const headers = ['Case ID', 'Patient', 'Client', 'Type', 'Status', 'Date'];
  const rows = data.map(c => [c.id, c.patient, c.client?.name || '', c.type, c.status, c.date]);
  const csv = [headers.join(','), ...rows.map(r => r.map((v: string) => `"${v}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `evismart-cases-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const Cases: React.FC = () => {
  const { data: cases, isLoading, isError } = useQuery({ queryKey: ['cases'], queryFn: fetchCases });
  const { searchQuery } = useSearchStore();

  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'delete' | null>(null);
  const [dropdownId, setDropdownId] = useState<string | null>(null);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  // Edit form state
  const [editPatient, setEditPatient] = useState('');
  const [editType, setEditType] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const openModal = (c: any, type: 'view' | 'edit' | 'delete') => {
    setSelectedCase(c);
    setModalType(type);
    setDropdownId(null);
    if (type === 'edit') {
      setEditPatient(c.patient);
      setEditType(c.type);
      setEditStatus(c.status);
    }
  };

  const closeModal = () => { setSelectedCase(null); setModalType(null); };

  const handleEdit = () => {
    toast.success(`Case ${selectedCase.id} updated successfully`);
    closeModal();
  };

  const handleDelete = () => {
    toast.success(`Case ${selectedCase.id} deleted`);
    closeModal();
  };

  const activeFilterCount = (filterStatus !== 'All' ? 1 : 0) + (filterType !== 'All' ? 1 : 0);

  const filteredCases = cases?.filter((c: any) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = c.id?.toLowerCase().includes(q) || c.patient?.toLowerCase().includes(q) || c.client?.name?.toLowerCase().includes(q) || c.type?.toLowerCase().includes(q) || c.status?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    // Status filter
    if (filterStatus !== 'All' && c.status !== filterStatus) return false;
    // Type filter
    if (filterType !== 'All' && c.type !== filterType) return false;
    return true;
  });

  const handleExport = () => {
    if (!filteredCases || filteredCases.length === 0) {
      toast.error('No cases to export');
      return;
    }
    exportToCSV(filteredCases);
    toast.success(`Exported ${filteredCases.length} cases as CSV`);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Case Management</h1>
          <p className="text-slate-500 mt-1">Track and manage digital impressions and production cases.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium text-sm transition-colors ${showFilters ? 'border-evismart-blue bg-blue-50 text-evismart-blue' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}
          >
            <Filter className="w-4 h-4" /> Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-evismart-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm text-slate-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => toast.success('New case form will open here')} className="flex items-center gap-2 px-4 py-2 bg-evismart-blue hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Case
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 bg-white border border-slate-200 rounded-xl shadow-sm p-5 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Filter Cases</h3>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button onClick={() => { setFilterStatus('All'); setFilterType('All'); }} className="text-xs text-evismart-blue hover:underline font-medium">Clear all</button>
              )}
              <button onClick={() => setShowFilters(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[180px]">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
              <div className="relative">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue">
                  <option>All</option>
                  <option>Processing</option>
                  <option>Review</option>
                  <option>Completed</option>
                  <option>Shipped</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="min-w-[180px]">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Case Type</label>
              <div className="relative">
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue">
                  <option>All</option>
                  <option>Crown & Bridge</option>
                  <option>Aligners</option>
                  <option>Implant</option>
                  <option>Denture</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {filterStatus !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-evismart-blue text-xs font-medium rounded-full">
                  Status: {filterStatus}
                  <button onClick={() => setFilterStatus('All')} className="hover:text-blue-800"><X className="w-3 h-3" /></button>
                </span>
              )}
              {filterType !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-evismart-blue text-xs font-medium rounded-full">
                  Type: {filterType}
                  <button onClick={() => setFilterType('All')} className="hover:text-blue-800"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-12 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-evismart-blue mb-4" />
            <p>Loading cases...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-red-500 text-center">Failed to load cases.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Case ID</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCases?.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">No cases match your filters.</td></tr>
                  ) : filteredCases?.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{c.id}</td>
                      <td className="px-6 py-4 text-slate-600">{c.patient}</td>
                      <td className="px-6 py-4 text-slate-600">{c.client?.name || c.client}</td>
                      <td className="px-6 py-4 text-slate-600">{c.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(c.status)}`}>{c.status}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{c.date}</td>
                      <td className="px-6 py-4 text-right relative">
                        <button onClick={() => setDropdownId(dropdownId === c.id ? null : c.id)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        {dropdownId === c.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setDropdownId(null)} />
                            <div className="absolute right-6 top-10 z-50 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                              <button onClick={() => openModal(c, 'view')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-500" /> View Details
                              </button>
                              <button onClick={() => openModal(c, 'edit')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Pencil className="w-4 h-4 text-amber-500" /> Edit Case
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button onClick={() => openModal(c, 'delete')} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Delete Case
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
              <span>Showing {filteredCases?.length} of {cases?.length} cases</span>
              <div className="flex gap-2">
                <button onClick={() => toast('Already on first page', { icon: '⬅️' })} className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 transition-colors">Previous</button>
                <button onClick={() => toast('No more pages available', { icon: '➡️' })} className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 transition-colors">Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Details Modal */}
      <Modal isOpen={modalType === 'view' && !!selectedCase} onClose={closeModal} title={`Case ${selectedCase?.id}`} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Patient</p><p className="text-sm font-medium text-slate-900">{selectedCase?.patient}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Client</p><p className="text-sm font-medium text-slate-900">{selectedCase?.client?.name}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Type</p><p className="text-sm font-medium text-slate-900">{selectedCase?.type}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Status</p><span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedCase?.status || '')}`}>{selectedCase?.status}</span></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Date</p><p className="text-sm font-medium text-slate-900">{selectedCase?.date}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Created</p><p className="text-sm font-medium text-slate-900">{selectedCase?.createdAt?.split('T')[0]}</p></div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={() => { closeModal(); openModal(selectedCase, 'edit'); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Edit</button>
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-white bg-evismart-blue rounded-lg hover:bg-blue-600 transition-colors">Close</button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modalType === 'edit' && !!selectedCase} onClose={closeModal} title={`Edit Case ${selectedCase?.id}`} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
            <input value={editPatient} onChange={(e) => setEditPatient(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Case Type</label>
            <select value={editType} onChange={(e) => setEditType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue">
              <option>Crown & Bridge</option><option>Aligners</option><option>Implant</option><option>Denture</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue">
              <option>Processing</option><option>Review</option><option>Completed</option><option>Shipped</option>
            </select>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={handleEdit} className="px-4 py-2 text-sm font-medium text-white bg-evismart-blue rounded-lg hover:bg-blue-600 transition-colors">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={modalType === 'delete' && !!selectedCase} onClose={closeModal} title="Confirm Deletion" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Are you sure you want to delete case <span className="font-semibold text-slate-900">{selectedCase?.id}</span> for patient <span className="font-semibold text-slate-900">{selectedCase?.patient}</span>? This action cannot be undone.</p>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
