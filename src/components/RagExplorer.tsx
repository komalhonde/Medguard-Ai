import React, { useState } from 'react';
import { CLINICAL_GUIDELINES } from '../data/clinicalGuidelines';
import { searchClinicalGuidelines } from '../rag/vectorStore';
import { Search, Filter, BookOpen, ShieldCheck, X, RefreshCw } from 'lucide-react';

export const RagExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const searchResult = searchClinicalGuidelines(searchQuery, 8, selectedCategory);

  const categories = [
    'ALL',
    'Infectious Disease',
    'Cardiology',
    'Endocrinology',
    'Pulmonology',
    'Neurology',
    'Emergency Triage'
  ];

  const quickTopics = [
    { label: 'Heart Attack (ACS / Chest Pain)', query: 'chest pain troponin myocardial infarction ECG' },
    { label: 'Sepsis & Septic Shock', query: 'sepsis lactate fluid resuscitation hypotension' },
    { label: 'Diabetic Ketoacidosis (DKA)', query: 'diabetic ketoacidosis glucose potassium insulin' },
    { label: 'COPD & Asthma Attack', query: 'COPD asthma albuterol oxygen bipap wheezing' },
    { label: 'Hypertensive Emergency (High BP)', query: 'hypertension blood pressure crisis nicardipine' },
    { label: 'Stroke (Code Stroke)', query: 'stroke alteplase thrombolysis FAST CT scan' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Emergency Clinical Treatment Protocols & Guidelines
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard emergency clinical protocols from WHO, American Heart Association (AHA), and NICE.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            {CLINICAL_GUIDELINES.length} Verified Protocols
          </span>
        </div>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Type any condition, symptom, medicine, or protocol (e.g. heart, sepsis, bp, sugar, asthma, stroke)..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold mr-1">Quick Protocols:</span>
          {quickTopics.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(topic.query)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-800 border border-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {topic.label}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-slate-500 text-[11px] font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Specialty:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results / Protocols */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
          <span>
            {searchQuery ? `Showing search results for "${searchQuery}"` : 'All Emergency Clinical Guidelines'} ({searchResult.retrievedChunks.length} found)
          </span>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
              className="text-sky-600 hover:text-sky-800 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filter
            </button>
          )}
        </div>

        {searchResult.retrievedChunks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No matching treatment protocols found</h3>
            <p className="text-xs text-slate-500">
              Try searching for keywords like "chest pain", "sepsis", "insulin", "blood pressure", "stroke", or click a quick topic above.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
              className="px-4 py-2 bg-sky-500 text-white text-xs font-bold rounded-xl hover:bg-sky-600 cursor-pointer"
            >
              View All Protocols
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResult.retrievedChunks.map((chunk) => (
              <div
                key={chunk.id}
                className="bg-white border border-slate-200/80 hover:border-sky-300 rounded-2xl p-5 shadow-sm space-y-3 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        {chunk.category}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-2 leading-snug">
                        {chunk.guidelineTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Section Subheading */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100 font-semibold">
                    <span className="text-sky-700">{chunk.sectionTitle}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{chunk.publishedYear}</span>
                  </div>

                  {/* Content text */}
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                    {chunk.content}
                  </p>
                </div>

                {/* Metadata footer */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Evidence: {chunk.evidenceGrade}</span>
                    </div>
                    <span className="font-medium text-slate-500">{chunk.authoringBody}</span>
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1">
                    {chunk.keywords.map((kw, i) => (
                      <span
                        key={i}
                        onClick={() => setSearchQuery(kw)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium cursor-pointer transition-colors"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
