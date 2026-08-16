import React from 'react';
import { Activity, FileText, ShieldAlert, HeartPulse } from 'lucide-react';

export type ActiveTab = 'TRIAGE' | 'DRUG_SAFETY' | 'RAG_EXPLORER';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  systemStatus: {
    status: string;
    engine: string;
    geminiConfigured: boolean;
  };
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'TRIAGE' as ActiveTab, label: 'Patient Triage & Care', icon: HeartPulse },
    { id: 'DRUG_SAFETY' as ActiveTab, label: 'Medicine Safety Checker', icon: ShieldAlert },
    { id: 'RAG_EXPLORER' as ActiveTab, label: 'Treatment Protocols', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('TRIAGE')}>
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-md shadow-sky-500/20 text-white">
              <Activity className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  MedGuard AI
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Hospital System Active
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Emergency Patient Care • Medicine Safety • Clinical Treatment Protocols
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200/70 overflow-x-auto max-w-full">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id.toLowerCase()}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 bg-white/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Clean Hospital Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-800 text-[11px] font-semibold">Clinical Assistant Online</span>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-start gap-1 py-2 overflow-x-auto border-t border-slate-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-semibold ${
                  isActive ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
