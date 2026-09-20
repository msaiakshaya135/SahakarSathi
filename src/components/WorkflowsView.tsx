import React from "react";
import { Vote, FileText, Building2, Search, ArrowRight, ShieldCheck, Clock, CheckCircle2, Scale } from "lucide-react";
import { SupportedLanguage } from "../types.ts";
import { UI_TRANSLATIONS } from "../data/translations.ts";

interface WorkflowsViewProps {
  currentLanguage: SupportedLanguage;
  onOpenFlow: (flowId: string) => void;
  onSelectPrompt: (promptText: string) => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({
  currentLanguage,
  onOpenFlow,
  onSelectPrompt,
}) => {
  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  const workflows = [
    {
      id: "flow-voting-rights",
      title: t.checkVotingBtn,
      category: "Governance & Elections",
      description: "Verify if you qualify as an 'Active Member' entitled to vote under Section 29 of the MSCS Act 2023 and Model Bylaws.",
      statute: "Section 29 MSCS Act 2023 & State Election Rules",
      stepsCount: 4,
      timeEst: "2 mins",
      icon: Vote,
      color: "amber",
      highlights: [
        "Minimum paid-up share capital verification",
        "Mandatory 3-of-5 AGM attendance rule check",
        "Overdue loan arrears & disqualification filter",
        "Remedies for illegal voter list exclusions",
      ],
      suggestedPrompt: "How can I challenge my illegal exclusion from the cooperative society voter list?",
    },
    {
      id: "flow-grievance-redressal",
      title: t.fileGrievanceBtn,
      category: "Legal Dispute & Ombudsman",
      description: "Step-by-step statutory dispute resolution flow under Section 84 & 85A, with automatic formal petition drafting.",
      statute: "Section 84 & 85A (Ombudsman) / Sec 91 Arbitration",
      stepsCount: 4,
      timeEst: "3 mins",
      icon: FileText,
      color: "rose",
      highlights: [
        "Audit refusal, milk fat dispute, or expulsion grounds",
        "15–30 day mandatory internal resolution window",
        "DDR / Ombudsman / Arbitration Court escalation",
        "Instant official A4 petition letter drafting & PDF export",
      ],
      suggestedPrompt: "What is the official procedure to file a grievance against the cooperative society secretary before the DDR?",
    },
    {
      id: "flow-coop-registration",
      title: t.registerCoopBtn,
      category: "Society Formation",
      description: "Step-by-step legal roadmap to register a new Primary, Dairy, FPO, or Multi-State Cooperative Society.",
      statute: "Section 6 & 7 MSCS Act / State Cooperative Societies Act",
      stepsCount: 4,
      timeEst: "3 mins",
      icon: Building2,
      color: "sky",
      highlights: [
        "Minimum promoter threshold (50 for multi-state, 10 for PACS)",
        "Chief Promoter election & Form A statutory documentation",
        "Bank share capital escrow account deposit requirements",
        "Mandatory 60-day statutory registration timeline",
      ],
      suggestedPrompt: "What are the legal steps and minimum member requirements to register a new dairy cooperative society?",
    },
    {
      id: "flow-inspect-books",
      title: t.inspectBooksBtn,
      category: "Audit & Transparency",
      description: "Enforce statutory inspection rights for member register, AGM minutes, and audited financial statements.",
      statute: "Section 106 & 108 MSCS Act 2023 (Right to Information)",
      stepsCount: 3,
      timeEst: "2 mins",
      icon: Search,
      color: "emerald",
      highlights: [
        "Right to inspect audited balance sheet & profit/loss",
        "Access to member register & share transfer records",
        "Certified true copies fee structure (Max ₹5/page)",
        "30-day statutory compliance deadline for Secretary",
      ],
      suggestedPrompt: "What are my legal rights if the cooperative secretary refuses to give me a copy of the audit balance sheet?",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#f4f7f5]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive Statutory State Machines</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Guided Cooperative Action Workflows
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
              Step-by-step procedural decision trees grounded in the Multi-State Co-operative Societies Act 2023, State Acts, and Model Bylaws. Check eligibility, inspect violations, and auto-draft official legal petitions.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="px-4 py-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center">
              <div className="text-lg font-bold text-emerald-900">4</div>
              <div className="text-[11px] font-medium text-emerald-700">Active Workflows</div>
            </div>
            <div className="px-4 py-3 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
              <div className="text-lg font-bold text-amber-900">100%</div>
              <div className="text-[11px] font-medium text-amber-700">Act Grounded</div>
            </div>
          </div>
        </div>

        {/* Workflows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {workflows.map((flow) => {
            const Icon = flow.icon;

            const badgeStyles =
              flow.color === "amber"
                ? "bg-amber-100 text-amber-900 border-amber-200"
                : flow.color === "rose"
                ? "bg-rose-100 text-rose-900 border-rose-200"
                : flow.color === "sky"
                ? "bg-sky-100 text-sky-900 border-sky-200"
                : "bg-emerald-100 text-emerald-900 border-emerald-200";

            const iconBg =
              flow.color === "amber"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : flow.color === "rose"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : flow.color === "sky"
                ? "bg-sky-50 text-sky-700 border-sky-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200";

            return (
              <div
                key={flow.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeStyles}`}>
                        {flow.category}
                      </span>
                      <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {flow.timeEst}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-900 transition-colors">
                    {flow.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {flow.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{flow.statute}</span>
                  </div>

                  <div className="mt-3 space-y-1.5 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Key Verification Points:
                    </div>
                    {flow.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectPrompt(flow.suggestedPrompt)}
                    className="text-left text-xs text-emerald-700 hover:text-emerald-900 hover:underline font-medium truncate"
                    title={flow.suggestedPrompt}
                  >
                    Ask AI: &quot;{flow.suggestedPrompt.substring(0, 38)}...&quot;
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenFlow(flow.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer flex-shrink-0"
                  >
                    <span>Launch Workflow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
