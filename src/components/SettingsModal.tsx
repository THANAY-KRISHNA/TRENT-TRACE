import { useState, useEffect } from "react";
import { X, Settings, Database, Sliders, Shield, Trash2, Check } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearArchives: () => void;
  archivesCount: number;
}

export default function SettingsModal({ isOpen, onClose, onClearArchives, archivesCount }: SettingsModalProps) {
  const [ingestionDepth, setIngestionDepth] = useState<number>(25);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(80);
  const [enableSarcasm, setEnableSarcasm] = useState<boolean>(true);
  const [botFilter, setBotFilter] = useState<boolean>(true);
  const [activeModel, setActiveModel] = useState<string>("gemini-3.5-flash");
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Load settings on open
  useEffect(() => {
    if (isOpen) {
      const savedDepth = localStorage.getItem("tt_settings_ingestion_depth");
      const savedConf = localStorage.getItem("tt_settings_confidence_threshold");
      const savedSarcasm = localStorage.getItem("tt_settings_enable_sarcasm");
      const savedBot = localStorage.getItem("tt_settings_bot_filter");
      const savedModel = localStorage.getItem("tt_settings_active_model");

      if (savedDepth) setIngestionDepth(Number(savedDepth));
      if (savedConf) setConfidenceThreshold(Number(savedConf));
      if (savedSarcasm) setEnableSarcasm(savedSarcasm === "true");
      if (savedBot) setBotFilter(savedBot === "true");
      if (savedModel) setActiveModel(savedModel);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("tt_settings_ingestion_depth", ingestionDepth.toString());
    localStorage.setItem("tt_settings_confidence_threshold", confidenceThreshold.toString());
    localStorage.setItem("tt_settings_enable_sarcasm", enableSarcasm.toString());
    localStorage.setItem("tt_settings_bot_filter", botFilter.toString());
    localStorage.setItem("tt_settings_active_model", activeModel);

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative bg-white rounded-[32px] max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-8 flex flex-col justify-between gap-6 border border-slate-200">
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
            <Settings className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Analysis Settings</h2>
            <p className="text-xs text-slate-400">Calibrate the Trent Trace NLP Sentiment Engine</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 text-sm text-slate-600 py-2">
          {/* Section 1: Ingestion Controls */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-950 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Database className="w-4.5 h-4.5 text-slate-900" />
              <span>Data Ingestion Parameters</span>
            </h3>
            
            <div className="space-y-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-700">Target Ingestion Depth</span>
                  <span className="font-mono text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md">{ingestionDepth} posts</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={ingestionDepth}
                  onChange={(e) => setIngestionDepth(Number(e.target.value))}
                  className="w-full accent-slate-900 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Higher values expand sample integrity but increase NLP execution latency.</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700">Core Language Model</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {["gemini-3.5-flash", "gemini-3.5-pro"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveModel(m)}
                      className={`h-9 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                        activeModel === m
                          ? "bg-slate-900 text-white border-transparent shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {m === "gemini-3.5-flash" ? "3.5 Flash (Balanced)" : "3.5 Pro (Precision)"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Calibration Rules */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-950 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Sliders className="w-4.5 h-4.5 text-slate-900" />
              <span>Linguistic Calibration Weights</span>
            </h3>

            <div className="space-y-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-700 block">Sarcasm & Slang Resolution</span>
                  <p className="text-[10px] text-slate-400">Apply contextual modifiers for community-specific jargon.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableSarcasm}
                    onChange={(e) => setEnableSarcasm(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-700 block">Automated Bot Filtering</span>
                  <p className="text-[10px] text-slate-400">Identify and prune promotional / moderator bot annotations.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={botFilter}
                    onChange={(e) => setBotFilter(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Data & Cache Maintenance */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-950 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Shield className="w-4.5 h-4.5 text-slate-900" />
              <span>Data Retention & Cache</span>
            </h3>

            <div className="flex items-center justify-between p-4 bg-rose-50/50 border border-rose-100 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-rose-950 block">Clear Historical Snapshots</span>
                <p className="text-[10px] text-rose-500 font-medium">Currently storing: {archivesCount} archived analyses.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to permanently clear all local snapshots?")) {
                    onClearArchives();
                  }
                }}
                disabled={archivesCount === 0}
                className="flex items-center gap-1.5 px-3.5 h-9 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Prune Cache</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 h-11 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold rounded-full transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaved}
            className="px-6 h-11 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved Parameters</span>
              </>
            ) : (
              <span>Save & Apply Settings</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
