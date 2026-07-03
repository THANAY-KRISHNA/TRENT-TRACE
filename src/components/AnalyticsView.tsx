import { useState } from "react";
import { MessageSquare, ThumbsUp, ExternalLink, HelpCircle, AlertCircle, Sparkles, Filter } from "lucide-react";
import { AnalysisResult, AnalyzedPost } from "../types";

interface AnalyticsViewProps {
  data: AnalysisResult;
}

export default function AnalyticsView({ data }: AnalyticsViewProps) {
  const [sentimentFilter, setSentimentFilter] = useState<"All" | "Positive" | "Neutral" | "Negative">("All");

  // Helper to determine text and color themes for individual sentiments
  const getPostSentimentBadge = (score: number) => {
    if (score >= 0.25) {
      return {
        bg: "bg-slate-900/10 text-slate-900",
        label: `Positive (${score > 0 ? "+" : ""}${score.toFixed(2)})`
      };
    } else if (score <= -0.25) {
      return {
        bg: "bg-rose-50 text-rose-600",
        label: `Negative (${score.toFixed(2)})`
      };
    } else {
      return {
        bg: "bg-slate-100 text-slate-600",
        label: `Neutral (${score > 0 ? "+" : ""}${score.toFixed(2)})`
      };
    }
  };

  // Filter posts based on selector
  const filteredPosts = data.posts.filter((post) => {
    if (sentimentFilter === "All") return true;
    if (sentimentFilter === "Positive") return post.sentiment >= 0.25;
    if (sentimentFilter === "Negative") return post.sentiment <= -0.25;
    if (sentimentFilter === "Neutral") return post.sentiment > -0.25 && post.sentiment < 0.25;
    return true;
  });

  // Calculate totals
  const totalPostsCount = data.posts.length;
  const positivePostsCount = data.posts.filter(p => p.sentiment >= 0.25).length;
  const negativePostsCount = data.posts.filter(p => p.sentiment <= -0.25).length;
  const neutralPostsCount = totalPostsCount - positivePostsCount - negativePostsCount;

  const posPct = Math.round((positivePostsCount / totalPostsCount) * 100) || 0;
  const negPct = Math.round((negativePostsCount / totalPostsCount) * 100) || 0;
  const neuPct = totalPostsCount > 0 ? 100 - posPct - negPct : 0;

  // Sentiment pointer position on scale (-1.0 to +1.0 maps to 0% to 100%)
  const meterPointerPercentage = Math.round(((data.overallSentiment + 1) / 2) * 100);

  // Helper to format scores
  const formatCompact = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  return (
    <div className="space-y-8 font-sans animate-fade-in">
      {/* Title Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Sentiment Deep Dive
        </h1>
        <p className="text-slate-400 text-sm">
          Granular breakdown of parsed content and AI-annotated posts.
        </p>
      </div>

      {/* Sentiment Density Meter and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Sentiment Scale */}
        <div className="lg:col-span-1 bg-white rounded-[32px] border border-slate-200 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Overall Density Scale</h2>
            <p className="text-xs text-slate-400">Average community mood vector</p>
          </div>

          <div className="space-y-4 py-4 flex-1 flex flex-col justify-center">
            {/* Big Sentiment Number */}
            <div className="text-center">
              <span className="text-5xl font-light tracking-tight text-slate-900">
                {data.overallSentiment > 0 ? `+${data.overallSentiment.toFixed(2)}` : data.overallSentiment.toFixed(2)}
              </span>
              <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-2">
                {data.overallSentiment >= 0.25 ? "Optimistic Mood" : data.overallSentiment <= -0.25 ? "Critical Mood" : "Balanced Mood"}
              </span>
            </div>

            {/* Slider Meter */}
            <div className="relative pt-6">
              <div className="w-full h-1.5 bg-gradient-to-r from-rose-500 via-slate-200 to-slate-900 rounded-full" />
              {/* Floating Pointer */}
              <div
                style={{ left: `${meterPointerPercentage}%` }}
                className="absolute top-4.5 -translate-x-1/2 w-5 h-5 bg-white border-2 border-slate-900 rounded-full shadow-md transition-all duration-500 flex items-center justify-center"
              >
                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
              </div>

              {/* Labels below scale */}
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2">
                <span>Negative (-1.0)</span>
                <span>Neutral (0.0)</span>
                <span>Positive (+1.0)</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2">
            <AlertCircle className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
            <span>This score reflects average weighting of engagement multipliers like comments and upvote-ratio.</span>
          </div>
        </div>

        {/* Sentiment Distribution Card */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-200 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Distribution breakdown</h2>
            <p className="text-xs text-slate-400">Relative proportions of post sentiment categories</p>
          </div>

          <div className="space-y-6 my-4 flex-1 flex flex-col justify-center">
            {/* Visual Bar Breakdown */}
            <div className="w-full h-6 flex rounded-full overflow-hidden text-white font-mono text-[9px] font-bold shadow-inner">
              {posPct > 0 && (
                <div
                  style={{ width: `${posPct}%` }}
                  className="bg-slate-900 flex items-center justify-center transition-all duration-500 hover:opacity-90"
                  title={`Positive: ${posPct}%`}
                >
                  {posPct >= 10 && `${posPct}%`}
                </div>
              )}
              {neuPct > 0 && (
                <div
                  style={{ width: `${neuPct}%` }}
                  className="bg-slate-400 flex items-center justify-center transition-all duration-500 hover:opacity-90"
                  title={`Neutral: ${neuPct}%`}
                >
                  {neuPct >= 10 && `${neuPct}%`}
                </div>
              )}
              {negPct > 0 && (
                <div
                  style={{ width: `${negPct}%` }}
                  className="bg-rose-500 flex items-center justify-center transition-all duration-500 hover:opacity-90"
                  title={`Negative: ${negPct}%`}
                >
                  {negPct >= 10 && `${negPct}%`}
                </div>
              )}
            </div>

            {/* Proportional Grid Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Positive</span>
                  <span className="text-lg font-bold text-slate-900">{positivePostsCount}</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Neutral</span>
                  <span className="text-lg font-bold text-slate-900">{neutralPostsCount}</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Negative</span>
                  <span className="text-lg font-bold text-slate-900">{negativePostsCount}</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Data computed directly across the top <span className="font-bold text-slate-900">{totalPostsCount}</span> high-impact submissions.
          </div>
        </div>
      </div>

      {/* Analyzed Posts List */}
      <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-light text-slate-900 tracking-tight">Analyzed Submissions</h2>
            <p className="text-sm text-slate-400">Browse annotated threads and AI NLP reasoning</p>
          </div>

          {/* Filter Toolbar */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-full">
              {(["All", "Positive", "Neutral", "Negative"] as const).map((filter) => {
                const active = sentimentFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setSentimentFilter(filter)}
                    className={`px-4 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                      active ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* List of Posts */}
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, idx) => {
              const theme = getPostSentimentBadge(post.sentiment);
              return (
                <div
                  key={idx}
                  className="p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] flex flex-col justify-between gap-4 animate-fade-in"
                >
                  {/* Top line: Title & Sentiment Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 leading-snug flex-1">
                      {post.title}
                    </h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${theme.bg} text-center`}>
                      {theme.label}
                    </span>
                  </div>

                  {/* AI Reasoning Text */}
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl border-l-4 border-l-slate-900 flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed">
                    <Sparkles className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">AI Interpretation: </span>
                      {post.reason}
                    </div>
                  </div>

                  {/* Bottom line: Metrics and Hotlinks */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-4.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {formatCompact(post.score)}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {formatCompact(post.comments)}
                      </span>
                    </div>

                    {post.url ? (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-slate-900 hover:underline"
                      >
                        <span>View on Reddit</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] italic text-slate-400">Ingested Live Stream Feed</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <p className="text-sm font-medium">No submissions match the selected filter.</p>
              <p className="text-xs">Try selecting a different sentiment categories filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
