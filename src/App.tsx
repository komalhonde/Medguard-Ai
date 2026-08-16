/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { TriageWorkspace } from './components/TriageWorkspace';
import { RagExplorer } from './components/RagExplorer';
import { DrugSafetyMatrix } from './components/DrugSafetyMatrix';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('TRIAGE');
  const [systemStatus, setSystemStatus] = useState({
    status: 'ONLINE',
    engine: 'GradientBoost-Forest v2.4 (Active)',
    geminiConfigured: true
  });

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data && data.engines) {
          setSystemStatus({
            status: data.status,
            engine: data.engines.classicalML,
            geminiConfigured: !data.engines.geminiLLM.includes('Offline')
          });
        }
      })
      .catch(() => {
        // Safe fallback
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
      />

      {/* Main Content View Container */}
      <main className="flex-1">
        {activeTab === 'TRIAGE' && <TriageWorkspace />}
        {activeTab === 'DRUG_SAFETY' && <DrugSafetyMatrix />}
        {activeTab === 'RAG_EXPLORER' && <RagExplorer />}
      </main>

      {/* Clean Clinical Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">MedGuard AI</span>
            <span>• Emergency Hospital Clinical Decision Support System</span>
          </div>
          <div className="text-slate-500 text-[11px] font-medium">
            Clinical Patient Care & Medicine Safety Portal
          </div>
        </div>
      </footer>
    </div>
  );
}
