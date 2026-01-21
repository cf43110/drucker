import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-stone-50/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-900 text-white flex items-center justify-center font-serif font-bold text-xl rounded-sm">
            D
          </div>
          <div>
            <h1 className="text-stone-900 font-bold font-serif tracking-tight leading-none">The Daily Drucker</h1>
            <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-medium mt-0.5">Executive Companion</p>
          </div>
        </div>
        <div className="hidden sm:block text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          "The best way to predict the future is to create it."
        </div>
      </div>
    </header>
  );
};

export default Header;