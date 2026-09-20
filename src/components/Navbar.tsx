import React from "react";
import {
  BookOpen,
  Globe,
  Scale,
  MessageSquare,
  FileSearch,
  Layers,
  Building2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ActiveAppView, SocietyType, SupportedLanguage } from "../types.ts";
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from "../data/translations.ts";

interface NavbarProps {
  activeView: ActiveAppView;
  onViewChange: (view: ActiveAppView) => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  societyType: SocietyType;
  onSocietyTypeChange: (type: SocietyType) => void;
  onOpenFlow: (flowId: string) => void;
  isAudioPlaying?: boolean;
  onStopAudio?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onViewChange,
  currentLanguage,
  onLanguageChange,
  societyType,
  onSocietyTypeChange,
  isAudioPlaying,
  onStopAudio,
}) => {
  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  const navItems = [
    {
      id: "chat" as ActiveAppView,
      label: "Advisory Chat",
      icon: MessageSquare,
    },
    {
      id: "workflows" as ActiveAppView,
      label: "Guided Workflows",
      icon: Layers,
      badge: "4 Flows",
    },
    {
      id: "documents" as ActiveAppView,
      label: "Document Audit",
      icon: FileSearch,
    },
    {
      id: "bylaws" as ActiveAppView,
      label: "Bylaws Compendium",
      icon: BookOpen,
    },
  ];

  return (
    <header className="bg-emerald-900 text-white shadow-md border-b border-emerald-800/90 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Main Bar */}
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Name */}
          <button
            type="button"
            onClick={() => onViewChange("chat")}
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-emerald-950 flex items-center justify-center font-bold shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Sahakar Sathi
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                  Legal AI
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 font-normal leading-tight">
                Cooperative Rights & Bylaws Companion
              </p>
            </div>
          </button>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-emerald-950/60 p-1 rounded-xl border border-emerald-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  type="button"
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-amber-500 text-emerald-950 shadow-sm"
                      : "text-emerald-100 hover:text-white hover:bg-emerald-800/70"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-emerald-950 text-amber-300"
                          : "bg-emerald-800 text-emerald-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Domain & Language & Audio */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Audio Indicator if speaking */}
            {isAudioPlaying && onStopAudio && (
              <button
                type="button"
                onClick={onStopAudio}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold animate-pulse transition-colors cursor-pointer"
                title="Stop Audio Read-Aloud"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Stop Audio</span>
              </button>
            )}

            {/* Society Type Selector */}
            <div className="flex items-center gap-1.5 bg-emerald-950/70 px-2.5 py-1.5 rounded-lg border border-emerald-700/60 text-xs">
              <Building2 className="w-3.5 h-3.5 text-emerald-300 hidden sm:inline" />
              <select
                id="society-type-select"
                aria-label={t.societyFilter}
                value={societyType}
                onChange={(e) => onSocietyTypeChange(e.target.value as SocietyType)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="all" className="bg-emerald-900 text-white">{t.allSocieties}</option>
                <option value="dairy" className="bg-emerald-900 text-white">{t.dairySocieties}</option>
                <option value="pacs_credit" className="bg-emerald-900 text-white">{t.pacsSocieties}</option>
                <option value="fpo" className="bg-emerald-900 text-white">{t.fpoSocieties}</option>
                <option value="multistate" className="bg-emerald-900 text-white">{t.multistateSocieties}</option>
              </select>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-emerald-950/70 px-2.5 py-1.5 rounded-lg border border-emerald-700/60 text-xs">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <select
                id="language-select"
                aria-label="Select language"
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-emerald-900 text-white">
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-between gap-1 pb-2.5 overflow-x-auto no-scrollbar border-t border-emerald-800/60 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-emerald-950 font-bold"
                    : "text-emerald-100 bg-emerald-800/50 hover:bg-emerald-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
