import { X, BookOpen, Cpu, Database, Award, HelpCircle } from "lucide-react";

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MethodologyModal({ isOpen, onClose }: MethodologyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative bg-white rounded-[32px] max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-8 flex flex-col justify-between gap-6 border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-slate-100 text-slate-900 rounded-2xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Technical Specifications</h2>
            <p className="text-xs text-slate-400">Sentira Research Labs Sentiment Analysis Engine</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 text-sm text-slate-500 leading-relaxed select-text py-2">
          
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-base">
              <Cpu className="w-4.5 h-4.5 text-slate-900" />
              <span>1. Semantic Core & NLP Architecture</span>
            </h3>
            <p>
              The Sentira NLP pipeline leverages **Gemini 3.5 Flash** as its core language model. Unlike outdated bag-of-words or rule-based models, our system evaluates posts through multi-layered transformers that contextualize semantic shifts, community-specific slang (e.g., "HODL", "bullish", "moon"), sub-text sarcasm, and domain-specific jargon.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-base">
              <Database className="w-4.5 h-4.5 text-slate-900" />
              <span>2. Ingestion & Preprocessing</span>
            </h3>
            <p>
              Raw submissions are ingested in real-time from public unauthenticated Reddit JSON interfaces. The engine fetches headlines, self-text bodies, upvote counts, and comment frequencies. We apply strict sanitization parameters: removing automated bot annotations, repetitive commercial links, and pinned moderator announcements to preserve signal purity.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-base">
              <Award className="w-4.5 h-4.5 text-slate-900" />
              <span>3. Sentiment Calibration & Weights</span>
            </h3>
            <p>
              Sentiment vectors are quantified strictly on a sliding scale from **-1.0 (highly critical/negative)** to **+1.0 (highly optimistic/positive)**. Weighted values are computed using:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-1 text-xs">
              <li>**Lexical Sentiment**: The core emotional valence of the text content itself.</li>
              <li>**Engagement Factor**: Upvotes and Comment Counts act as multipliers. A positive post with 20k upvotes carries higher sentiment weight than one with 2 upvotes.</li>
              <li>**Velocity Modeling**: Compiles sentiment scores across contiguous threads to define weekly trends.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-base">
              <HelpCircle className="w-4.5 h-4.5 text-slate-900" />
              <span>4. System Accuracy Rating</span>
            </h3>
            <p>
              The listed **Accuracy Rating** measures the NLP model's confidence weight based on vocabulary density and contextual consistency within the active dataset. Runs averaging higher linguistic clarity achieve scores closer to 95%.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 h-11 bg-slate-900 text-white text-xs font-semibold rounded-full hover:bg-black transition-colors cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
