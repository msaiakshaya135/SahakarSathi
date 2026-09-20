import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  FileText,
  ExternalLink,
  Sparkles,
  Download,
  FileDown,
  Printer,
  HelpCircle,
  GitFork,
  ArrowRight,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { ChatMessage, SupportedLanguage, SocietyType } from "../types.ts";
import { UI_TRANSLATIONS, SUPPORTED_LANGUAGES } from "../data/translations.ts";
import {
  downloadLetterAsText,
  downloadLetterAsPdf,
  openLetterPrintDialog,
  LetterMetadata,
} from "../utils/letterExporter.ts";
import {
  extractGrievanceForBotMessage,
} from "../utils/conversationExtractor.ts";
import {
  PetitionPreviewModal,
  PetitionParams,
} from "./PetitionPreviewModal.tsx";

interface MessageItemProps {
  message: ChatMessage;
  previousUserMessage?: ChatMessage;
  allMessages?: ChatMessage[];
  societyType?: SocietyType;
  currentLanguage: SupportedLanguage;
  onOpenFlow?: (workflowId: string) => void;
  onSelectPrompt?: (promptText: string) => void;
  isSpeaking: boolean;
  onSpeak: (messageId: string, text: string, lang: SupportedLanguage) => void;
  onStopSpeak: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  previousUserMessage,
  allMessages = [],
  societyType,
  currentLanguage,
  onOpenFlow,
  onSelectPrompt,
  isSpeaking,
  onSpeak,
  onStopSpeak,
}) => {
  const [copied, setCopied] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [downloadedText, setDownloadedText] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadedPdf, setDownloadedPdf] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  const isBot = message.sender === "bot";
  const routing = message.routing;

  // Check if message directly contains a formal legal grievance petition in codeblock or headers
  const codeBlockMatch = message.text.match(/```(?:text|plain)?\s*([\s\S]*?)```/);
  const detectedPetitionText =
    codeBlockMatch
      ? codeBlockMatch[1].trim()
      : (message.text.includes("TO:") && message.text.includes("SUBJECT:"))
      ? message.text
      : null;

  const [cachedPetitionText, setCachedPetitionText] = useState<string | null>(detectedPetitionText);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Derive parameters from conversation context
  const getEffectiveParams = (): PetitionParams => {
    const extracted = extractGrievanceForBotMessage(message, previousUserMessage, allMessages, societyType);
    return {
      memberName: extracted.memberName,
      membershipNo: extracted.membershipNo,
      societyName: extracted.societyName,
      societyType: extracted.societyType,
      districtState: extracted.districtState,
      issue: extracted.issue,
      relevantBylaw: extracted.relevantBylaw,
      allegationDetails: extracted.allegationDetails,
    };
  };

  // Ensure petition letter is ready (from detected, cache, or AI/template generation)
  const getOrGeneratePetitionText = async (params: PetitionParams): Promise<string> => {
    if (detectedPetitionText) return detectedPetitionText;
    if (cachedPetitionText && cachedPetitionText.trim().length > 100) return cachedPetitionText;

    try {
      const res = await fetch("/api/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberName: params.memberName,
          membershipNo: params.membershipNo,
          societyName: params.societyName,
          societyType: params.societyType,
          districtState: params.districtState,
          complaintType: params.issue,
          bylawCited: params.relevantBylaw,
          allegationDetails: params.allegationDetails,
          language: currentLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.letterText && data.letterText.trim().length > 100) {
          setCachedPetitionText(data.letterText.trim());
          return data.letterText.trim();
        }
      }
    } catch (err) {
      console.warn("API letter generation failed, using structured template fallback:", err);
    }

    const currentDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const fallback =
      `DATE: ${currentDate}\n\n` +
      `TO:\n` +
      `The District Deputy Registrar (DDR) / Cooperative Ombudsman,\n` +
      `Department of Cooperation, District: ${params.districtState || "Cooperative District"}\n\n` +
      `COPY TO:\n` +
      `The Chairman / Secretary,\n` +
      `${params.societyName || "Primary Cooperative Society"}\n\n` +
      `PETITIONER PARTICULARS:\n` +
      `Petitioner: ${params.memberName || "Active Member"}\n` +
      `Membership No.: ${params.membershipNo || "On Official Record"}\n` +
      `Cooperative Society: ${params.societyName || "Primary Cooperative Society"}\n` +
      `Location: ${params.districtState || "Cooperative District"}\n\n` +
      `SUBJECT: FORMAL STATUTORY GRIEVANCE PETITION UNDER ${params.relevantBylaw.toUpperCase()} REGARDING ${params.issue.toUpperCase()}\n\n` +
      `Respected Authority,\n\n` +
      `I, ${params.memberName || "Active Member"}, bona fide member of ${params.societyName || "the society"} bearing Membership No. ${params.membershipNo || "On Record"}, respectfully submit this statutory petition for immediate administrative intervention:\n\n` +
      `1. PETITIONER STANDING & MEMBERSHIP:\n` +
      `I am an active member in continuous compliance with registered bylaws and the provisions of the Cooperative Societies Act.\n\n` +
      `2. STATEMENT OF FACTS & GRIEVANCE:\n` +
      `${params.allegationDetails || "The society management has arbitrarily infringed upon statutory member rights in violation of prescribed rules."}\n\n` +
      `3. STATUTORY GROUNDS & BYLAW VIOLATIONS:\n` +
      `- Direct infringement of ${params.relevantBylaw}.\n` +
      `- Breach of member rights, natural justice, and statutory governance mandates.\n\n` +
      `4. PRAYER / RELIEF SOUGHT:\n` +
      `In view of the above facts, I humbly pray that your esteemed office may be pleased to:\n` +
      `a) Direct the Society Management to immediately produce the relevant books and records for verification;\n` +
      `b) Order an inquiry / audit under Section 84/85A of the Cooperative Societies Act to remedy this grievance;\n` +
      `c) Issue necessary interim directions safeguarding the Petitioner's active membership rights.\n\n` +
      `5. FORMAL VERIFICATION & DECLARATION:\n` +
      `I, ${params.memberName || "Active Member"}, do hereby verify that the contents of this petition are true and correct to the best of my knowledge and belief.\n\n` +
      `Respectfully submitted,\n\n` +
      `___________________________\n` +
      `(Signature of Petitioner)\n` +
      `${params.memberName || "Active Member"}\n` +
      `Membership No.: ${params.membershipNo || "On Record"}\n` +
      `Place: ${params.districtState || "District Office"}\n` +
      `Date: ${currentDate}\n\n` +
      `ENCLOSURES:\n` +
      `1. Copy of Member Passbook / ID Card\n` +
      `2. Relevant supporting receipts / transaction records`;

    setCachedPetitionText(fallback);
    return fallback;
  };

  const handleDownloadTxt = async () => {
    const params = getEffectiveParams();
    const text = await getOrGeneratePetitionText(params);
    setDownloadedText(true);
    const safeSoc = (params.societyName || "Cooperative").replace(/\s+/g, "_");
    const filename = `Grievance_Petition_${safeSoc}_${Date.now()}.txt`;
    downloadLetterAsText(text, filename);
    setTimeout(() => setDownloadedText(false), 2500);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const params = getEffectiveParams();
      const text = await getOrGeneratePetitionText(params);
      const safeSoc = (params.societyName || "Cooperative").replace(/\s+/g, "_");
      const filename = `Grievance_Petition_${safeSoc}_${Date.now()}.pdf`;

      const metadata: LetterMetadata = {
        memberName: params.memberName,
        membershipNo: params.membershipNo,
        societyName: params.societyName,
        societyType: params.societyType,
        districtState: params.districtState,
        issue: params.issue,
        relevantBylaw: params.relevantBylaw,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };

      await downloadLetterAsPdf(metadata, text, filename);
      setDownloadedPdf(true);
      setTimeout(() => setDownloadedPdf(false), 2500);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrintPetition = async () => {
    const params = getEffectiveParams();
    const text = await getOrGeneratePetitionText(params);
    openLetterPrintDialog(text, {
      memberName: params.memberName,
      membershipNo: params.membershipNo,
      societyName: params.societyName,
      societyType: params.societyType,
      districtState: params.districtState,
      issue: params.issue,
      relevantBylaw: params.relevantBylaw,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });
  };

  // Format markdown helper (bold, bullets, sections, Q&A blocks)
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading lines
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-bold text-gray-900 mt-2.5 mb-1 text-sm">
            {line.replace("### ", "")}
          </h4>
        );
      }

      // Next Diagnostic Question Callout block
      if (
        trimmed.toLowerCase().includes("next diagnostic question") ||
        trimmed.includes("मामले का अगला सवाल") ||
        trimmed.toLowerCase().startsWith("**next question") ||
        trimmed.includes("पुढील तपासणी प्रश्न") ||
        trimmed.includes("આગળનો પ્રશ્ન")
      ) {
        return (
          <div
            key={idx}
            className="my-3 p-3 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 shadow-2xs"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900 mb-1">
              <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{replaceBold(trimmed.replace(/^[*_#\s]+/, ""))}</span>
            </div>
          </div>
        );
      }

      // Direct Statutory Answer Section - remove noisy artificial header banner
      if (
        trimmed.toLowerCase().startsWith("**direct answer") ||
        trimmed.toLowerCase().startsWith("**direct statutory answer") ||
        trimmed.toLowerCase().startsWith("direct statutory answer") ||
        trimmed.toLowerCase().startsWith("direct answer") ||
        trimmed.startsWith("**प्रत्यक्ष") ||
        trimmed.startsWith("प्रत्यक्ष") ||
        trimmed.startsWith("**स्पष्ट") ||
        trimmed.startsWith("स्पष्ट") ||
        trimmed.startsWith("**कायदेशीर हक्क") ||
        trimmed.startsWith("कायदेशीर हक्क") ||
        trimmed.startsWith("**कारभार व उपविधी") ||
        trimmed.startsWith("कारभार व उपविधी")
      ) {
        const remainingText = trimmed
          .replace(
            /^\*?\*?(?:direct\s+statutory\s+answer|direct\s+answer|प्रत्यक्ष\s+कानूनी\s+उत्तर|प्रत्यक्ष\s+उत्तर|स्पष्ट\s+उत्तर|कायदेशीर\s+हक्क\s+मूल्यमापन|कारभार\s+व\s+उपविधी\s+कार्यपद्धती)(?:\s*\([^)]*\))?\s*:?\*?\*?\s*/i,
            ""
          )
          .trim();

        if (!remainingText) {
          return null;
        }
        return (
          <p key={idx} className="my-1 text-gray-800 leading-relaxed font-semibold">
            {replaceBold(remainingText)}
          </p>
        );
      }

      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={idx} className="font-semibold text-emerald-950 mt-2 mb-1">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      // Bullet items
      if (line.trim().startsWith("• ") || line.trim().startsWith("- ")) {
        const content = line.trim().substring(2);
        return (
          <div key={idx} className="flex items-start gap-2 ml-2 my-1 text-gray-800">
            <span className="text-emerald-700 font-bold">•</span>
            <span>{replaceBold(content)}</span>
          </div>
        );
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const numMatch = line.trim().match(/^(\d+\.)\s*(.*)$/);
        return (
          <div key={idx} className="flex items-start gap-2 ml-2 my-1 text-gray-800">
            <span className="font-semibold text-emerald-800 text-xs min-w-4">{numMatch?.[1]}</span>
            <span>{replaceBold(numMatch?.[2] || "")}</span>
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="my-1 text-gray-800 leading-relaxed">
          {replaceBold(line)}
        </p>
      );
    });
  };

  const replaceBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-gray-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex w-full mb-4 ${isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 shadow-sm border transition-all duration-200 ${
          isBot
            ? isSpeaking
              ? "bg-amber-50/40 border-amber-400 ring-2 ring-amber-300/80 shadow-md text-gray-900 rounded-tl-sm"
              : "bg-white border-gray-200 text-gray-900 rounded-tl-sm"
            : "bg-emerald-800 text-white border-emerald-700 rounded-tr-sm"
        }`}
      >


        {/* Attached Document Card if user or bot message has one */}
        {message.document && (
          <div
            className={`mb-3 p-2.5 rounded-xl border flex items-center gap-3 ${
              isBot
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                : "bg-emerald-900/60 border-emerald-700 text-white"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isBot ? "bg-emerald-200 text-emerald-900" : "bg-emerald-700 text-emerald-100"
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-xs truncate">{message.document.name}</div>
              <div
                className={`text-[11px] flex items-center gap-2 ${
                  isBot ? "text-emerald-700" : "text-emerald-200"
                }`}
              >
                <span>{Math.round(message.document.size / 1024) || 1} KB</span>
                <span>•</span>
                <span className="uppercase">{message.document.type.split("/")[1] || "Document"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Message Text Content */}
        <div className="text-sm font-normal">
          {isBot ? renderFormattedText(message.text) : <p className="whitespace-pre-wrap">{message.text}</p>}
        </div>

        {/* Action Bar for Grievance Petition: 1-Click Download PDF, TXT, or Custom Preview for any Bot response */}
        {isBot && (
          <div className="mt-3.5 p-3 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-300 rounded-xl shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-emerald-950">
                      {t.petitionDocketTitle || "Statutory Grievance Petition"}
                    </span>
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                      Official Draft
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5 leading-snug">
                    {detectedPetitionText
                      ? "Official legal petition draft ready for immediate submission or printing."
                      : "Download ready-to-file legal petition based on this statutory advice & citations."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-emerald-300 hover:border-emerald-600 text-emerald-900 shadow-2xs transition-colors cursor-pointer"
                  title="Preview, customize member name/society and generate petition"
                >
                  <Edit3 className="w-3 h-3 text-emerald-700" />
                  <span>{t.previewPetitionBtn || "Preview & Edit"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-emerald-600 text-gray-800 hover:text-emerald-900 shadow-2xs transition-colors cursor-pointer"
                  title="Download plain text file (.txt)"
                >
                  {downloadedText ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Download className="w-3 h-3 text-emerald-700" />
                  )}
                  <span>{downloadedText ? "Downloaded Text!" : (t.downloadTxtBtn || "Download .TXT")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                  title="Download formatted official A4 PDF petition"
                >
                  {downloadingPdf ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : downloadedPdf ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <FileDown className="w-3 h-3" />
                  )}
                  <span>
                    {downloadingPdf
                      ? "Compiling PDF..."
                      : downloadedPdf
                      ? "Downloaded PDF!"
                      : (t.downloadPdfBtn || "Download PDF")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPetition}
                  className="flex items-center gap-1 text-[11px] font-medium px-2 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 cursor-pointer"
                  title="Print or Save via Browser dialog"
                >
                  <Printer className="w-3 h-3 text-gray-600" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Guided Flow Shortcut */}
        {isBot && routing?.suggestedWorkflowId && onOpenFlow && (
          <div className="mt-3.5 pt-2.5 border-t border-gray-100">
            <button
              onClick={() => onOpenFlow(routing.suggestedWorkflowId!)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {routing.suggestedWorkflowId === "flow-voting-rights"
                  ? "Launch Step-by-Step Voting Rights Verification"
                  : routing.suggestedWorkflowId === "flow-grievance-redressal"
                  ? "Draft Legal Grievance Petition Letter Now"
                  : "Launch Interactive Procedure Flow"}
              </span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Follow-up Question Prompts */}
        {isBot && message.chainedPrompts && message.chainedPrompts.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-emerald-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 mb-2">
              <GitFork className="w-3.5 h-3.5 text-emerald-600" />
              <span>Next Follow-up Questions:</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {message.chainedPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
                  className="w-full text-left p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/90 border border-emerald-200/90 hover:border-emerald-400 text-emerald-950 text-xs font-medium flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-2xs"
                  title="Click to ask this chained follow-up question"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                      {pIdx + 1}
                    </span>
                    <span className="leading-snug">{prompt}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 group-hover:border-emerald-400 group-hover:bg-emerald-700 group-hover:text-white transition-all flex-shrink-0 shadow-2xs">
                    <span>Ask</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Retrived Citations Accordion */}
        {isBot && message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="flex items-center justify-between w-full text-xs text-emerald-800 font-semibold hover:text-emerald-950 transition-colors py-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                {t.citationsTitle} ({message.citations.length})
              </span>
              {showCitations ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showCitations && (
              <div className="mt-2 space-y-2 text-xs">
                {message.citations.map((cite, i) => (
                  <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                    <div className="flex items-center justify-between font-semibold text-emerald-900 text-xs mb-1">
                      <span>{cite.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {cite.section}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mb-1">{cite.actOrBylaw}</div>
                    <p className="text-gray-600 italic text-[11px] line-clamp-2">"{cite.snippet}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message Footer: Actions & Timestamp */}
        <div className="mt-3 flex items-center justify-between pt-1 border-t border-dashed border-gray-100/60 text-[11px] text-gray-500">
          <span>{message.timestamp}</span>

          {isBot && (
            <div className="flex items-center gap-2">
              {/* Text-to-Speech audio reader */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) {
                    onStopSpeak();
                  } else {
                    onSpeak(message.id, message.text, currentLanguage);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSpeaking
                    ? "bg-rose-100 text-rose-700 border border-rose-300 shadow-xs"
                    : "hover:bg-emerald-50 text-emerald-800 border border-transparent hover:border-emerald-200"
                }`}
                title={isSpeaking ? t.stopAudio : t.listenAudio}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                    <span className="text-rose-700">{t.stopAudio}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t.listenAudio}</span>
                  </>
                )}
              </button>

              {/* Copy message button */}
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <PetitionPreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentLanguage={currentLanguage}
          initialParams={getEffectiveParams()}
          initialLetterText={cachedPetitionText || detectedPetitionText || undefined}
        />
      )}
    </div>
  );
};
