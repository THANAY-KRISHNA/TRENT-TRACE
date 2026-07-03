import { useState } from "react";
import { TrendingUp, Leaf, TrendingDown, Gamepad2, ArrowRight, HelpCircle, Activity, Lightbulb } from "lucide-react";
import { AnalysisResult, SentimentVelocityPoint } from "../types";
import { motion } from "motion/react";

interface DashboardViewProps {
  data: AnalysisResult;
  onReadDocs: () => void;
}

export default function DashboardView({ data, onReadDocs }: DashboardViewProps) {
  const [activeRange, setActiveRange] = useState<"Day" | "Week" | "Month" | "Year">("Week");
  
  // Track selected day in the Sentiment Velocity chart, default to "Fri"
  const defaultSelectedDay = data.sentimentVelocity.find(v => v.day === "Fri") ? "Fri" : data.sentimentVelocity[data.sentimentVelocity.length - 1]?.day || "";
  const [selectedDay, setSelectedDay] = useState<string>(defaultSelectedDay);

  // Helper to get sentiment velocity point for selected day
  const selectedPoint = data.sentimentVelocity.find(v => v.day === selectedDay) || data.sentimentVelocity[0];

  // Helper to format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Maps topics to visual icons matching the brand style
  const getDriverIcon = (topic: string) => {
    const t = topic.toLowerCase();
    if (t.includes("ai") || t.includes("intelligence") || t.includes("tech") || t.includes("software")) {
      return <TrendingUp className="w-5 h-5 text-[#0066CC]" />;
    }
    if (t.includes("energy") || t.includes("solar") || t.includes("green") || t.includes("sustainable") || t.includes("climate")) {
      return <Leaf className="w-5 h-5 text-emerald-600" />;
    }
    if (t.includes("inflation") || t.includes("market") || t.includes("finance") || t.includes("economy") || t.includes("job") || t.includes("burnout")) {
      return <TrendingDown className="w-5 h-5 text-rose-600" />;
    }
    // Default fallback icon
    return <Gamepad2 className="w-5 h-5 text-[#1D1D1F]" />;
  };

  // Class helper for driver bar colors
  const getProgressBarStyles = (sentiment: number) => {
    if (sentiment >= 0.8) {
      return {
        bar: "bg-slate-900",
        text: "text-slate-900"
      };
    } else if (sentiment < 0) {
      return {
        bar: "bg-rose-500",
        text: "text-rose-500"
      };
    } else {
      return {
        bar: "bg-slate-500",
        text: "text-slate-500"
      };
    }
  };

  return (
    <div className="space-y-10 font-sans">
      {/* Hero Section */}
      <div className="text-center py-12 max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-widest rounded-full">
          Real-time Sentiment Audit
        </span>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 select-none">
          {data.subredditName === "Reddit Frontpage" ? "Trent Trace Sentiment" : `${data.subredditName} Analysis`} <span className="text-slate-300">v.1</span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg font-normal leading-relaxed select-none max-w-2xl mx-auto">
          {data.subredditName === "Reddit Frontpage" 
            ? "Decoding public opinion across the front page of the internet using multi-layer transformers." 
            : `Understanding conversations, sentiment vectors and active triggers around "${data.subredditName}".`}
        </p>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            id: "posts-analyzed-metric",
            title: "Posts Analyzed",
            value: formatNumber(data.postsAnalyzed),
            subtitle: data.postsAnalyzed > 1000000 ? "POSTS ANALYZED" : "LIVE SCAN ENTRIES"
          },
          {
            id: "time-horizon-metric",
            title: "Time Horizon",
            value: data.timeHorizon || "30 Days",
            subtitle: "TIME HORIZON"
          },
          {
            id: "subreddits-metric",
            title: "Subreddits",
            value: data.subredditsCount,
            subtitle: "SUBREDDITS"
          },
          {
            id: "accuracy-metric",
            title: "Accuracy",
            value: `${data.accuracy}%`,
            subtitle: "ACCURACY"
          }
        ].map((metric) => (
          <div
            id={metric.id}
            key={metric.title}
            className="bg-white rounded-[32px] border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-transform hover:scale-[1.01]"
          >
            <span className="text-3xl md:text-4xl font-light tracking-tight text-slate-900">
              {metric.value}
            </span>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 mt-2 uppercase">
              {metric.subtitle}
            </span>
          </div>
        ))}
      </div>

      {/* Sentiment Velocity Chart Card */}
      <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-light text-slate-900 tracking-tight">Sentiment Velocity</h2>
            <p className="text-xs text-slate-400">Click on any day to inspect specific metrics</p>
          </div>

          {/* Range toggler */}
          <div className="flex bg-slate-100 p-1 rounded-full">
            {(["Day", "Week", "Month", "Year"] as const).map((range) => {
              const active = activeRange === range;
              return (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    active ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {range}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Visual Bar Chart */}
        <div className="relative pt-16 pb-6 min-h-[220px] flex items-end justify-between px-2 sm:px-10">
          {data.sentimentVelocity.map((point, index) => {
            const isSelected = selectedDay === point.day;
            // Map sentiment score (-1.0 to 1.0) to a positive percentage height (20% to 100%)
            // Let's make sure the min is 25% height so it looks full and gorgeous
            const heightPercent = Math.max(25, Math.round(((point.score + 1) / 2) * 100));

            return (
              <div
                key={point.day}
                onClick={() => setSelectedDay(point.day)}
                className="flex flex-col items-center flex-1 group cursor-pointer max-w-[64px]"
              >
                {/* Sentiment Velocity Value Tooltip above Selected Bar */}
                {isSelected && (
                  <div className="absolute top-0 mb-4 bg-slate-900 text-white text-xs font-bold font-mono px-3 py-1.5 rounded-xl shadow-md flex flex-col items-center animate-fade-in z-10">
                    <span>{point.score > 0 ? `+${point.score.toFixed(2)}` : point.score.toFixed(2)}</span>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-900" />
                  </div>
                )}

                {/* The Bar */}
                <div className="w-full px-2 sm:px-3">
                  <div
                    style={{ height: `${heightPercent}px` }}
                    className={`w-full max-h-[140px] rounded-full transition-all duration-300 ${
                      isSelected
                        ? "bg-slate-900 shadow-[0_4px_12px_rgba(15,23,42,0.2)] scale-y-105"
                        : "bg-slate-200 hover:bg-slate-300"
                    }`}
                  />
                </div>

                {/* Weekday Label */}
                <span
                  className={`text-xs font-bold uppercase tracking-wider mt-4 transition-colors ${
                    isSelected ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900"
                  }`}
                >
                  {point.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Top Sentiment Drivers */}
        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-light text-slate-900 tracking-tight">Top Sentiment Drivers</h2>
            <p className="text-sm text-slate-400 mt-1">
              Active topics contributing most to public perception.
            </p>
          </div>

          <div className="space-y-4 my-4 flex-1 flex flex-col justify-center">
            {data.topDrivers.map((driver) => {
              const styles = getProgressBarStyles(driver.sentiment);
              const scoreString = driver.sentiment > 0 ? `+${driver.sentiment.toFixed(2)}` : driver.sentiment.toFixed(2);
              
              // Calculate horizontal bar width (0-100%)
              const progressWidth = Math.min(100, Math.max(0, Math.abs(driver.sentiment) * 100));

              return (
                <div
                  key={driver.topic}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-colors"
                >
                  {/* Left Topic Name and Icon */}
                  <div className="flex items-center gap-4.5 max-w-[50%]">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
                      {getDriverIcon(driver.topic)}
                    </div>
                    <span className="text-sm font-semibold text-slate-950 truncate" title={driver.topic}>
                      {driver.topic}
                    </span>
                  </div>

                  {/* Right Score and Horizontal Bar */}
                  <div className="flex items-center gap-4 w-[45%] justify-end">
                    <span className={`text-sm font-mono font-bold ${styles.text}`}>
                      {scoreString}
                    </span>
                    <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${progressWidth}%` }}
                        className={`h-full rounded-full ${styles.bar}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3.5 py-2.5 rounded-xl">
            <Lightbulb className="w-4 h-4 text-slate-900" />
            <span>Semantic weights calculated using sentiment density and thread scores.</span>
          </div>
        </div>

        {/* Right Column: Methodology */}
        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-2xl font-light text-slate-900 tracking-tight">Methodology</h2>
            <div className="space-y-4 text-sm text-slate-500 font-normal leading-relaxed">
              <p>{data.methodology}</p>
              <p className="border-t border-slate-100 pt-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                Core Engine Framework
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Language Model</span>
                  <span className="font-bold text-slate-900">Gemini 3.5 Flash</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Vector Confidence</span>
                  <span className="font-bold text-slate-900">Multi-Layer Calibration</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onReadDocs}
            className="w-full flex items-center justify-center gap-2 h-12 bg-slate-900 text-white font-semibold rounded-full hover:bg-black hover:scale-[1.01] transition-all cursor-pointer"
          >
            <span>Read Full Documentation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
