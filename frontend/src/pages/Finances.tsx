import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPayments, fetchFinanceSummary } from '../lib/api';
import { 
  DollarSign, TrendingUp, Clock, Download, Filter,
  CheckCircle2, XCircle, ChevronDown, X, Loader2, CreditCard
} from 'lucide-react';

const formatCurrency = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StatusBadge = ({ status }: { status: string }) => {
  const colors =
    status === 'Succeeded'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-red-100 text-red-700 border-red-200';
  const Icon = status === 'Succeeded' ? CheckCircle2 : XCircle;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${colors}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

const exportCSV = (payments: any[]) => {
  const headers = ['Reference', 'Invoice #', 'Client', 'Amount', 'Method', 'Status', 'Failure Reason', 'Date'];
  const rows = payments.map((p) => [
    p.reference,
    p.invoice?.number || '',
    p.client?.name || '',
    p.amount,
    p.method,
    p.status,
    p.failureReason || '',
    new Date(p.processedAt).toLocaleDateString(),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.map((v: any) => `"${v}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `evismart-finances-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const Finances: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['financeSummary'],
    queryFn: fetchFinanceSummary,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => fetchPayments(),
  });

  const filtered = payments?.filter((p: any) =>
    filterStatus === 'All' ? true : p.status === filterStatus
  );

  const isLoading = summaryLoading || paymentsLoading;

  const statCards = [
    {
      label: 'Total Collected',
      value: summary ? formatCurrency(summary.totalCollected) : '—',
      sub: `${summary?.succeededCount ?? 0} transactions`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      label: 'Pending Invoices',
      value: summary ? formatCurrency(summary.totalPending) : '—',
      sub: 'Awaiting payment',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      label: 'Failed Transactions',
      value: summary ? formatCurrency(summary.totalFailed) : '—',
      sub: `${summary?.failedCount ?? 0} failed attempts`,
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-100',
    },
    {
      label: 'Net Revenue',
      value: summary ? formatCurrency(summary.netRevenue) : '—',
      sub: 'Collected minus failed',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
  ];

  // Bar chart max value
  const maxBar = summary?.monthlyBreakdown
    ? Math.max(...summary.monthlyBreakdown.map((m: any) => m.collected + m.failed), 1)
    : 1;

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Finances</h1>
          <p className="text-slate-500 mt-1">Payment history, transaction log, and revenue overview.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium text-sm transition-colors ${
              showFilters ? 'border-evismart-blue bg-blue-50 text-evismart-blue' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" /> Filter
            {filterStatus !== 'All' && (
              <span className="ml-1 bg-evismart-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">1</span>
            )}
          </button>
          <button
            onClick={() => { if (filtered?.length) exportCSV(filtered); }}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 font-medium text-sm text-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-white rounded-xl border shadow-sm p-5 flex items-center gap-4 ${card.border}`}>
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
              {isLoading ? (
                <div className="h-7 w-24 bg-slate-100 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-xl font-bold text-slate-900">{card.value}</p>
              )}
              <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Bar Chart */}
      {summary?.monthlyBreakdown && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-6">Monthly Breakdown</h2>
          <div className="flex items-end gap-3 h-36">
            {summary.monthlyBreakdown.map((m: any) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: '100px' }}>
                  {m.collected > 0 && (
                    <div
                      className="w-full bg-emerald-400 rounded-t transition-all duration-500"
                      style={{ height: `${(m.collected / maxBar) * 100}px` }}
                      title={`Collected: ${formatCurrency(m.collected)}`}
                    />
                  )}
                  {m.failed > 0 && (
                    <div
                      className="w-full bg-red-300 rounded-t transition-all duration-500"
                      style={{ height: `${(m.failed / maxBar) * 100}px` }}
                      title={`Failed: ${formatCurrency(m.failed)}`}
                    />
                  )}
                  {m.collected === 0 && m.failed === 0 && (
                    <div className="w-full bg-slate-100 rounded" style={{ height: '4px' }} />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center">{m.month.split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />Collected</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-300 inline-block" />Failed</span>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 bg-white border border-slate-200 rounded-xl shadow-sm p-5 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Filter Transactions</h3>
            <div className="flex items-center gap-2">
              {filterStatus !== 'All' && (
                <button onClick={() => setFilterStatus('All')} className="text-xs text-evismart-blue hover:underline font-medium">
                  Clear all
                </button>
              )}
              <button onClick={() => setShowFilters(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="min-w-[180px] max-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-evismart-blue focus:border-evismart-blue"
              >
                <option>All</option>
                <option>Succeeded</option>
                <option>Failed</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Transaction Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[300px]">
        {paymentsLoading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-evismart-blue mb-4" />
            <p>Loading transactions...</p>
          </div>
        ) : !filtered?.length ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400">
            <CreditCard className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-medium text-slate-500">No transactions found</p>
            <p className="text-sm mt-1">Payments will appear here after invoices are paid.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Invoice</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{p.reference.slice(0, 12)}…</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{p.invoice?.number}</td>
                      <td className="px-6 py-4 text-slate-600">{p.client?.name}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">{formatCurrency(p.amount)}</td>
                      <td className="px-6 py-4 text-slate-500">{p.method}</td>
                      <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-6 py-4 text-slate-400 text-xs max-w-[160px] truncate">{p.failureReason || '—'}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(p.processedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
              <span>Showing {filtered.length} of {payments?.length} transactions</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {payments?.filter((p: any) => p.status === 'Succeeded').length} succeeded
                </span>
                <span className="flex items-center gap-1.5 text-red-500 font-medium">
                  <XCircle className="w-3.5 h-3.5" />
                  {payments?.filter((p: any) => p.status === 'Failed').length} failed
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
