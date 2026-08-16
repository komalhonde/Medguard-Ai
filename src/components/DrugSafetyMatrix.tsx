import React, { useState } from 'react';
import { DRUG_INTERACTIONS_DATABASE, findDrugInteractions } from '../data/drugInteractions';
import { ShieldAlert, AlertOctagon, CheckCircle2, Search, ArrowRight, ShieldCheck } from 'lucide-react';

export const DrugSafetyMatrix: React.FC = () => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [testDrugA, setTestDrugA] = useState<string>('Warfarin 5mg');
  const [testDrugB, setTestDrugB] = useState<string>('Ibuprofen 400mg');
  const [testResult, setTestResult] = useState<any[] | null>(null);

  const filteredRules = DRUG_INTERACTIONS_DATABASE.filter(r => {
    if (selectedSeverity === 'ALL') return true;
    return r.severity === selectedSeverity;
  });

  const handleTestPair = () => {
    const res = findDrugInteractions([testDrugA], [testDrugB]);
    setTestResult(res);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Medicine Safety & Drug Reaction Checker
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Checks if two medicines can safely be given together without dangerous clashes or side effects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {DRUG_INTERACTIONS_DATABASE.length} Safety Rules Active
          </span>
        </div>
      </div>

      {/* Interactive Pair Tester Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-sky-500" />
          Test Medicine Combination Safety
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-700 block mb-1 font-medium">Home Medicine (Current Tablet / Drug)</label>
            <input
              type="text"
              value={testDrugA}
              onChange={e => setTestDrugA(e.target.value)}
              placeholder="e.g. Warfarin, Nitroglycerin, Lisinopril, Metformin"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-medium">New Hospital Medicine (Proposed Prescription)</label>
            <input
              type="text"
              value={testDrugB}
              onChange={e => setTestDrugB(e.target.value)}
              placeholder="e.g. Ibuprofen, Sildenafil, Spironolactone, Ketorolac"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            id="run-pharmacology-test-btn"
            onClick={handleTestPair}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Check Medicine Safety
          </button>

          <span className="text-[11px] text-slate-500">Instant safety check</span>
        </div>

        {/* Live Pair Output */}
        {testResult && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            {testResult.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Safe to give together: No harmful reactions found between "{testDrugA}" and "{testDrugB}".</span>
              </div>
            ) : (
              <div className="space-y-2">
                {testResult.map((res, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900 text-sm">{res.drugA} + {res.drugB}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white">
                        {res.severity === 'CONTRAINDICATED' ? 'DANGEROUS CLASH' : 'HIGH RISK'}
                      </span>
                    </div>
                    <p className="text-slate-700">{res.mechanism}</p>
                    <div className="text-sky-800 font-medium pt-1">
                      <strong className="text-slate-600">Doctor Advice: </strong>
                      {res.clinicalRecommendation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Safety Database Rules Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
            Dangerous Medicine Interaction Rules
          </h3>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            {['ALL', 'CONTRAINDICATED', 'MAJOR'].map(sev => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedSeverity === sev
                    ? 'bg-sky-500 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {sev === 'ALL' ? 'All Rules' : sev === 'CONTRAINDICATED' ? 'Strictly Prohibited' : 'Major Warnings'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule, idx) => (
            <div
              key={`${rule.drugA}-${rule.drugB}-${idx}`}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {rule.drugA} ↔ {rule.drugB}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  rule.severity === 'CONTRAINDICATED'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {rule.severity}
                </span>
              </div>

              <p className="text-slate-600 leading-relaxed">{rule.mechanism}</p>

              <div className="pt-2 border-t border-slate-200/60 text-sky-800 font-medium">
                <span className="text-slate-500">Action: </span>
                {rule.clinicalRecommendation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
