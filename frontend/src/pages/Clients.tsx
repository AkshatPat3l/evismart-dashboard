import React, { useState } from 'react';
import { Mail, Phone, MapPin, MoreVertical, Loader2, Eye, Pencil, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchClients } from '../lib/api';
import { useSearchStore } from '../lib/searchStore';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';

export const Clients: React.FC = () => {
  const { data: clients, isLoading, isError } = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
  const { searchQuery } = useSearchStore();

  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'delete' | null>(null);
  const [dropdownId, setDropdownId] = useState<number | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDentist, setEditDentist] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const openModal = (client: any, type: 'view' | 'edit' | 'delete') => {
    setSelectedClient(client);
    setModalType(type);
    setDropdownId(null);
    if (type === 'edit') {
      setEditName(client.name);
      setEditDentist(client.dentist);
      setEditLocation(client.location);
      setEditStatus(client.status);
    }
  };

  const closeModal = () => { setSelectedClient(null); setModalType(null); };

  const handleEdit = () => {
    toast.success(`${editName} updated successfully`);
    closeModal();
  };

  const handleDelete = () => {
    toast.success(`${selectedClient.name} removed from directory`);
    closeModal();
  };

  const filteredClients = clients?.filter((client: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return client.name?.toLowerCase().includes(q) || client.dentist?.toLowerCase().includes(q) || client.location?.toLowerCase().includes(q) || client.status?.toLowerCase().includes(q);
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">Manage partner clinics and dental practices.</p>
        </div>
        <div className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{filteredClients ? filteredClients.length : '--'}</span> of <span className="font-semibold text-slate-900">{clients ? clients.length : '--'}</span> Clients
        </div>
      </div>

      {isLoading ? (
        <div className="w-full h-64 flex flex-col justify-center items-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-evismart-blue mb-4" />
          <p>Loading directory...</p>
        </div>
      ) : isError ? (
        <div className="p-8 text-red-500 text-center">Failed to load clients.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients?.map((client: any, i: number) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 leading-tight">{client.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{client.dentist}</p>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setDropdownId(dropdownId === i ? null : i)}
                    className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {dropdownId === i && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownId(null)} />
                      <div className="absolute right-0 top-8 z-50 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        <button onClick={() => openModal(client, 'view')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-500" /> View Details
                        </button>
                        <button onClick={() => openModal(client, 'edit')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                          <Pencil className="w-4 h-4 text-amber-500" /> Edit Client
                        </button>
                        <div className="border-t border-slate-100 my-1" />
                        <button onClick={() => openModal(client, 'delete')} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Delete Client
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-600 gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {client.location}
                </div>
                <button onClick={() => toast(`Calling ${client.name}...`, { icon: '📞' })} className="flex items-center text-sm text-slate-600 gap-2 hover:text-evismart-blue transition-colors">
                  <Phone className="w-4 h-4 text-slate-400" />
                  +1 (555) 123-4567
                </button>
                <button onClick={() => toast(`Opening email to ${client.name}`, { icon: '✉️' })} className="flex items-center text-sm text-slate-600 gap-2 hover:text-evismart-blue transition-colors">
                  <Mail className="w-4 h-4 text-slate-400" />
                  contact@clinic.com
                </button>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  client.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                  client.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {client.status}
                </span>
                <div className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-900">{client.cases}</span> Active Cases
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Details Modal */}
      <Modal isOpen={modalType === 'view' && !!selectedClient} onClose={closeModal} title={selectedClient?.name || 'Client'} size="md">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
              {selectedClient?.name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{selectedClient?.name}</h3>
              <p className="text-sm text-slate-500">{selectedClient?.dentist}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Location</p><p className="text-sm font-medium text-slate-900">{selectedClient?.location}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Status</p><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${selectedClient?.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{selectedClient?.status}</span></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Active Cases</p><p className="text-sm font-medium text-slate-900">{selectedClient?.cases}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Phone</p><p className="text-sm font-medium text-slate-900">+1 (555) 123-4567</p></div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={() => { closeModal(); setTimeout(() => openModal(selectedClient, 'edit'), 100); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Edit</button>
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-white bg-evismart-blue rounded-lg hover:bg-blue-600 transition-colors">Close</button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modalType === 'edit' && !!selectedClient} onClose={closeModal} title={`Edit ${selectedClient?.name}`} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lead Dentist</label>
            <input value={editDentist} onChange={(e) => setEditDentist(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue">
              <option>Active</option><option>Pending</option><option>Inactive</option>
            </select>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={handleEdit} className="px-4 py-2 text-sm font-medium text-white bg-evismart-blue rounded-lg hover:bg-blue-600 transition-colors">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={modalType === 'delete' && !!selectedClient} onClose={closeModal} title="Confirm Deletion" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Are you sure you want to remove <span className="font-semibold text-slate-900">{selectedClient?.name}</span> from your client directory? This action cannot be undone.</p>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
