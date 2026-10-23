'use client';

import React, { useState } from 'react';
import { BookOpen, X, FileText, Search, Shield, ChevronRight } from 'lucide-react';
import { PAMPHLET_DOCS } from '@/lib/ciphers';

interface PamphletModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKey?: string;
}

export default function PamphletModal({ isOpen, onClose, initialKey = 'caesar' }: PamphletModalProps) {
  const [activeKey, setActiveKey] = useState<string>(initialKey);
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const currentDoc = PAMPHLET_DOCS[activeKey] || PAMPHLET_DOCS['caesar'];

  const docKeys = Object.keys(PAMPHLET_DOCS).filter((k) => {
    if (!searchTerm) return true;
    const doc = PAMPHLET_DOCS[k];
    return (
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl h-[85vh] bg-bunker-900 border-2 border-stone-600 rounded-lg shadow-2xl flex flex-col overflow-hidden text-stone-200 font-mono">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-bunker-950 border-b border-bunker-700">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span className="font-bold tracking-wider text-stone-100 text-sm sm:text-base">
              HUT 99 FIELD PAMPHLET // TOP SECRET REFERENCE
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-100 hover:bg-bunker-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Sidebar / Index */}
          <div className="w-full md:w-64 max-h-44 md:max-h-none border-b md:border-b-0 md:border-r border-bunker-700 bg-bunker-950/80 flex flex-col p-3 overflow-y-auto flex-shrink-0">
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-500" />
              <input
                type="text"
                placeholder="Search manual..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-bunker-900 border border-bunker-700 rounded pl-8 pr-2 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-2 px-1">
              Field Sections
            </div>

            <div className="space-y-1">
              {docKeys.map((key) => {
                const doc = PAMPHLET_DOCS[key];
                const active = activeKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveKey(key)}
                    className={`w-full text-left px-2.5 py-2 rounded text-xs transition-all flex items-center justify-between ${
                      active
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                        : 'text-stone-400 hover:bg-bunker-900 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{key.toUpperCase()}</span>
                    </div>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Manual Document Reader */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-bunker-900/60">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border-b border-bunker-700 pb-4">
                <div className="flex items-center gap-2 text-xs text-amber-500 mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>CLASSIFIED CRYPTANALYTIC DIRECTIVE</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-stone-100">
                  {currentDoc.title}
                </h2>
                <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">
                  {currentDoc.subtitle}
                </p>
              </div>

              {currentDoc.sections.map((sec, i) => (
                <div key={i} className="bg-bunker-950/70 border border-bunker-700/80 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-bold text-amber-400 tracking-wide uppercase border-l-2 border-amber-500 pl-2">
                    {sec.heading}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed whitespace-pre-line">
                    {sec.content}
                  </p>
                  {sec.visual && (
                    <div className="bg-black/80 border border-bunker-700 rounded p-3 overflow-x-auto text-xs font-mono text-emerald-400 whitespace-pre">
                      {sec.visual}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-bunker-950 border-t border-bunker-700 flex items-center justify-between text-[11px] text-stone-500">
          <span>PROPERTY OF BLETCHLEY PARK // UNIT 404 EYES ONLY</span>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-amber-400 underline font-bold"
          >
            Return to Workstation
          </button>
        </div>
      </div>
    </div>
  );
}
