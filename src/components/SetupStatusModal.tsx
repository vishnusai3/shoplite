import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { SystemStatus } from '../types.ts';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Terminal, 
  Database, 
  CreditCard, 
  Play, 
  X, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface SetupStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupStatusModal: React.FC<SetupStatusModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [tests, setTests] = useState<any | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getSystemStatus();
      setStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTests = async () => {
    try {
      setRunningTests(true);
      const res = await api.runTests();
      setTests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningTests(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">System Architecture & Service Diagnostics</h2>
              <p className="text-xs text-stone-500">Live inspection of Supabase PostgreSQL, Razorpay & Backend Test Suite</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {loading ? (
            <div className="py-12 text-center text-stone-500">Checking system connections...</div>
          ) : (
            <>
              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Supabase Status Card */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-600" />
                      Supabase PostgreSQL
                    </span>
                    {status?.database.isConfigured ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Live Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Local Store Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {status?.database.isConfigured 
                      ? `Connected to database instance: ${status.database.url}`
                      : 'Running high-fidelity local data store with active seed data. Ready to connect to your live Supabase project!'}
                  </p>
                  <div className="pt-1 text-xs font-mono text-stone-500 flex flex-col gap-0.5">
                    <span>Schema file: <code className="bg-stone-200/60 px-1 py-0.5 rounded text-stone-800">/supabase_schema.sql</code></span>
                    <span>Admin provision: <code className="bg-stone-200/60 px-1 py-0.5 rounded text-stone-800">admin@shoplite.dev</code></span>
                  </div>
                </div>

                {/* Razorpay Status Card */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Razorpay Checkout
                    </span>
                    {status?.payments.isConfigured ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        <CheckCircle className="w-3 h-3" /> Test Mode Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Test Keys Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {status?.payments.isConfigured
                      ? `Razorpay Standard Checkout enabled using key ID: ${status.payments.keyId.substring(0, 12)}...`
                      : 'Razorpay keys not yet added in .env. A clear test sandbox simulation is active so you can test end-to-end checkout!'}
                  </p>
                  <div className="pt-1 text-xs font-mono text-stone-500 flex flex-col gap-0.5">
                    <span>Webhook raw HMAC: <span className="text-emerald-600 font-semibold">Enabled</span></span>
                    <span>Mode: <span className="text-orange-600 font-semibold">Test / Sandbox</span></span>
                  </div>
                </div>
              </div>

              {/* Backend Test Runner Section */}
              <div className="rounded-xl border border-stone-200 bg-stone-900 text-stone-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-orange-400" />
                    <span className="font-semibold text-sm">Automated Backend Verification Suite</span>
                  </div>
                  <button
                    onClick={handleRunTests}
                    disabled={runningTests}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {runningTests ? 'Running Suite...' : 'Run All Tests'}
                  </button>
                </div>

                {tests ? (
                  <div className="space-y-2 pt-2 border-t border-stone-800">
                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <span>Status: <strong className={tests.passed ? 'text-emerald-400' : 'text-red-400'}>{tests.passed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}</strong></span>
                      <span>{tests.passedCount} of {tests.total} passed</span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 font-mono text-xs">
                      {tests.results.map((r: any, idx: number) => (
                        <div key={idx} className="flex items-start justify-between p-2 rounded bg-stone-800/60 border border-stone-800 text-[11px]">
                          <div className="flex items-center gap-2">
                            {r.passed ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            )}
                            <span className="text-stone-300 font-sans">
                              <span className="text-orange-400 mr-1.5">[{r.category}]</span>
                              {r.name}
                            </span>
                          </div>
                          <span className="text-stone-500 shrink-0 ml-2">{r.durationMs}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 font-sans">
                    Verifies trusted database prices calculation, stock overselling guards, Razorpay HMAC-SHA256 signature verification, webhook idempotency, and admin authorization.
                  </p>
                )}
              </div>

              {/* Instructions Guide */}
              <div className="p-4 rounded-xl border border-stone-100 bg-stone-50 space-y-2">
                <h4 className="font-semibold text-stone-800 text-xs uppercase tracking-wider">How to connect external credentials:</h4>
                <ol className="list-decimal list-inside text-xs text-stone-600 space-y-1">
                  <li><strong>Supabase:</strong> Run <code className="bg-stone-200/60 px-1 py-0.5 rounded">supabase_schema.sql</code> in your Supabase SQL Editor. Copy Project URL and Anon/Service-role keys into <code className="bg-stone-200/60 px-1 py-0.5 rounded">.env</code>.</li>
                  <li><strong>Razorpay:</strong> Go to <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="text-orange-600 underline inline-flex items-center gap-0.5">dashboard.razorpay.com <ExternalLink className="w-2.5 h-2.5" /></a>, switch to <strong>Test Mode</strong>, generate API Key ID & Secret, and add to <code className="bg-stone-200/60 px-1 py-0.5 rounded">.env</code>.</li>
                </ol>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
