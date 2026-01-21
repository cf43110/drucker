import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { getDruckerInsight } from './geminiService';
import { DruckerEntry } from './types';

interface InsightAssistantProps {
  entry: DruckerEntry;
}

const InsightAssistant: React.FC<InsightAssistantProps> = ({ entry }) => {
  const { isListening, transcript, startListening, stopListening, error } = useSpeechRecognition();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Update local query state when transcript changes
  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  const handleAskGemini = async () => {
    if (!query) return;

    setIsLoading(true);
    setResponse(null);
    const result = await getDruckerInsight(entry, query);
    setResponse(result);
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-24">
      
      {/* Visual Divider */}
      <div className="flex items-center gap-4 mb-8">
         <div className="h-px bg-stone-200 flex-1"></div>
         <h2 className="text-stone-400 font-medium text-xs uppercase tracking-[0.2em]">Apply the Insight</h2>
         <div className="h-px bg-stone-200 flex-1"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden relative">
        
        {/* Premium Input Section */}
        <div className="p-1">
          <div className="relative">
            <textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reflect on today's reading. E.g., 'How does this apply to startup culture?'"
              className="w-full p-6 pr-16 text-lg font-serif text-stone-800 bg-transparent border-none focus:ring-0 resize-none placeholder:text-stone-300 placeholder:font-sans min-h-[120px]"
            />
            
            {/* Mic Button - Floating */}
            <button 
              onClick={isListening ? stopListening : startListening}
              className={`absolute right-4 bottom-4 p-3 rounded-full transition-all duration-300 ${
                isListening 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-110' 
                  : 'bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600'
              }`}
              title="Speak"
            >
              {isListening ? (
                <div className="flex gap-0.5 h-5 items-center justify-center w-5">
                   <span className="w-1 h-3 bg-white animate-[pulse_0.5s_ease-in-out_infinite]"></span>
                   <span className="w-1 h-5 bg-white animate-[pulse_0.5s_ease-in-out_0.1s_infinite]"></span>
                   <span className="w-1 h-3 bg-white animate-[pulse_0.5s_ease-in-out_0.2s_infinite]"></span>
                </div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              )}
            </button>
          </div>
          
          {error && <div className="px-6 pb-2 text-rose-500 text-xs font-medium">{error}</div>}

          {/* Action Bar */}
          <div className="px-6 pb-6 pt-2 flex justify-between items-center border-t border-stone-50">
             <div className="text-xs text-stone-400 font-medium hidden sm:block">
                Powered by Gemini AI
             </div>
             <button
              onClick={handleAskGemini}
              disabled={isLoading || !query}
              className={`px-8 py-3 rounded-full font-medium text-sm transition-all flex items-center gap-2 shadow-lg ${
                isLoading || !query
                  ? 'bg-stone-100 text-stone-300 cursor-not-allowed shadow-none'
                  : 'bg-stone-900 text-white hover:bg-black hover:scale-[1.02] shadow-stone-300'
              }`}
            >
              {isLoading ? 'Analyzing...' : 'Generate Perspective'}
              {!isLoading && (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                 </svg>
              )}
            </button>
          </div>
        </div>

        {/* Response Area - The "Letter" */}
        {response && (
          <div className="bg-indigo-50/30 p-8 animate-in slide-in-from-bottom-2 fade-in duration-500 border-t border-indigo-100/50">
             <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold shadow-md mt-1">
                   AI
                </div>
                <div className="prose prose-stone prose-lg leading-relaxed text-stone-700 max-w-none">
                  <React.Fragment>
                      {response.split('\n').map((line, i) => (
                        <p key={i} className="mb-4 last:mb-0">{line}</p>
                      ))}
                  </React.Fragment>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightAssistant;