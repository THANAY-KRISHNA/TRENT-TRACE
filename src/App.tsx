import { useState, useEffect } from "react";
import { NavigationTab, AnalysisResult, ArchivedAnalysis, SavedReport } from "./types";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import AnalyticsView from "./components/AnalyticsView";
import ReportsView from "./components/ReportsView";
import ArchivesView from "./components/ArchivesView";
import MethodologyModal from "./components/MethodologyModal";
import SettingsModal from "./components/SettingsModal";
import ProfileModal from "./components/ProfileModal";
import { Activity, Sparkles, RefreshCw, AlertTriangle, ExternalLink } from "lucide-react";

// Default High-Fidelity Mock Data matching the screenshot exactly for initial render
const initialMockData: AnalysisResult = {
  subredditName: "Reddit Frontpage",
  postsAnalyzed: 1200000,
  timeHorizon: "30 Days",
  subredditsCount: 142,
  accuracy: 84,
  overallSentiment: 0.54,
  sentimentVelocity: [
    { day: "Mon", score: 0.22 },
    { day: "Tue", score: 0.48 },
    { day: "Wed", score: 0.35 },
    { day: "Thu", score: 0.62 },
    { day: "Fri", score: 0.91 },
    { day: "Sat", score: 0.54 },
    { day: "Sun", score: 0.38 }
  ],
  topDrivers: [
    { topic: "Artificial Intelligence", sentiment: 0.88 },
    { topic: "Sustainable Energy", sentiment: 0.62 },
    { topic: "Market Inflation", sentiment: -0.45 },
    { topic: "Cloud Gaming", sentiment: 0.54 }
  ],
  methodology: "Our sentiment engine leverages a proprietary Natural Language Processing (NLP) model trained on over 500 million Reddit comments. Unlike generic models, ours is fine-tuned to recognize community-specific slang, sarcasm, and technical jargon. Data is sourced via the Reddit API in real-time, focusing on high-engagement threads within top-tier subreddits. We apply a multi-layer filtering process to exclude bot activity and promotional content, ensuring high data integrity.",
  summary: "Public sentiment is generally optimistic, heavily driven by advancements in artificial intelligence and clean energy, though offset by persistent concerns regarding inflation in major market subreddits.",
  posts: [
    {
      title: "Generative AI is shifting how engineers write code faster than expected",
      sentiment: 0.85,
      reason: "Highly positive reaction with technical enthusiasm and productivity proof points.",
      score: 18200,
      comments: 2450
    },
    {
      title: "Why solar and wind energy storage technologies are scaling in 2026",
      sentiment: 0.78,
      reason: "Pragmatic excitement around cost reduction and utility scale-ups.",
      score: 12500,
      comments: 980
    },
    {
      title: "Inflation hits another 5-year high: how are you adapting?",
      sentiment: -0.68,
      reason: "Heavy anxiety, frustration about prices, and negative economic outlook.",
      score: 9500,
      comments: 4200
    },
    {
      title: "Cloud gaming is finally getting good with lower latency protocols",
      sentiment: 0.54,
      reason: "General satisfaction with minor complaints about subscription costs.",
      score: 6200,
      comments: 880
    },
    {
      title: "Is anyone else feeling completely burnt out by the current job market?",
      sentiment: -0.82,
      reason: "Overwhelmingly negative posts with personal distress and economic fatigue.",
      score: 14300,
      comments: 3100
    },
    {
      title: "New open-source LLM beats proprietary models in coding benchmarks",
      sentiment: 0.92,
      reason: "Enthusiastic responses endorsing open collaboration and developer autonomy.",
      score: 22000,
      comments: 1540
    }
  ]
};

// Seed archives so the page has interesting starter history
const initialArchives: ArchivedAnalysis[] = [
  {
    id: "arch-1",
    timestamp: "7/2/2026, 4:22:15 PM",
    subredditName: "r/science",
    overallSentiment: 0.65,
    postsAnalyzed: 18,
    data: {
      ...initialMockData,
      subredditName: "r/science",
      overallSentiment: 0.65,
      posts: initialMockData.posts.slice(0, 3)
    }
  },
  {
    id: "arch-2",
    timestamp: "7/1/2026, 11:05:40 AM",
    subredditName: "r/gaming",
    overallSentiment: 0.15,
    postsAnalyzed: 15,
    data: {
      ...initialMockData,
      subredditName: "r/gaming",
      overallSentiment: 0.15,
      posts: initialMockData.posts.slice(3, 6)
    }
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>("Dashboard");
  const [analysisData, setAnalysisData] = useState<AnalysisResult>(initialMockData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDocOpen, setIsDocOpen] = useState<boolean>(false);

  // Modals and Profile State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [userAvatar, setUserAvatar] = useState<string>("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80");
  const [userName, setUserName] = useState<string>("Clara Sterling");
  const [userEmail, setUserEmail] = useState<string>("thanaykrishna2255@gmail.com");

  // Persistence States
  const [archives, setArchives] = useState<ArchivedAnalysis[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);

  // System Loading Phrases for modern, reassuring UX
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const loadingPhrases = [
    "Contacting unauthenticated public Reddit JSON API...",
    "Retrieving high-engagement hot submission streams...",
    "Structuring textual inputs for semantic processing...",
    "Instantiating Gemini NLP Sentiment Engine...",
    "Resolving slang weights and community sarcasm parameters...",
    "Compiling dashboard metrics and final trend reports..."
  ];

  // Rotate loading phrases
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 2500);
    } else {
      setLoadingPhraseIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Load from LocalStorage
  useEffect(() => {
    const savedArch = localStorage.getItem("sentira_archives");
    const savedReps = localStorage.getItem("sentira_saved_reports");
    const savedAvatar = localStorage.getItem("tt_profile_avatar");
    const savedName = localStorage.getItem("tt_profile_name");
    const savedEmail = localStorage.getItem("tt_profile_email");

    if (savedArch) {
      setArchives(JSON.parse(savedArch));
    } else {
      setArchives(initialArchives);
      localStorage.setItem("sentira_archives", JSON.stringify(initialArchives));
    }

    if (savedReps) {
      setSavedReports(JSON.parse(savedReps));
    }

    if (savedAvatar) {
      setUserAvatar(savedAvatar);
    }
    if (savedName) {
      setUserName(savedName);
    }
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
  }, []);

  // Search Submission Handler
  const handleSearch = async (value: string, isSubreddit: boolean) => {
    setErrorMsg(null);
    
    // Clear search and restore default
    if (!value) {
      setAnalysisData(initialMockData);
      setActiveTab("Dashboard");
      return;
    }

    setIsLoading(true);
    try {
      const payload = isSubreddit ? { subreddit: value } : { query: value };
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Model request failed with status ${response.status}`);
      }

      const result: AnalysisResult = await response.json();
      setAnalysisData(result);

      // Create and save to Archive list automatically
      const newArchiveItem: ArchivedAnalysis = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleString(),
        subredditName: result.subredditName,
        overallSentiment: result.overallSentiment,
        postsAnalyzed: result.postsAnalyzed,
        data: result
      };

      const updatedArchives = [newArchiveItem, ...archives];
      setArchives(updatedArchives);
      localStorage.setItem("sentira_archives", JSON.stringify(updatedArchives));

      // Route to active view
      setActiveTab("Dashboard");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to contact Sentiment Engine. Please check your network and Gemini API keys.");
    } finally {
      setIsLoading(false);
    }
  };

  // Archive Event Handlers
  const handleLoadArchive = (arch: ArchivedAnalysis) => {
    setAnalysisData(arch.data);
    setActiveTab("Dashboard");
  };

  const handleDeleteArchive = (id: string) => {
    const filtered = archives.filter(a => a.id !== id);
    setArchives(filtered);
    localStorage.setItem("sentira_archives", JSON.stringify(filtered));
  };

  const handleClearAllArchives = () => {
    if (confirm("Are you sure you want to permanently clear your historical snapshots archive?")) {
      setArchives([]);
      localStorage.removeItem("sentira_archives");
    }
  };

  // Report Event Handlers
  const handleSaveReport = (newReport: SavedReport) => {
    const updated = [newReport, ...savedReports];
    setSavedReports(updated);
    localStorage.setItem("sentira_saved_reports", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-between font-sans selection:bg-slate-900/10 selection:text-slate-900">
      
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearch={handleSearch}
        isLoading={isLoading}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        userAvatar={userAvatar}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-[1440px] w-full mx-auto px-6 py-10">
        
        {/* Floating Error Alert Toast */}
        {errorMsg && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-fade-in text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="flex-1 flex justify-between items-center gap-4">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="text-xs underline font-bold cursor-pointer hover:opacity-80">Dismiss</button>
            </div>
          </div>
        )}

        {/* Global Loading Screen */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center animate-fade-in max-w-md mx-auto">
            <div className="relative flex items-center justify-center">
              {/* Spinning primary ring */}
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
              <Activity className="absolute w-6 h-6 text-slate-900 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-slate-900 animate-pulse" />
                <span>Running NLP Engine</span>
              </h3>
              <p className="text-sm text-slate-400 font-medium min-h-[40px] transition-all duration-500">
                {loadingPhrases[loadingPhraseIndex]}
              </p>
            </div>
          </div>
        ) : (
          /* Render Tab Views dynamically based on state */
          <div className="transition-all">
            {activeTab === "Dashboard" && (
              <DashboardView
                data={analysisData}
                onReadDocs={() => setIsDocOpen(true)}
              />
            )}
            
            {activeTab === "Analytics" && (
              <AnalyticsView data={analysisData} />
            )}

            {activeTab === "Reports" && (
              <ReportsView
                data={analysisData}
                onSaveReport={handleSaveReport}
                savedReports={savedReports}
              />
            )}

            {activeTab === "Archives" && (
              <ArchivesView
                archives={archives}
                onLoadArchive={handleLoadArchive}
                onDeleteArchive={handleDeleteArchive}
                onClearAll={handleClearAllArchives}
              />
            )}
          </div>
        )}
      </main>

      {/* Global Methodology Documentation Modal */}
      <MethodologyModal
        isOpen={isDocOpen}
        onClose={() => setIsDocOpen(false)}
      />

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearArchives={() => {
          setArchives([]);
          localStorage.removeItem("sentira_archives");
        }}
        archivesCount={archives.length}
      />

      {/* Global Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUserEmail={userEmail}
        onProfileUpdate={(name, email, avatar) => {
          setUserName(name);
          setUserEmail(email);
          setUserAvatar(avatar);
        }}
      />

      {/* Footer styled exactly like the screenshot with Clean Minimalism style */}
      <footer className="border-t border-slate-200 bg-white text-xs text-slate-400 py-8 mt-12 select-none">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-normal">
            © 2026 Trent Trace Research Labs. Data sourced from Reddit API.
          </p>
          <div className="flex items-center gap-6 font-medium">
            <button onClick={() => setIsDocOpen(true)} className="hover:text-slate-900 transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => setIsDocOpen(true)} className="hover:text-slate-900 transition-colors cursor-pointer">Terms of Service</button>
            <button onClick={() => setIsDocOpen(true)} className="hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-0.5">
              <span>API Documentation</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
