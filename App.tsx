import React, { useState, useEffect } from 'react';
import Header from './Header';
import DailyCard from './DailyCard';
import InsightAssistant from './InsightAssistant';
import { getEntryForDate, DRUCKER_ENTRIES } from './druckerData';
import { DruckerEntry } from './types';

const App: React.FC = () => {
  const [currentEntry, setCurrentEntry] = useState<DruckerEntry>(DRUCKER_ENTRIES[0]);
  const [showLibrary, setShowLibrary] = useState(false);

  // Initialize with today's date logic (using sample data fallback)
  useEffect(() => {
    const today = new Date();
    setCurrentEntry(getEntryForDate(today));
  }, []);

  const handleSelectEntry = (entry: DruckerEntry) => {
    setCurrentEntry(entry);
    setShowLibrary(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] pb-12">
      <Header />
      
      <main className="container mx-auto">
        
        {/* Navigation / Library Toggle */}
        <div className="max-w-3xl mx-auto mt-8 px-4 sm:px-6 flex justify-between items-center">
            <button 
                onClick={() => setShowLibrary(!showLibrary)}
                className="group flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
            >
                <div className={`p-1.5 rounded-md bg-stone-200 group-hover:bg-stone-300 transition-colors ${showLibrary ? 'bg-stone-800 text-white group-hover:bg-stone-900 group-hover:text-white' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        {showLibrary ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        )}
                    </svg>
                </div>
                <span>{showLibrary ? 'Close Archive' : 'Open Archive'}</span>
            </button>
            
            <div className="text-xs font-bold text-stone-400 tracking-widest uppercase">
               Vol. 1
            </div>
        </div>

        {/* Library Drawer */}
        {showLibrary && (
            <div className="max-w-3xl mx-auto mt-6 px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {DRUCKER_ENTRIES.map((entry, idx) => (
                    <button 
                        key={idx}
                        onClick={() => handleSelectEntry(entry)}
                        className={`p-5 rounded-xl border text-left transition-all group ${
                            currentEntry.date === entry.date 
                            ? 'bg-white border-stone-800 shadow-md ring-1 ring-stone-900/5' 
                            : 'bg-white/60 border-stone-200 hover:bg-white hover:border-stone-400 hover:shadow-sm'
                        }`}
                    >
                        <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
                            currentEntry.date === entry.date ? 'text-emerald-700' : 'text-stone-400 group-hover:text-stone-600'
                        }`}>
                            {entry.date}
                        </div>
                        <div className="font-serif font-medium text-stone-900 text-lg leading-snug">{entry.title}</div>
                    </button>
                ))}
            </div>
        )}

        <DailyCard entry={currentEntry} />
        
        <InsightAssistant entry={currentEntry} />

      </main>

      <footer className="text-center text-stone-400 py-12 border-t border-stone-200/60 mt-12">
         <div className="w-8 h-8 bg-stone-200 text-stone-500 flex items-center justify-center font-serif font-bold text-sm rounded-sm mx-auto mb-4">
            D
         </div>
        <p className="text-sm font-medium">The Daily Drucker AI Companion</p>
        <p className="text-xs mt-2 text-stone-300">© {new Date().getFullYear()} • Works by Peter F. Drucker</p>
      </footer>
    </div>
  );
};

export default App;