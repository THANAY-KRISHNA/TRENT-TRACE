import { useState, FormEvent } from "react";
import { Bell, Settings, Search, RefreshCw, Sparkles } from "lucide-react";
import { NavigationTab } from "../types";

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onSearch: (value: string, isSubreddit: boolean) => void;
  isLoading: boolean;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  userAvatar: string;
}

export default function Header({ activeTab, setActiveTab, onSearch, isLoading, onOpenSettings, onOpenProfile, userAvatar }: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;

    // Detect if user is searching for subreddit or keyword
    const isSub = searchVal.trim().startsWith("r/") || /^[a-zA-Z0-9_]+$/.test(searchVal.trim());
    onSearch(searchVal.trim(), isSub);
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 transition-all">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left Section: Logo and Navigation */}
        <div className="flex items-center gap-12">
          <div 
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => {
              setSearchVal("");
              onSearch("", false);
              setActiveTab("Dashboard");
            }}
          >
            <span className="text-2xl font-black font-sans tracking-tight text-slate-900">
              TRENT TRACE
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-2 animate-pulse" />
          </div>

          <nav className="hidden md:flex items-center gap-8 h-20">
            {(["Dashboard", "Analytics", "Reports", "Archives"] as NavigationTab[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative h-20 text-xs font-bold uppercase tracking-wider transition-colors font-sans px-1 flex items-center justify-center cursor-pointer ${
                    isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center/Right Section: Interactive Search Bar */}
        <div className="flex items-center gap-6 flex-1 max-w-md justify-end md:justify-center px-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[280px] lg:max-w-[360px]">
            <input
              type="text"
              placeholder="Search subreddit or keyword..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-10 pl-10 pr-10 text-xs font-semibold tracking-wide font-sans bg-slate-100 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all border border-transparent focus:border-slate-300"
              disabled={isLoading}
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            {searchVal && (
              <button
                type="button"
                onClick={() => setSearchVal("")}
                className="absolute right-4 top-3 text-xs text-slate-400 hover:text-slate-900 font-bold uppercase tracking-wider"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Right Section: System Actions */}
        <div className="flex items-center gap-5">
          <button 
            onClick={() => onSearch(searchVal || "frontpage", true)}
            disabled={isLoading}
            title="Refresh Live Data"
            className="p-2.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-slate-900" : ""}`} />
          </button>
          
          <button className="p-2.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all relative cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-900" />
          </button>

          <button 
            onClick={onOpenSettings}
            className="p-2.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            title="Open Analysis Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile Avatar matching screenshot */}
          <div 
            onClick={onOpenProfile}
            className="flex items-center gap-3 cursor-pointer hover:opacity-95 transition-opacity"
            title="Configure Profile"
          >
            <img
              src={userAvatar}
              alt="User profile"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
