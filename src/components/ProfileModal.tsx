import { useState, useEffect } from "react";
import { X, User, Mail, ShieldAlert, Check, Image as ImageIcon } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  onProfileUpdate: (name: string, email: string, avatarUrl: string) => void;
}

// Beautiful preset avatars
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=120&q=80"
];

export default function ProfileModal({ isOpen, onClose, currentUserEmail, onProfileUpdate }: ProfileModalProps) {
  const [name, setName] = useState<string>("Clara Sterling");
  const [email, setEmail] = useState<string>(currentUserEmail || "clara.sterling@researchlabs.com");
  const [role, setRole] = useState<string>("Senior NLP Research Scientist");
  const [avatarUrl, setAvatarUrl] = useState<string>(AVATAR_PRESETS[0]);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Load from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("tt_profile_name");
    const savedEmail = localStorage.getItem("tt_profile_email");
    const savedRole = localStorage.getItem("tt_profile_role");
    const savedAvatar = localStorage.getItem("tt_profile_avatar");

    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
    if (savedRole) setRole(savedRole);
    if (savedAvatar) setAvatarUrl(savedAvatar);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("tt_profile_name", name);
    localStorage.setItem("tt_profile_email", email);
    localStorage.setItem("tt_profile_role", role);
    localStorage.setItem("tt_profile_avatar", avatarUrl);

    onProfileUpdate(name, email, avatarUrl);

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative bg-white rounded-[32px] max-w-md w-full max-h-[85vh] overflow-y-auto shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-8 flex flex-col justify-between gap-6 border border-slate-200">
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
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">User Profile</h2>
            <p className="text-xs text-slate-400">Configure your Research identity</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 text-sm text-slate-600 py-2">
          
          {/* Avatar Configuration */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt="Selected Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-[1.03]"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="space-y-1.5 text-center w-full">
              <span className="text-xs font-bold text-slate-950 uppercase tracking-wider block">
                Select Profile Avatar
              </span>
              <div className="flex items-center justify-center gap-3 mt-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      avatarUrl === preset ? "border-slate-900 scale-105" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={preset}
                      alt={`Preset ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left block">
                  Custom Image URL
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Enter image web URL..."
                    className="w-full h-9 pl-9 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                  />
                  <ImageIcon className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all text-slate-900"
                />
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Professional Role
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all text-slate-900"
                />
                <ShieldAlert className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all text-slate-900"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
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
                <span>Profile Updated</span>
              </>
            ) : (
              <span>Save & Apply</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
