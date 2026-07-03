import { useState } from "react";
import { FileText, Sparkles, RefreshCw, Save, Check, ArrowRight, BookOpen } from "lucide-react";
import { AnalysisResult, SavedReport } from "../types";

interface ReportsViewProps {
  data: AnalysisResult;
  onSaveReport: (report: SavedReport) => void;
  savedReports: SavedReport[];
}

export default function ReportsView({ data, onSaveReport, savedReports }: ReportsViewProps) {
  const [reportText, setReportText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setHasSaved(false);
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisData: data })
      });
      if (response.ok) {
        const result = await response.json();
        setReportText(result.report);
      } else {
        console.error("Failed to generate report");
        // Fallback text if something fails
        setReportText(`# Executive Sentiment Briefing: ${data.subredditName}
## Generated Fallback Report

This report summarizes public sentiment trends and opinion densities analyzed for the query **${data.subredditName}**.

### 1. Sentiment Profile
The community manifests an overall sentiment score of **${data.overallSentiment > 0 ? "+" : ""}${data.overallSentiment.toFixed(2)}**. This metric indicates a baseline sentiment that is generally ${data.overallSentiment >= 0.25 ? "highly optimistic" : data.overallSentiment <= -0.25 ? "substantially critical" : "balanced and neutral"}.

### 2. High-Density Sentiment Drivers
- **${data.topDrivers[0]?.topic || "Topic A"}**: Registered at ${data.topDrivers[0]?.sentiment > 0 ? "+" : ""}${data.topDrivers[0]?.sentiment.toFixed(2)} score.
- **${data.topDrivers[1]?.topic || "Topic B"}**: Registered at ${data.topDrivers[1]?.sentiment > 0 ? "+" : ""}${data.topDrivers[1]?.sentiment.toFixed(2)} score.
- **${data.topDrivers[2]?.topic || "Topic C"}**: Registered at ${data.topDrivers[2]?.sentiment > 0 ? "+" : ""}${data.topDrivers[2]?.sentiment.toFixed(2)} score.
- **${data.topDrivers[3]?.topic || "Topic D"}**: Registered at ${data.topDrivers[3]?.sentiment > 0 ? "+" : ""}${data.topDrivers[3]?.sentiment.toFixed(2)} score.

### 3. Conclusion & Core Directives
Analysis of individual posts suggests high-density active conversations. Strategic focus should be aligned with primary positive catalysts while mitigative responses are prepared for key pressure-points identified by the sentiment drivers.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!reportText) return;
    const newReport: SavedReport = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Executive Sentiment Briefing: ${data.subredditName}`,
      subredditName: data.subredditName,
      timestamp: new Date().toLocaleString(),
      content: reportText
    };
    onSaveReport(newReport);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 3000);
  };

  // Simple elegant custom markdown to JSX renderer to keep dependencies super lightweight and fast
  const renderMarkdown = (md: string) => {
    return md.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith("# ")) {
        return <h1 key={idx} className="text-2xl sm:text-3xl font-light tracking-tight text-slate-900 border-b border-slate-100 pb-4 mt-8 mb-4">{trimmed.replace("# ", "")}</h1>;
      }
      if (trimmed.startsWith("## ")) {
        return <h2 key={idx} className="text-xl sm:text-2xl font-light tracking-tight text-slate-900 mt-8 mb-3">{trimmed.replace("## ", "")}</h2>;
      }
      if (trimmed.startsWith("### ")) {
        return <h3 key={idx} className="text-lg font-normal text-slate-900 mt-6 mb-2">{trimmed.replace("### ", "")}</h3>;
      }
      
      // Bullets
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const text = trimmed.slice(2);
        return (
          <li key={idx} className="ml-6 list-disc text-sm text-slate-500 leading-relaxed my-1.5">
            {parseBoldText(text)}
          </li>
        );
      }

      // Ordered list
      if (/^\d+\.\s/.test(trimmed)) {
        const text = trimmed.replace(/^\d+\.\s/, "");
        return (
          <li key={idx} className="ml-6 list-decimal text-sm text-slate-500 leading-relaxed my-1.5">
            {parseBoldText(text)}
          </li>
        );
      }

      // Empty space
      if (!trimmed) {
        return <div key={idx} className="h-3" />;
      }

      // Standard Paragraph
      return (
        <p key={idx} className="text-sm sm:text-base text-slate-500 leading-relaxed my-3 font-normal">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  // Bold parser helper
  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-8 font-sans animate-fade-in">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Executive Briefings
        </h1>
        <p className="text-slate-400 text-sm">
          Generate comprehensive analytical reports summarizing public perception metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column: Controls and presets */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-900">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-medium">Target Subreddit</span>
                <span className="font-bold text-sm text-slate-900">{data.subredditName}</span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                Report parameters
              </span>
              <div className="text-xs text-slate-500 space-y-2 leading-relaxed">
                <p>• **Model**: Gemini 3.5 Flash</p>
                <p>• **Context**: {data.postsAnalyzed} high-engagement posts</p>
                <p>• **Scope**: Comprehensive text summarization, topics drivers analysis, and critical opportunities briefing.</p>
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center gap-2 h-12 text-sm font-semibold rounded-full cursor-pointer transition-all ${
                isGenerating 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
                  : "bg-slate-900 text-white hover:bg-black hover:scale-[1.01]"
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Structuring Briefing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Executive Report</span>
                </>
              )}
            </button>
          </div>

          {/* Quick list of saved reports */}
          <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-slate-900" />
              <span>Saved Reports</span>
            </h3>
            
            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {savedReports.length > 0 ? (
                savedReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setReportText(report.content)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors block group"
                  >
                    <span className="block text-xs font-bold text-slate-900 truncate group-hover:text-slate-500">
                      {report.title}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">
                      {report.timestamp}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No saved reports yet. Generate one and click "Save Report" to persist.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Report Reader */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-200 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] min-h-[500px] flex flex-col justify-between">
          {reportText ? (
            <div className="flex flex-col h-full justify-between gap-6">
              {/* Header Action bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Executive Reader
                </span>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-900 transition-all cursor-pointer"
                >
                  {hasSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Saved Successfully</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Briefing</span>
                    </>
                  )}
                </button>
              </div>

              {/* Parsed Markdown Body */}
              <div className="flex-1 overflow-y-auto pr-1 max-h-[580px] prose prose-sm select-text">
                {renderMarkdown(reportText)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-24 space-y-4 flex-1">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-[24px] text-slate-400">
                <FileText className="w-10 h-10" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-lg font-bold text-slate-900">No Briefing Generated</h3>
                <p className="text-sm text-slate-400">
                  Click the "Generate Executive Report" button on the left to analyze and compile a full strategic sentiment report using Gemini.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
