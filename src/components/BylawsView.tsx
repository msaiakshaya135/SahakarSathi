import React, { useState } from "react";
import { Search, BookOpen, Clock, ShieldAlert, CheckCircle, ArrowRight, Scale } from "lucide-react";
import { COOPERATIVE_KB } from "../data/knowledgeBaseEngine.ts";
import { SocietyType, SupportedLanguage } from "../types.ts";
import { UI_TRANSLATIONS } from "../data/translations.ts";

interface BylawsViewProps {
  currentLanguage: SupportedLanguage;
  societyType: SocietyType;
  onSelectArticleAsPrompt: (prompt: string) => void;
}

export const BylawsView: React.FC<BylawsViewProps> = ({
  currentLanguage,
  societyType,
  onSelectArticleAsPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSociety, setSelectedSociety] = useState<SocietyType>(societyType);

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

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
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#f4f7f5]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Statutory Knowledge Base & Compendium</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Cooperative Acts & Model Bylaws Compendium
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
              Explore primary statutory provisions, legal member protections, election bylaws, and regulatory timelines under the Multi-State Co-operative Societies Act 2023, NDDB Milk Testing Code, and State Acts.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 text-emerald-950 text-xs font-semibold">
            <Scale className="w-4 h-4 text-emerald-700" />
            <span>{COOPERATIVE_KB.length} Verified Statutory Provisions</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by section, keyword (e.g., Section 84, Voting, FAT, Quorum, Ombudsman)..."
                className="w-full text-xs pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 shadow-inner"
              />
            </div>

            {/* Society Filter */}
            <div className="sm:w-64">
              <select
                aria-label="Filter by society type"
                value={selectedSociety}
                onChange={(e) => setSelectedSociety(e.target.value as SocietyType)}
                className="w-full text-xs px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 font-medium text-gray-800"
              >
                <option value="all">All Society Domains</option>
                <option value="dairy">Dairy & Milk Collectives</option>
                <option value="pacs_credit">PACS & Credit Societies</option>
                <option value="fpo">FPO & Agri Cooperatives</option>
                <option value="multistate">Multi-State Societies</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === "all"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Provisions ({COOPERATIVE_KB.length})
            </button>
            <button
              onClick={() => setSelectedCategory("legal_rights")}
              className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === "legal_rights"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Member Legal Rights & Ombudsman
            </button>
            <button
              onClick={() => setSelectedCategory("governance_procedural")}
              className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === "governance_procedural"
                  ? "bg-sky-700 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Governance, AGMs & Bylaws
            </button>
          </div>
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredArticles.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center text-gray-500 text-sm border border-gray-200">
              No statutory provisions found matching &quot;{searchTerm}&quot;. Try searching for general terms like &quot;notice&quot;, &quot;voting&quot;, or &quot;audit&quot;.
            </div>
          ) : (
            filteredArticles.map((art) => (
              <div
                key={art.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border ${
                          art.category === "legal_rights"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : "bg-sky-50 text-sky-800 border-sky-200"
                        }`}
                      >
                        {art.section}
                      </span>
                      <h4 className="font-bold text-gray-900 text-base mt-2">{art.title}</h4>
                      <p className="text-xs text-emerald-800 font-medium">{art.actOrBylaw}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed">{art.content}</p>

                  {/* Key Protected Rights */}
                  {art.keyRights && art.keyRights.length > 0 && (
                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                      <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block mb-1.5">
                        Statutory Member Protections:
                      </span>
                      <ul className="space-y-1">
                        {art.keyRights.map((r, i) => (
                          <li key={i} className="text-xs text-emerald-950 flex items-start gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timelines & Authority */}
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-600 gap-2">
                    {art.statutoryTimelines && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{art.statutoryTimelines}</span>
                      </div>
                    )}
                    {art.escalationAuthority && (
                      <div className="flex items-center gap-1 font-medium text-gray-700">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>Authority: {art.escalationAuthority}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      onSelectArticleAsPrompt(`Explain my statutory rights and remedies under: ${art.title} (${art.section} of ${art.actOrBylaw})`);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gray-50 hover:bg-emerald-800 text-emerald-900 hover:text-white font-semibold text-xs rounded-xl border border-gray-200 hover:border-emerald-800 transition-all cursor-pointer"
                  >
                    <span>Ask AI About This Provision</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
