import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlClient, PAY_INVOICE_MUTATION, fetchInvoices, logPayment } from '../lib/api';
import { 
  CreditCard, 
  Lock, 
  ChevronLeft, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentGateway: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Card details state (fake)
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
  });

  const invoice = invoices?.find((inv: any) => inv.id === id);

  const payMutation = useMutation({
    mutationFn: (invoiceId: string) => gqlClient.request(PAY_INVOICE_MUTATION, { id: invoiceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
      setIsSuccess(true);
      toast.success('Payment processed successfully!');
    },
    onError: async (error: any) => {
      // Log failed payment attempt
      if (id) {
        try {
          await logPayment({ invoiceId: id, status: 'Failed', method: 'Card', failureReason: error.message });
          queryClient.invalidateQueries({ queryKey: ['payments'] });
          queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
        } catch (_) { /* silent */ }
      }
      toast.error(`Payment failed: ${error.message}`);
      setIsProcessing(false);
    }
  });

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc || !name) {
      toast.error('Please fill in all card details');
      return;
    }
    
    setIsProcessing(true);
    // Simulate network delay
    setTimeout(() => {
      payMutation.mutate(id!);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-evismart-blue" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Invoice Not Found</h1>
        <p className="text-slate-500 mb-6">The invoice you are trying to pay does not exist or has been deleted.</p>
        <button onClick={() => navigate('/invoices')} className="px-6 py-2 bg-evismart-blue text-white rounded-lg font-medium">Return to Invoices</button>
      </div>
    );
  }

  if (invoice.status === 'Paid' && !isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Invoice Already Paid</h1>
        <p className="text-slate-500 mb-6">This invoice has already been settled on {invoice.paidDate}.</p>
        <button onClick={() => navigate('/invoices')} className="px-6 py-2 bg-evismart-blue text-white rounded-lg font-medium">Return to Invoices</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col">
      {/* Premium Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/invoices')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="h-8 w-[2px] bg-slate-200 rounded-full" />
          <h1 className="text-xl font-bold text-slate-900">Secure Checkout</h1>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-widest">
          <Lock className="w-4 h-4" /> Secure 256-bit SSL
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 lg:p-12">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Order Summary */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-evismart-blue" />
                Payment Summary
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm py-3 border-b border-dashed border-slate-100">
                  <span className="text-slate-500">Invoice Number</span>
                  <span className="font-bold text-slate-900 uppercase tracking-tight">{invoice.number}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-3 border-b border-dashed border-slate-100">
                  <span className="text-slate-500">Client</span>
                  <span className="font-semibold text-slate-900">{invoice.client?.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-3 border-b border-dashed border-slate-100">
                  <span className="text-slate-500">Due Date</span>
                  <span className="font-medium text-slate-700">{invoice.dueDate}</span>
                </div>
                
                <div className="pt-6">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-900">${invoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-6 pb-6 border-b border-slate-100">
                    <span className="text-slate-500">Tax ({((invoice.tax / invoice.amount) * 100).toFixed(0)}%)</span>
                    <span className="text-slate-900">${invoice.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-slate-500 font-medium">Total Amount</span>
                    <span className="text-3xl font-extrabold text-evismart-blue leading-none">${invoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 text-sm text-blue-700 leading-relaxed">
              <p className="font-semibold mb-1">EviSmart Payment Policy</p>
              By proceeding with this payment, you agree to our Terms of Service. This is a secure transaction processed through EviSmart's global laboratory network.
            </div>
          </div>

          {/* Payment Form */}
          <div className="order-1 lg:order-2">
            {!isSuccess ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-xl font-bold text-slate-900 mb-8">Card Details</h2>
                
                {/* Virtual Card Preview */}
                <div className="relative h-48 w-full rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#334155] p-6 text-white mb-8 shadow-2xl overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CreditCard className="w-32 h-32 rotate-12" />
                  </div>
                  <div className="relative h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-10 bg-gradient-to-br from-amber-200 to-amber-500 rounded-md opacity-80" />
                      <div className="italic font-bold text-xl opacity-80">EVISMART</div>
                    </div>
                    
                    <div className="text-2xl font-mono tracking-[0.25em] h-8 flex items-center">
                      {cardNumber ? cardNumber.padEnd(16, '•').replace(/(.{4})/g, '$1 ') : '•••• •••• •••• ••••'}
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase opacity-60 tracking-widest leading-none">Card Holder</div>
                        <div className="font-medium tracking-wide leading-none">{name || 'YOUR NAME'}</div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-[10px] uppercase opacity-60 tracking-widest leading-none">Expires</div>
                        <div className="font-medium tracking-wide leading-none">{expiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Card Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        maxLength={16}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-evismart-blue transition-all font-mono" 
                        placeholder="0000 0000 0000 0000"
                      />
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Expiry Date</label>
                      <input 
                        type="text" 
                        maxLength={5}
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-evismart-blue transition-all" 
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">CVC / CVV</label>
                      <input 
                        type="password" 
                        maxLength={3}
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-evismart-blue transition-all font-mono" 
                        placeholder="•••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-evismart-blue transition-all" 
                      placeholder="As shown on card"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isProcessing}
                    className="w-full py-4 bg-evismart-blue hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Securely Pay $${invoice.total.toLocaleString()}`
                    )}
                  </button>
                  
                  <p className="text-center text-xs text-slate-400">
                    Your payment information is encrypted and never stored on our servers.
                  </p>
                </form>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-12 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
                <p className="text-slate-500 mb-8">
                  Thank you for your payment. Invoice <span className="font-bold text-slate-900">{invoice.number}</span> has been marked as paid.
                </p>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/invoices')} 
                    className="w-full py-3 bg-evismart-blue hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-md"
                  >
                    Return to Invoices
                  </button>
                  <button 
                    onClick={() => window.print()} 
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                  >
                    Download Receipt
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-slate-400 text-xs">
        © 2026 EviSmart Dental Solutions. All rights reserved. 
      </footer>
    </div>
  );
};

export default PaymentGateway;
