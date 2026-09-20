import React, { useState, useEffect } from "react";
import {
  X,
  FileDown,
  Download,
  Printer,
  Copy,
  Check,
  Sparkles,
  Scale,
  RefreshCw,
  Building2,
  User,
  Hash,
  MapPin,
  FileText,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { SupportedLanguage } from "../types.ts";
import {
  downloadLetterAsPdf,
  downloadLetterAsText,
  openLetterPrintDialog,
  LetterMetadata,
} from "../utils/letterExporter.ts";
import { UI_TRANSLATIONS } from "../data/translations.ts";

export interface PetitionParams {
  memberName: string;
  membershipNo: string;
  societyName: string;
  societyType?: string;
  districtState: string;
  issue: string;
  relevantBylaw: string;
  allegationDetails: string;
}

interface PetitionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialParams: PetitionParams;
  initialLetterText?: string;
  currentLanguage: SupportedLanguage;
}

export const PetitionPreviewModal: React.FC<PetitionPreviewModalProps> = ({
  isOpen,
  onClose,
  initialParams,
  initialLetterText,
  currentLanguage,
}) => {
  const [params, setParams] = useState<PetitionParams>(initialParams);
  const [letterText, setLetterText] = useState<string>(initialLetterText || "");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [downloadedPdf, setDownloadedPdf] = useState<boolean>(false);
  const [downloadedTxt, setDownloadedTxt] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"preview" | "edit_fields">("preview");

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  // Keep state synced when initialParams or initialLetterText change
  useEffect(() => {
    setParams(initialParams);
    if (initialLetterText) {
      setLetterText(initialLetterText);
    } else {
      generateOrFormatLetter(initialParams);
    }
  }, [initialParams, initialLetterText, isOpen]);

  // Construct standard client template
  const buildLocalTemplate = (p: PetitionParams) => {
    const currentDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      `DATE: ${currentDate}\n\n` +
      `TO:\n` +
      `The District Deputy Registrar (DDR) / Cooperative Ombudsman,\n` +
      `Department of Cooperation, District: ${p.districtState || "Cooperative District"}\n\n` +
      `COPY TO:\n` +
      `The Chairman / Secretary,\n` +
      `${p.societyName || "Primary Cooperative Society"}\n\n` +
      `PETITIONER PARTICULARS:\n` +
      `Petitioner: ${p.memberName || "Active Member"}\n` +
      `Membership No.: ${p.membershipNo || "On Official Record"}\n` +
      `Cooperative Society: ${p.societyName || "Primary Cooperative Society"}\n` +
      `Location: ${p.districtState || "Cooperative District"}\n\n` +
      `SUBJECT: FORMAL STATUTORY GRIEVANCE PETITION UNDER ${p.relevantBylaw.toUpperCase()} REGARDING ${p.issue.toUpperCase()}\n\n` +
      `Respected Authority,\n\n` +
      `I, ${p.memberName || "Active Member"}, bona fide member of ${p.societyName || "the society"} bearing Membership No. ${p.membershipNo || "On Record"}, respectfully submit this statutory petition for immediate administrative intervention:\n\n` +
      `1. PETITIONER STANDING & MEMBERSHIP:\n` +
      `I am an active member of ${p.societyName || "the society"} in continuous compliance with registered bylaws and provisions of the Cooperative Societies Act.\n\n` +
      `2. STATEMENT OF FACTS & GRIEVANCE:\n` +
      `${p.allegationDetails || "The society management has arbitrarily infringed upon statutory member rights in violation of prescribed rules."}\n\n` +
      `3. STATUTORY GROUNDS & BYLAW VIOLATIONS:\n` +
      `- Direct infringement of ${p.relevantBylaw || "Section 84 & 85A MSCS Act 2023 / State Cooperative Act"}.\n` +
      `- Infringement of member rights, procedural transparency, and natural justice.\n\n` +
      `4. PRAYER / RELIEF SOUGHT:\n` +
      `In view of the above facts, I humbly pray that your esteemed office may be pleased to:\n` +
      `a) Direct the Society Management to immediately produce the relevant books and records for verification;\n` +
      `b) Order an inquiry / audit under Section 84/85A of the Cooperative Societies Act to remedy this grievance;\n` +
      `c) Issue necessary interim directions safeguarding the Petitioner's active membership rights and entitlements.\n\n` +
      `5. FORMAL VERIFICATION & DECLARATION:\n` +
      `I, ${p.memberName || "Active Member"}, do hereby verify and declare that the contents of this petition are true, accurate, and correct to the best of my knowledge and belief.\n\n` +
      `Respectfully submitted,\n\n` +
      `___________________________\n` +
      `(Signature of Petitioner)\n` +
      `${p.memberName || "Active Member"}\n` +
      `Membership No.: ${p.membershipNo || "On Record"}\n` +
      `Place: ${p.districtState || "District Office"}\n` +
      `Date: ${currentDate}\n\n` +
      `ENCLOSURES:\n` +
      `1. Copy of Member Passbook / ID Card\n` +
      `2. Relevant supporting receipts / transaction records`
    );
  };

  const generateOrFormatLetter = async (currentP: PetitionParams) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberName: currentP.memberName,
          membershipNo: currentP.membershipNo,
          societyName: currentP.societyName,
          societyType: currentP.societyType || "Cooperative Society",
          districtState: currentP.districtState,
          complaintType: currentP.issue,
          bylawCited: currentP.relevantBylaw,
          allegationDetails: currentP.allegationDetails,
          language: currentLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.letterText && data.letterText.trim().length > 100) {
          setLetterText(data.letterText.trim());
          setIsGenerating(false);
          return;
        }
      }
    } catch (err) {
      console.warn("API letter generation failed, using local template:", err);
    }

    setLetterText(buildLocalTemplate(currentP));
    setIsGenerating(false);
  };

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const safeSociety = (params.societyName || "Cooperative").replace(/\s+/g, "_");
      const filename = `Grievance_Petition_${safeSociety}_${Date.now()}.pdf`;

      const metadata: LetterMetadata = {
        memberName: params.memberName || "Active Member",
        membershipNo: params.membershipNo || "On Record",
        societyName: params.societyName || "Cooperative Society",
        societyType: params.societyType,
        districtState: params.districtState || "District Office",
        issue: params.issue || "Statutory Grievance Redressal",
        relevantBylaw: params.relevantBylaw || "Section 84 & 85A MSCS Act 2023",
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };

      await downloadLetterAsPdf(metadata, letterText, filename);
      setDownloadedPdf(true);
      setTimeout(() => setDownloadedPdf(false), 2500);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadTxt = () => {
    const safeSociety = (params.societyName || "Cooperative").replace(/\s+/g, "_");
    const filename = `Grievance_Petition_${safeSociety}_${Date.now()}.txt`;
    downloadLetterAsText(letterText, filename);
    setDownloadedTxt(true);
    setTimeout(() => setDownloadedTxt(false), 2500);
  };

  const handlePrint = () => {
    const metadata: LetterMetadata = {
      memberName: params.memberName || "Active Member",
      membershipNo: params.membershipNo || "On Record",
      societyName: params.societyName || "Cooperative Society",
      societyType: params.societyType,
      districtState: params.districtState || "District Office",
      issue: params.issue || "Statutory Grievance Redressal",
      relevantBylaw: params.relevantBylaw || "Section 84 & 85A MSCS Act 2023",
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
    openLetterPrintDialog(letterText, metadata);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-5 py-4 flex items-center justify-between border-b border-emerald-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 border border-emerald-500/50 flex items-center justify-center flex-shrink-0 text-emerald-200 shadow-inner">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Statutory Grievance Petition Docket
                </h3>
                <span className="hidden sm:inline-block text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  DDR / Ombudsman Official Format
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Multi-State Cooperative Societies Act 2023 & State Cooperative Acts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Preview vs. Edit Particulars) */}
        <div className="px-5 pt-3 pb-2 bg-emerald-50/70 border-b border-emerald-200/80 flex items-center justify-between gap-2 flex-wrap flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-emerald-100/70 border border-gray-200"
              }`}
            >
              📄 Petition Text Preview
            </button>
            <button
              onClick={() => setActiveTab("edit_fields")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "edit_fields"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-emerald-100/70 border border-gray-200"
              }`}
            >
              ✏️ Edit Case Particulars & Bylaws
            </button>
          </div>

          <button
            onClick={() => generateOrFormatLetter(params)}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 hover:border-emerald-500 text-emerald-900 text-xs font-semibold shadow-2xs hover:bg-emerald-50 transition-colors disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Drafting with AI..." : "Regenerate Petition"}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fcfdfc]">
          {activeTab === "edit_fields" ? (
            /* Particulars Form */
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Adjust your member particulars, society name, or legal sections below. Then click <strong>"Apply & Update Petition"</strong> to refresh the draft.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Petitioner Full Name:</span>
                  </label>
                  <input
                    type="text"
                    value={params.memberName}
                    onChange={(e) => setParams({ ...params, memberName: e.target.value })}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Membership Number / Ledger No:</span>
                  </label>
                  <input
                    type="text"
                    value={params.membershipNo}
                    onChange={(e) => setParams({ ...params, membershipNo: e.target.value })}
                    placeholder="e.g. MS-402 or On Record"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Cooperative Society Name:</span>
                  </label>
                  <input
                    type="text"
                    value={params.societyName}
                    onChange={(e) => setParams({ ...params, societyName: e.target.value })}
                    placeholder="e.g. Shree Ram Housing Cooperative Society"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>District & State (Jurisdiction):</span>
                  </label>
                  <input
                    type="text"
                    value={params.districtState}
                    onChange={(e) => setParams({ ...params, districtState: e.target.value })}
                    placeholder="e.g. Mumbai Suburban, Maharashtra"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Statute / Relevant Bylaw Section Cited:</span>
                </label>
                <input
                  type="text"
                  value={params.relevantBylaw}
                  onChange={(e) => setParams({ ...params, relevantBylaw: e.target.value })}
                  placeholder="e.g. Section 106 MSCS Act 2023 / Section 32 MCS Act"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Subject / Core Violation:</span>
                </label>
                <input
                  type="text"
                  value={params.issue}
                  onChange={(e) => setParams({ ...params, issue: e.target.value })}
                  placeholder="e.g. Arbitrary denial of audited financial statements"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Specific Allegation & Facts Narrative:
                </label>
                <textarea
                  rows={4}
                  value={params.allegationDetails}
                  onChange={(e) => setParams({ ...params, allegationDetails: e.target.value })}
                  placeholder="Describe dates, actions, refusals, or notices..."
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-white leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    generateOrFormatLetter(params);
                    setActiveTab("preview");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply & Update Petition Draft</span>
                </button>
              </div>
            </div>
          ) : (
            /* Editable Petition Text Preview */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-600 px-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Official Docket Format (Ready for physical or digital filing)</span>
                </span>
                <span className="text-[11px] text-gray-400">
                  {letterText.split(/\s+/).length} words • {letterText.length} characters
                </span>
              </div>

              {/* Legal Paper Sheet */}
              <div className="relative rounded-xl border-2 border-emerald-200/90 bg-white p-4 sm:p-6 shadow-sm">
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>

                <textarea
                  value={letterText}
                  onChange={(e) => setLetterText(e.target.value)}
                  rows={20}
                  className="w-full text-xs font-mono sm:text-[13px] text-gray-900 bg-transparent border-0 outline-hidden resize-y leading-relaxed"
                  placeholder="Petition text generating..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 sm:px-6 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="font-semibold text-gray-800">
              {params.societyName || "Cooperative Society"}
            </span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="hidden sm:inline text-gray-500">{params.districtState || "Cooperative Jurisdiction"}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
              title="Print or Save via Browser Dialog"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-300 hover:border-emerald-600 text-gray-800 hover:text-emerald-950 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
              title="Download raw plain text file (.txt)"
            >
              {downloadedTxt ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span>{downloadedTxt ? "Downloaded .TXT!" : "Download .TXT"}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-60"
              title="Download high-resolution official A4 PDF petition"
            >
              {isDownloadingPdf ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : downloadedPdf ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>
                {isDownloadingPdf
                  ? "Compiling PDF..."
                  : downloadedPdf
                  ? "Downloaded PDF!"
                  : "Download Official PDF"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
