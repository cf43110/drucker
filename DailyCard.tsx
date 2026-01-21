import React, { useEffect, useState } from 'react';
import { DruckerEntry, DailyAnalysis } from './types';
import { getDailyBriefing } from './geminiService';

interface DailyCardProps {
  entry: DruckerEntry;
}

const DailyCard: React.FC<DailyCardProps> = ({ entry }) => {
  const [analysis, setAnalysis] = useState<DailyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setAnalysis(null);
    setShowSource(false);

    getDailyBriefing(entry).then(result => {
      if (isMounted) {
        setAnalysis(result);
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [entry]);

  const renderBodyParagraphs = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-6 last:mb-0 text-lg text-stone-700 leading-relaxed font-serif font-light">
        {paragraph}
      </p>
    ));
  };

  // Generate a search URL for the book (Goodreads is excellent for book metadata)
  const getBookSearchUrl = (source: string) => {
    return `https://www.goodreads.com/search?q=${encodeURIComponent(source + " Peter Drucker")}`;
  };

  return (
    <div className="max-w-3xl mx-auto my-12 px-4 sm:px-6">
      
      {/* SECTION 1: HEADER */}
      <div className="text-center mb-10 animate-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="h-px bg-stone-300 w-12"></div>
          <span className="text-emerald-800 text-xs font-bold uppercase tracking-[0.2em]">
            {entry.date}
          </span>
          <div className="h-px bg-stone-300 w-12"></div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 tracking-tight leading-[1.1] mb-4">
          {entry.title}
        </h1>
        
        <p className="text-lg md:text-xl text-stone-500 italic font-serif leading-relaxed max-w-2xl mx-auto">
          {entry.subheading}
        </p>
      </div>

      {/* SECTION 2: AI EXECUTIVE BRIEFING (The Transformation) */}
      <div className="relative min-h-[300px]">
        {loading ? (
          <div className="bg-white rounded-xl p-10 border border-stone-200 shadow-sm flex flex-col items-center justify-center space-y-4 animate-pulse">
             <div className="w-12 h-12 border-4 border-stone-200 border-t-emerald-800 rounded-full animate-spin"></div>
             <p className="text-stone-400 font-serif italic">Synthesizing executive brief...</p>
          </div>
        ) : analysis ? (
          <div className="bg-white rounded-xl border border-stone-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Briefing Header */}
            <div className="bg-emerald-950 px-8 py-4 flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                 <h2 className="text-emerald-50 text-xs font-bold uppercase tracking-widest">Smart Briefing</h2>
               </div>
               <span className="text-emerald-400 text-[10px] uppercase font-bold">AI Generated</span>
            </div>

            <div className="p-8 md:p-10 space-y-8">
               {/* Modern Relevance */}
               <div>
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">Modern Context</h3>
                  <p className="text-stone-900 text-lg leading-relaxed font-medium">
                    {analysis.modernRelevance}
                  </p>
               </div>

               {/* Key Takeaways */}
               <div className="bg-stone-50 rounded-lg p-6 border border-stone-100">
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Key Takeaways</h3>
                  <ul className="space-y-4">
                    {analysis.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-stone-700 leading-snug">{point}</span>
                      </li>
                    ))}
                  </ul>
               </div>

               {/* Challenge Question */}
               <div className="border-l-4 border-rose-400 pl-6 py-2">
                  <h3 className="text-rose-500 text-xs font-bold uppercase tracking-widest mb-1">Reflection</h3>
                  <p className="text-xl font-serif text-stone-800 italic">
                    "{analysis.challengeQuestion}"
                  </p>
               </div>
            </div>
          </div>
        ) : (
           <div className="bg-red-50 p-6 rounded-lg text-red-600 text-center">
             Unable to generate briefing. Please check connection.
           </div>
        )}
      </div>

      {/* SECTION 3: ORIGINAL SOURCE (Accordion/Secondary) */}
      <div className="mt-8">
        <button 
          onClick={() => setShowSource(!showSource)}
          className="w-full flex items-center justify-center gap-2 py-4 text-stone-400 hover:text-stone-600 transition-colors text-sm font-medium uppercase tracking-widest border-t border-b border-stone-100"
        >
          {showSource ? 'Hide Source Material' : 'Read Original Excerpt'}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 transition-transform ${showSource ? 'rotate-180' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {showSource && (
          <div className="bg-[#fcfbf9] p-8 md:p-12 border-x border-b border-stone-100 animate-in slide-in-from-top-2 fade-in">
             <div className="prose prose-stone max-w-none prose-p:text-base prose-p:text-stone-600">
               {renderBodyParagraphs(entry.body)}
             </div>
             
             {/* Linked Source Footer */}
             <div className="mt-8 pt-6 border-t border-dashed border-stone-200 text-right flex justify-end items-center gap-2">
                <span className="text-xs text-stone-400 italic">Excerpt from:</span>
                <a 
                  href={getBookSearchUrl(entry.source)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1 text-xs text-stone-600 font-bold italic hover:text-emerald-800 transition-colors"
                  title="Find this book on Goodreads"
                >
                  <span className="underline decoration-stone-300 underline-offset-4 group-hover:decoration-emerald-500 transition-all">
                    {entry.source}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-stone-400 group-hover:text-emerald-600">
                    <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
                  </svg>
                </a>
             </div>
          </div>
        )}
      </div>

      {/* SECTION 4: TODAY'S ASSIGNMENT */}
      <div className="mt-12 bg-white border border-stone-200 rounded-xl p-8 relative overflow-hidden group hover:shadow-lg transition-shadow duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
        <div className="relative z-10">
          <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
               <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Original Directive
          </h3>
          <p className="text-xl font-serif text-stone-800 font-medium leading-relaxed">
            {entry.actionPoint}
          </p>
        </div>
      </div>

    </div>
  );
};

export default DailyCard;
