import React, { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Copy,
  Check,
  Scale,
  Sparkles,
  Vote,
  Building2,
  Search,
  Download,
  FileDown,
  RefreshCw,
  Send,
  FileCheck,
} from "lucide-react";
import { GuidedFlow, SupportedLanguage, ChatMessage, SocietyType } from "../types.ts";
import { UI_TRANSLATIONS } from "../data/translations.ts";
import { extractGrievanceFromConversation } from "../utils/conversationExtractor.ts";
import {
  downloadLetterAsText,
  downloadLetterAsPdf,
  openLetterPrintDialog,
} from "../utils/letterExporter.ts";

interface GuidedFlowModalProps {
  flow: GuidedFlow;
  currentLanguage: SupportedLanguage;
  messages?: ChatMessage[];
  societyType?: SocietyType;
  onClose: () => void;
  onSendToChat?: (summary: string) => void;
}

export const GuidedFlowModal: React.FC<GuidedFlowModalProps> = ({
  flow,
  currentLanguage,
  messages = [],
  societyType,
  onClose,
  onSendToChat,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  // Letter drafting form state - extracted from conversation state
  const [memberName, setMemberName] = useState("");
  const [membershipNo, setMembershipNo] = useState("");
  const [societyName, setSocietyName] = useState("");
  const [districtState, setDistrictState] = useState("");
  const [issue, setIssue] = useState("");
  const [relevantBylaw, setRelevantBylaw] = useState("");
  const [allegationDetails, setAllegationDetails] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [hasDownloadedPdf, setHasDownloadedPdf] = useState(false);
  const [hasDownloadedText, setHasDownloadedText] = useState(false);
  const [showEditFields, setShowEditFields] = useState(false);

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;
  const isHindi = currentLanguage === "hi";

  const currentStep = flow.steps[currentStepIndex];

  const handleSelectOption = (optionValue: string) => {
    const updatedAnswers = { ...answers, [currentStep.id]: optionValue };
    setAnswers(updatedAnswers);

    if (currentStepIndex < flow.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setAnswers({});
    setIsFinished(false);
    setGeneratedLetter(null);
    setShowEditFields(false);
  };

  // Determine outcome based on collected answers
  const computeOutcome = () => {
    if (flow.id === "flow-voting-rights") {
      if (answers["step-share-capital"] === "no" || answers["step-share-capital"] === "partial") {
        return flow.outcomeTemplates.disqualified_arrears;
      }
      if (answers["step-agm-attendance"] === "attended_few" || answers["step-agm-attendance"] === "attended_none") {
        return flow.outcomeTemplates.disqualified_attendance;
      }
      if (answers["step-disqualifications"] === "default") {
        return flow.outcomeTemplates.disqualified_arrears;
      }
      return flow.outcomeTemplates.eligible;
    }

    if (flow.id === "flow-grievance-redressal") {
      if (answers["step-internal-notice"] === "verbal_only") {
        return flow.outcomeTemplates.verbal_warning;
      }
      return flow.outcomeTemplates.eligible;
    }

    if (flow.id === "flow-coop-registration") {
      if (answers["step-promoter-count"] === "promoters_short" || answers["step-promoter-count"] === "same_family") {
        return flow.outcomeTemplates.shortfall;
      }
      return flow.outcomeTemplates.eligible;
    }

    return flow.outcomeTemplates.eligible;
  };

  const outcome = computeOutcome();

  // Core requirement: when flow ends in a grievance, fill letter template from conversation state
  const isGrievanceOutcome =
    flow.id === "flow-grievance-redressal" ||
    Boolean(outcome.canGenerateLetter) ||
    outcome.status !== "eligible";

  // Trigger auto-filling of conversation state whenever the flow reaches completion
  useEffect(() => {
    if (isFinished && isGrievanceOutcome) {
      const extracted = extractGrievanceFromConversation(
        messages,
        answers,
        flow,
        outcome,
        societyType
      );

      setMemberName(extracted.memberName);
      setMembershipNo(extracted.membershipNo);
      setSocietyName(extracted.societyName);
      setDistrictState(extracted.districtState);
      setIssue(extracted.issue);
      setRelevantBylaw(extracted.relevantBylaw);
      setAllegationDetails(extracted.allegationDetails);

      // Automatically draft the petition letter from extracted conversation state
      generatePetitionLetter({
        memberName: extracted.memberName,
        membershipNo: extracted.membershipNo,
        societyName: extracted.societyName,
        districtState: extracted.districtState,
        issue: extracted.issue,
        relevantBylaw: extracted.relevantBylaw,
        allegationDetails: extracted.allegationDetails,
      });
    }
  }, [isFinished]);

  const generatePetitionLetter = async (params: {
    memberName: string;
    membershipNo: string;
    societyName: string;
    districtState: string;
    issue: string;
    relevantBylaw: string;
    allegationDetails: string;
  }) => {
    if (!params.memberName || !params.societyName) return;
    setIsGeneratingLetter(true);

    try {
      const response = await fetch("/api/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberName: params.memberName,
          membershipNo: params.membershipNo,
          societyName: params.societyName,
          societyType: answers["step-society-type"] || societyType || "Cooperative Society",
          districtState: params.districtState,
          complaintType: params.issue,
          bylawCited: params.relevantBylaw,
          allegationDetails: params.allegationDetails,
          language: currentLanguage,
        }),
      });

      const data = await response.json();
      if (data.letterText) {
        setGeneratedLetter(data.letterText);
        return;
      }
    } catch (err) {
      console.warn("Letter generation API failed, using structured template fallback:", err);
    } finally {
      setIsGeneratingLetter(false);
    }

    // High quality client-side fallback if network or server error
    const currentDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const fallbackLetter =
      `DATE: ${currentDate}\n\n` +
      `TO:\n` +
      `The District Deputy Registrar (DDR) / Cooperative Ombudsman,\n` +
      `Cooperative Societies Department, District: ${params.districtState || "District Office"}\n\n` +
      `COPY TO:\n` +
      `The Chairman / Secretary,\n` +
      `${params.societyName}\n\n` +
      `PETITIONER PARTICULARS:\n` +
      `Petitioner: ${params.memberName}\n` +
      `Membership No.: ${params.membershipNo || "On Official Record"}\n` +
      `Cooperative Society: ${params.societyName}\n` +
      `Location: ${params.districtState || "Cooperative District"}\n\n` +
      `SUBJECT: FORMAL STATUTORY GRIEVANCE PETITION UNDER ${params.relevantBylaw.toUpperCase()} REGARDING ${params.issue.toUpperCase()}\n\n` +
      `Respected Authority,\n\n` +
      `I, ${params.memberName}, active member of ${params.societyName} bearing Membership No. ${params.membershipNo || "On Record"}, respectfully submit this statutory petition for immediate administrative intervention:\n\n` +
      `1. PETITIONER STANDING & MEMBERSHIP:\n` +
      `I am a bona fide active member of ${params.societyName} in continuous compliance with all registered bylaws and statutory provisions of the Cooperative Societies Act.\n\n` +
      `2. STATEMENT OF FACTS & INCIDENT DETAILS:\n` +
      `${params.allegationDetails || "The society management has arbitrarily infringed upon statutory member rights in violation of prescribed rules."}\n\n` +
      `3. STATUTORY GROUNDS & BYLAW VIOLATIONS:\n` +
      `- Direct infringement of ${params.relevantBylaw}.\n` +
      `- Violation of democratic governance and dispute redressal mandates under Section 84 & 85A of the Cooperative Societies Act.\n` +
      `- Breach of principles of natural justice and mandatory statutory transparency.\n\n` +
      `4. PRAYER / RELIEF SOUGHT:\n` +
      `In view of the above facts, I humbly pray that your esteemed office may be pleased to:\n` +
      `a) Direct the Society Management to immediately produce the relevant books and records for verification;\n` +
      `b) Order an inquiry under the relevant provisions of the Cooperative Societies Act to remedy this grievance;\n` +
      `c) Issue necessary interim directions safeguarding the Petitioner's active membership rights and entitlements.\n\n` +
      `5. FORMAL VERIFICATION & DECLARATION:\n` +
      `I, ${params.memberName}, do hereby solemnly verify and declare that the contents of this petition are true, accurate, and correct to the best of my knowledge and belief.\n\n` +
      `Respectfully submitted,\n\n` +
      `___________________________\n` +
      `(Signature of Petitioner)\n` +
      `${params.memberName}\n` +
      `Membership No.: ${params.membershipNo || "On Record"}\n` +
      `Place: ${params.districtState || "District Office"}\n` +
      `Date: ${currentDate}\n\n` +
      `ENCLOSURES:\n` +
      `1. Copy of Member Passbook / ID Card\n` +
      `2. Relevant supporting receipts / transaction statements`;

    setGeneratedLetter(fallbackLetter);
    setIsGeneratingLetter(false);
  };

  const handleManualRegenerate = () => {
    generatePetitionLetter({
      memberName,
      membershipNo,
      societyName,
      districtState,
      issue,
      relevantBylaw,
      allegationDetails,
    });
  };

  const handleDownloadTextFile = () => {
    if (!generatedLetter) return;
    setHasDownloadedText(true);
    const safePetitioner = (memberName || "Member").replace(/[^a-zA-Z0-9_\u0900-\u0D7F-]/g, "_");
    const safeSoc = (societyName || "Society").replace(/[^a-zA-Z0-9_\u0900-\u0D7F-]/g, "_");
    const filename = `Grievance_Petition_${safePetitioner}_${safeSoc}.txt`;
    downloadLetterAsText(generatedLetter, filename);
    setTimeout(() => setHasDownloadedText(false), 2500);
  };

  const handleDownloadPdfFile = async () => {
    if (!generatedLetter) return;
    setIsDownloadingPdf(true);
    try {
      const safePetitioner = (memberName || "Member").replace(/[^a-zA-Z0-9_\u0900-\u0D7F-]/g, "_");
      const safeSoc = (societyName || "Society").replace(/[^a-zA-Z0-9_\u0900-\u0D7F-]/g, "_");
      const filename = `Grievance_Petition_${safePetitioner}_${safeSoc}.pdf`;
      await downloadLetterAsPdf(
        {
          memberName: memberName || "Member",
          membershipNo: membershipNo || "On Record",
          societyName: societyName || "Cooperative Society",
          districtState: districtState || "District Office",
          issue: issue || "Statutory Grievance",
          relevantBylaw: relevantBylaw || "Section 84/85A MSCS Act",
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        },
        generatedLetter,
        filename
      );
      setHasDownloadedPdf(true);
      setTimeout(() => setHasDownloadedPdf(false), 2500);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    if (!generatedLetter) return;
    openLetterPrintDialog(generatedLetter, {
      memberName: memberName || "Member",
      membershipNo: membershipNo || "On Record",
      societyName: societyName || "Cooperative Society",
      districtState: districtState || "District Office",
      issue: issue || "Statutory Grievance",
      relevantBylaw: relevantBylaw || "Section 84/85A MSCS Act",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    });
  };

  const handleCopyLetter = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handlePostToChat = () => {
    if (!onSendToChat || !generatedLetter) return;
    const summary =
      `📄 **Official Grievance Petition Drafted & Verified**\n\n` +
      `• **Petitioner:** ${memberName} (Mem: ${membershipNo || "On Record"})\n` +
      `• **Society:** ${societyName}\n` +
      `• **Grievance Issue:** ${issue}\n` +
      `• **Statutory Bylaw Cited:** ${relevantBylaw}\n\n` +
      `\`\`\`\n${generatedLetter}\n\`\`\`\n\n` +
      `*This legal petition has been prepared from conversation state and is ready for filing with the District Deputy Registrar (DDR) / Cooperative Ombudsman.*`;
    onSendToChat(summary);
    onClose();
  };

  const getFlowIcon = () => {
    switch (flow.icon) {
      case "Vote":
        return <Vote className="w-5 h-5 text-amber-500" />;
      case "FileText":
        return <FileText className="w-5 h-5 text-rose-500" />;
      case "Building2":
        return <Building2 className="w-5 h-5 text-sky-500" />;
      case "Search":
        return <Search className="w-5 h-5 text-emerald-500" />;
      default:
        return <Scale className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 flex items-center justify-center flex-shrink-0">
              {getFlowIcon()}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {isHindi && flow.titleHindi ? flow.titleHindi : flow.title}
              </h3>
              <p className="text-xs text-emerald-200 line-clamp-1">{flow.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper Bar */}
        <div className="bg-emerald-50 px-4 sm:px-6 py-2.5 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <span>
              {isFinished ? "Flow Completed" : `Step ${currentStepIndex + 1} of ${flow.steps.length}`}
            </span>
            <div className="w-28 sm:w-36 bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{
                  width: isFinished
                    ? "100%"
                    : `${((currentStepIndex + 1) / flow.steps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Flow</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {!isFinished ? (
            /* Active Question Step */
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Question {currentStepIndex + 1}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  {isHindi && currentStep.questionHindi ? currentStep.questionHindi : currentStep.question}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">{currentStep.description}</p>
              </div>

              {/* Options List */}
              <div className="space-y-2.5 pt-2">
                {currentStep.options.map((option, idx) => {
                  const isSelected = answers[currentStep.id] === option.value;
                  return (
                    <div key={idx} className="space-y-1">
                      <button
                        onClick={() => handleSelectOption(option.value)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold shadow-xs"
                            : "border-gray-200 hover:border-emerald-400 hover:bg-gray-50 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : "border-gray-300 text-gray-400"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-sm font-medium">
                            {isHindi && option.labelHindi ? option.labelHindi : option.label}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>

                      {option.guidanceNote && isSelected && (
                        <div className="ml-8 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200/80 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>{option.guidanceNote}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navigation Back Button */}
              {currentStepIndex > 0 && (
                <div className="pt-3 flex justify-start">
                  <button
                    onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Question</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Outcome & Results View */
            <div className="space-y-5">
              {/* Outcome Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  outcome.status === "eligible"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : outcome.status === "conditional"
                    ? "bg-amber-50 border-amber-300 text-amber-950"
                    : "bg-rose-50 border-rose-300 text-rose-950"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {outcome.status === "eligible" ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base">{outcome.headline}</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">{outcome.details}</p>
                  <div className="mt-2 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Statutory Authority: {outcome.legalGrounding}</span>
                  </div>
                </div>
              </div>

              {/* Actionable Next Steps */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2.5">
                  Mandatory Procedural Steps:
                </h5>
                <ul className="space-y-2 text-xs text-gray-700">
                  {outcome.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 leading-normal">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* GRIEVANCE LETTER SECTION: Auto-filled from conversation state with Downloadable Text & PDF */}
              {isGrievanceOutcome && (
                <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-emerald-500 shadow-sm space-y-4">
                  {/* Title & Conversation Extraction Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm sm:text-base">
                      <FileCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>Formal Statutory Grievance Petition</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Auto-filled from conversation state
                    </span>
                  </div>

                  {/* Summary of Extracted Conversation State */}
                  <div className="bg-emerald-50/70 rounded-lg p-3 border border-emerald-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-emerald-800 font-semibold">Member: </span>
                      <span className="text-gray-900 font-medium">{memberName || "On Record"}</span>
                      {membershipNo && (
                        <span className="text-gray-600 font-normal"> ({membershipNo})</span>
                      )}
                    </div>
                    <div>
                      <span className="text-emerald-800 font-semibold">Society: </span>
                      <span className="text-gray-900 font-medium">{societyName || "Cooperative Society"}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-amber-800 font-semibold">Issue: </span>
                      <span className="text-gray-800">{issue || "Bylaw violation & member rights denial"}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-emerald-900 font-semibold">Bylaw Cited: </span>
                      <span className="text-emerald-950 font-medium">{relevantBylaw}</span>
                    </div>
                  </div>

                  {/* Editable Details Accordion */}
                  <div>
                    <button
                      onClick={() => setShowEditFields(!showEditFields)}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showEditFields ? "Hide Edit Fields" : "Edit / Customize Letter Fields"}</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${showEditFields ? "rotate-90" : ""}`}
                      />
                    </button>

                    {showEditFields && (
                      <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Member Full Name
                            </label>
                            <input
                              type="text"
                              value={memberName}
                              onChange={(e) => setMemberName(e.target.value)}
                              placeholder="e.g. Devidas Patil"
                              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Membership / Passbook No.
                            </label>
                            <input
                              type="text"
                              value={membershipNo}
                              onChange={(e) => setMembershipNo(e.target.value)}
                              placeholder="e.g. DCS/2021/389"
                              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Cooperative Society Name
                            </label>
                            <input
                              type="text"
                              value={societyName}
                              onChange={(e) => setSocietyName(e.target.value)}
                              placeholder="e.g. Samarth Multi-Purpose Co-op Society"
                              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              District & State
                            </label>
                            <input
                              type="text"
                              value={districtState}
                              onChange={(e) => setDistrictState(e.target.value)}
                              placeholder="e.g. Kolhapur, Maharashtra"
                              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Grievance Issue / Subject
                            </label>
                            <input
                              type="text"
                              value={issue}
                              onChange={(e) => setIssue(e.target.value)}
                              placeholder="e.g. Refusal to provide inspection of annual audit reports"
                              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Relevant Statutory Bylaw / Act Section Cited
                            </label>
                            <input
                              type="text"
                              value={relevantBylaw}
                              onChange={(e) => setRelevantBylaw(e.target.value)}
                              placeholder="e.g. Section 106 & 108 Cooperative Societies Act / Rule 14"
                              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Specific Allegation & Incident Details
                            </label>
                            <textarea
                              rows={2}
                              value={allegationDetails}
                              onChange={(e) => setAllegationDetails(e.target.value)}
                              placeholder="Describe the dates, refusal actions, or shortfall details..."
                              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 resize-none"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleManualRegenerate}
                          disabled={!memberName || !societyName || isGeneratingLetter}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${isGeneratingLetter ? "animate-spin" : ""}`}
                          />
                          <span>
                            {isGeneratingLetter ? "Updating Letter..." : "Update & Regenerate Letter"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Generated Letter Preview Card */}
                  {generatedLetter ? (
                    <div className="space-y-3 pt-2">
                      {/* ACTION TOOLBAR: DOWNLOAD AS TEXT OR PDF */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-100 p-2.5 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-700" />
                            <span>Generated Legal Letter</span>
                          </span>
                          <span className="text-[10.5px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            ✓ 1-Page A4 Format
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* DOWNLOAD AS TEXT */}
                          <button
                            onClick={handleDownloadTextFile}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-emerald-600 text-gray-800 hover:text-emerald-800 shadow-2xs transition-colors cursor-pointer"
                            title="Download raw plain text file (.txt)"
                          >
                            {hasDownloadedText ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Download className="w-3.5 h-3.5 text-emerald-700" />
                            )}
                            <span>{hasDownloadedText ? "Downloaded Text!" : "Download Text (.txt)"}</span>
                          </button>

                          {/* DOWNLOAD AS PDF */}
                          <button
                            onClick={handleDownloadPdfFile}
                            disabled={isDownloadingPdf}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white shadow-2xs transition-colors cursor-pointer"
                            title="Download formatted official PDF file (.pdf)"
                          >
                            {isDownloadingPdf ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : hasDownloadedPdf ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <FileDown className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {isDownloadingPdf
                                ? "Generating PDF..."
                                : hasDownloadedPdf
                                ? "Downloaded PDF!"
                                : "Download PDF (.pdf)"}
                            </span>
                          </button>

                          {/* PRINT / BROWSER PDF */}
                          <button
                            onClick={handlePrint}
                            className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg cursor-pointer font-medium"
                            title="Print or Save via Browser dialog"
                          >
                            <Printer className="w-3.5 h-3.5 text-gray-600" />
                            <span className="hidden sm:inline">Print</span>
                          </button>

                          {/* COPY TO CLIPBOARD */}
                          <button
                            onClick={handleCopyLetter}
                            className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg cursor-pointer font-medium"
                            title="Copy text to clipboard"
                          >
                            {copiedLetter ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-600" />
                            )}
                            <span className="hidden sm:inline">
                              {copiedLetter ? "Copied" : "Copy"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Letter Text Box */}
                      <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 max-h-72 overflow-y-auto font-mono text-xs leading-relaxed whitespace-pre-wrap select-all shadow-inner">
                        {generatedLetter}
                      </div>

                      {/* Send to Chat shortcut */}
                      {onSendToChat && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={handlePostToChat}
                            className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Save Letter to Active Chat Conversation</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : isGeneratingLetter ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-emerald-800">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-semibold">
                        Drafting formal grievance petition from conversation state...
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {t.close}
          </button>

          {isFinished && onSendToChat && (
            <button
              onClick={() => {
                onSendToChat(
                  `Completed guided flow for ${flow.title}. Outcome determined: "${outcome.headline}". Bylaw cited: ${relevantBylaw || outcome.legalGrounding}`
                );
                onClose();
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Discuss Result in Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
