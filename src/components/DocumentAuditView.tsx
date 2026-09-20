import React, { useState, useRef } from "react";
import {
  FileUp,
  Upload,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  ShieldCheck,
  Scale,
  FileSearch,
  BookOpen,
} from "lucide-react";
import { SupportedLanguage, UploadedDocument } from "../types.ts";
import { UI_TRANSLATIONS } from "../data/translations.ts";
import { SAMPLE_DOCUMENTS, SampleDocumentPreset } from "../data/sampleDocuments.ts";

interface DocumentAuditViewProps {
  currentLanguage: SupportedLanguage;
  onAuditDocument: (doc: UploadedDocument, prompt?: string) => void;
  onOpenFlow?: (flowId: string) => void;
}

export const DocumentAuditView: React.FC<DocumentAuditViewProps> = ({
  currentLanguage,
  onAuditDocument,
  onOpenFlow,
}) => {
  const [activeDoc, setActiveDoc] = useState<UploadedDocument | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  const handleProcessFile = (file: File) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert("File size exceeds 20MB limit. Please upload a smaller document.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(",")[1] || "";

      if (file.type.includes("text") || file.name.endsWith(".txt")) {
        const textReader = new FileReader();
        textReader.onload = () => {
          const textContent = (textReader.result as string) || "";
          setActiveDoc({
            name: file.name,
            type: file.type || "text/plain",
            size: file.size,
            dataUrl,
            base64Data,
            textExcerpt: textContent.substring(0, 1500),
          });
        };
        textReader.readAsText(file);
      } else {
        setActiveDoc({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          dataUrl,
          base64Data,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
    if (e.target) e.target.value = "";
  };

  const handleSelectPreset = (preset: SampleDocumentPreset) => {
    setActiveDoc(preset.document);
    setCustomPrompt(preset.suggestedPrompt);
  };

  const handleTriggerAudit = () => {
    if (!activeDoc) return;
    onAuditDocument(activeDoc, customPrompt || `Audit this document (${activeDoc.name}) for legal compliance and statutory defects.`);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#f4f7f5]">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
        className="hidden"
        id="audit-studio-file-input"
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-semibold">
              <FileSearch className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Statutory Document Inspection Studio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Audit Cooperative Notices, Slips & Balance Sheets
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
              Upload AGM notices, dairy milk slips, show cause letters, or audited balance sheets. The AI cross-checks each clause against statutory timelines, natural justice principles, and model bylaws.
            </p>
          </div>

          <button
            type="button"
            id="audit-studio-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex-shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Main 2-Column Inspection Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload Target & Active Document */}
          <div className="lg:col-span-7 space-y-4">
            {/* Drag & Drop Card */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleProcessFile(file);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
                isDraggingOver
                  ? "border-emerald-500 bg-emerald-50/80"
                  : activeDoc
                  ? "border-emerald-300 bg-white"
                  : "border-gray-300 bg-white hover:border-emerald-400"
              }`}
            >
              {!activeDoc ? (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto">
                    <FileUp className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Drag & Drop Document Here or Browse
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Supports PDF, Scanned Images (JPG/PNG), TXT, and Word documents up to 20MB.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Select File from Device
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Document Selected */
                <div className="space-y-4 text-left">
                  <div className="flex items-start justify-between gap-3 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 truncate">
                          {activeDoc.name}
                        </h4>
                        <p className="text-xs text-emerald-800">
                          {Math.round(activeDoc.size / 1024) || 1} KB • {activeDoc.type || "Cooperative Document"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveDoc(null);
                        setCustomPrompt("");
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove document"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {activeDoc.textExcerpt && (
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs text-gray-700 max-h-48 overflow-y-auto font-mono leading-relaxed whitespace-pre-wrap">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 font-sans">
                        Document Excerpt:
                      </div>
                      {activeDoc.textExcerpt}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="custom-audit-query" className="block text-xs font-semibold text-gray-700">
                      Audit Instructions / Query (Optional):
                    </label>
                    <input
                      type="text"
                      id="custom-audit-query"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g., Check if the 14-day notice period is violated or check SNF calibration..."
                      className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDoc(null);
                        setCustomPrompt("");
                      }}
                      className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      id="run-ai-audit-btn"
                      onClick={handleTriggerAudit}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Audit Document with AI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Verification Checklist Information */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>What Does The AI Audit For?</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Mandatory 14 clear days notice (Section 39)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Quorum & agenda compliance (1/5th or 50 members)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>NDDB automated tester calibration & spot Gerber rights</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Natural justice: 30-day show-cause & personal hearing (Sec 30)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sample Cooperative Documents Presets */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Instant Test Library</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  3 Real Presets
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Click any sample document below to load realistic cooperative test scenarios and analyze them with statutory grounding:
              </p>

              <div className="space-y-3">
                {SAMPLE_DOCUMENTS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      activeDoc?.name === preset.document.name
                        ? "bg-emerald-50/80 border-emerald-500 shadow-xs"
                        : "bg-gray-50/70 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-gray-900">
                        {preset.title}
                      </h4>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 flex-shrink-0">
                        {preset.id.split("-")[1]}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                      {preset.description}
                    </p>
                    <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <span>Click to select & inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Grievance Link */}
            {onOpenFlow && (
              <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-5 border border-emerald-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    Need Formal Legal Redressal?
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  If your document audit reveals legal violations (e.g. short notice or arbitrary expulsion), you can immediately draft a formal statutory complaint to the District Deputy Registrar (DDR) or Ombudsman.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenFlow("flow-grievance-redressal")}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Open Grievance & Ombudsman Flow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
