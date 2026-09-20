import React, { useState } from "react";
import { X, Search, BookOpen, Scale, Clock, ShieldAlert, CheckCircle } from "lucide-react";
import { COOPERATIVE_KB } from "../data/knowledgeBaseEngine.ts";
import { SocietyType, SupportedLanguage } from "../types.ts";
import { UI_TRANSLATIONS } from "../data/translations.ts";

interface BylawsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  onSelectArticleAsPrompt?: (prompt: string) => void;
}

export const BylawsDrawer: React.FC<BylawsDrawerProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectArticleAsPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSociety, setSelectedSociety] = useState<SocietyType>("all");

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  if (!isOpen) return null;

  const filteredArticles = COOPERATIVE_KB.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || art.category === selectedCategory;

    const matchesSociety =
      selectedSociety === "all" || art.applicableSocieties.includes(selectedSociety);

    return matchesSearch && matchesCategory && matchesSociety;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">{t.viewAllBylaws}</h3>
              <p className="text-xs text-emerald-200">
                Statutory Provisions, Model Bylaws & Rights Compendium
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by section, keyword (e.g., Section 84, Voting, FAT, Quorum)..."
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600 shadow-2xs"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-emerald-800 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              All Articles ({COOPERATIVE_KB.length})
            </button>
            <button
              onClick={() => setSelectedCategory("legal_rights")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
                selectedCategory === "legal_rights"
                  ? "bg-rose-700 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              Legal Rights & Ombudsman
            </button>
            <button
              onClick={() => setSelectedCategory("governance_procedural")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
                selectedCategory === "governance_procedural"
                  ? "bg-sky-700 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              Governance & Bylaws
            </button>
          </div>
        </div>

        {/* Article Cards List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              No matching bylaw provisions found for "{searchTerm}".
            </div>
          ) : (
            filteredArticles.map((art) => (
              <div
                key={art.id}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-emerald-500 shadow-2xs transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        art.category === "legal_rights"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      {art.section}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-1">{art.title}</h4>
                    <p className="text-[11px] text-emerald-800 font-medium">{art.actOrBylaw}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">{art.content}</p>

                {/* Key Protected Rights */}
                {art.keyRights && art.keyRights.length > 0 && (
                  <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                      Statutory Rights for Members:
                    </span>
                    <ul className="space-y-1">
                      {art.keyRights.map((r, i) => (
                        <li key={i} className="text-[11px] text-emerald-950 flex items-start gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timelines & Authority */}
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-600 gap-2">
                  {art.statutoryTimelines && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{art.statutoryTimelines}</span>
                    </div>
                  )}
                  {art.escalationAuthority && (
                    <div className="flex items-center gap-1 font-medium text-gray-700">
                      <ShieldAlert className="w-3 h-3 text-rose-600" />
                      <span>Authority: {art.escalationAuthority}</span>
                    </div>
                  )}
                </div>

                {onSelectArticleAsPrompt && (
                  <button
                    onClick={() => {
                      onSelectArticleAsPrompt(`Explain my rights and practical steps regarding: ${art.title} (${art.section})`);
                      onClose();
                    }}
                    className="w-full text-center text-xs font-semibold py-1.5 bg-gray-50 hover:bg-emerald-50 text-emerald-800 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    Ask Chatbot about this Section
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
