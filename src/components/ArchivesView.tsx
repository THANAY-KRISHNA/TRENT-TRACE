import { Trash2, FolderOpen, Calendar, HelpCircle, Activity } from "lucide-react";
import { ArchivedAnalysis } from "../types";

interface ArchivesViewProps {
  archives: ArchivedAnalysis[];
  onLoadArchive: (archive: ArchivedAnalysis) => void;
  onDeleteArchive: (id: string) => void;
  onClearAll: () => void;
}

export default function ArchivesView({ archives, onLoadArchive, onDeleteArchive, onClearAll }: ArchivesViewProps) {
  
  // Helper to format sentiment text
  const getSentimentText = (score: number) => {
    if (score >= 0.25) return "Optimistic";
    if (score <= -0.25) return "Critical";
    return "Balanced";
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.25) return "text-slate-900 bg-slate-900/10";
    if (score <= -0.25) return "text-rose-600 bg-rose-50";
    return "text-slate-600 bg-slate-100";
  };

  return (
    <div className="space-y-8 font-sans animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            History Archives
          </h1>
          <p className="text-slate-400 text-sm">
            Access previous real-time queries and loaded sentiment profiles.
          </p>
        </div>

        {archives.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Clear All Archives</span>
          </button>
        )}
      </div>

      {archives.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archives.map((archive) => {
            const sentimentLabel = getSentimentText(archive.overallSentiment);
            const sentimentColor = getSentimentColor(archive.overallSentiment);

            return (
              <div
                key={archive.id}
                className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-[0_12px_24px_rgba(0,0,0,0.02)] rounded-[32px] p-6 transition-all flex flex-col justify-between min-h-[220px]"
              >
                {/* Header: Subreddit/Query and Timestamp */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-lg text-slate-900 truncate" title={archive.subredditName}>
                      {archive.subredditName}
                    </h3>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${sentimentColor}`}>
                      {sentimentLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{archive.timestamp}</span>
                  </div>
                </div>

                {/* Body Metrics Summary */}
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-100 my-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Sentiment Vector</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {archive.overallSentiment > 0 ? `+${archive.overallSentiment.toFixed(2)}` : archive.overallSentiment.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Submissions</span>
                    <span className="font-bold text-sm text-slate-900">{archive.postsAnalyzed} Posts</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <button
                    onClick={() => onLoadArchive(archive)}
                    className="flex-1 flex items-center justify-center gap-2 h-10 bg-slate-100 text-slate-900 font-semibold text-xs rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Restore Snapshot</span>
                  </button>

                  <button
                    onClick={() => onDeleteArchive(archive.id)}
                    className="p-2.5 rounded-full border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-colors cursor-pointer"
                    title="Delete Snapshot"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[32px] p-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)] max-w-lg mx-auto space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-[24px] text-slate-400 w-fit mx-auto">
            <Activity className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Snapshots Archived</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enter a subreddit (e.g. `r/science`) or any keyword in the search bar to analyze live sentiment. Successful scans will automatically archive here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
