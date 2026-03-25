import React from 'react';
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAnalytics } from '../lib/api';

interface Metric { label: string; value: string; change: string; isUp: boolean; }
interface ProductStat { name: string; val: number; color: string; }
interface AnalyticsData {
  metrics: Metric[];
  revenueChart: number[];
  products: ProductStat[];
}

export const Analytics: React.FC = () => {
  const { data, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics
  });

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col justify-center items-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-evismart-blue mb-4" />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (isError || !data) {
    return <div className="p-8 text-red-500">Failed to load analytics dashboard.</div>;
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics & Reports</h1>
        <p className="text-slate-500 mt-1">Key performance indicators for your lab network.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.metrics.map((metric, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <h3 className="text-sm font-medium text-slate-500 mb-1">{metric.label}</h3>
            <div className="flex items-end gap-3">
              <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
              <span className={`flex items-center text-sm font-medium mb-1 ${
                (metric.label.includes('Turnaround') || metric.label.includes('Remake')) 
                  ? (metric.isUp ? 'text-red-600' : 'text-emerald-600')
                  : (metric.isUp ? 'text-emerald-600' : 'text-red-600')
              }`}>
                {metric.isUp ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-900 text-lg">Revenue Overview</h3>
            <select className="border border-slate-200 rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-evismart-blue/20 bg-white">
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 w-full flex items-end justify-between gap-2 border-b border-slate-100 pb-2">
            {data.revenueChart.map((h, i) => (
              <div key={i} className="w-full relative group h-full flex items-end">
                <div 
                  className="w-full bg-evismart-blue/20 hover:bg-evismart-blue rounded-t-sm transition-colors duration-300" 
                  style={{ height: `${h}%` }}
                ></div>
                <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  Vol: {h * 12}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400 px-1">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="font-semibold text-slate-900 text-lg mb-6">Top Product Categories</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="space-y-4">
              {data.products.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="text-slate-500">{item.val}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
