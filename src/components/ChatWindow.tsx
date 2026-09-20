import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Scale,
  FileText,
  Vote,
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  CornerDownLeft,
  Paperclip,
  Upload,
  X,
  FileUp,
  HelpCircle,
  FileCheck,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { ChatMessage, RoutingResult, SocietyType, SupportedLanguage, UploadedDocument } from "../types.ts";
import { MessageItem } from "./MessageItem.tsx";
import { AudioPlayerBar } from "./AudioPlayerBar.tsx";
import { speechManager, SpeechProgress } from "../utils/speechManager.ts";
import { SAMPLE_PROMPTS, UI_TRANSLATIONS, SUPPORTED_LANGUAGES } from "../data/translations.ts";
import { SAMPLE_DOCUMENTS, SampleDocumentPreset } from "../data/sampleDocuments.ts";

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, document?: UploadedDocument) => void;
  isLoading: boolean;
  currentLanguage: SupportedLanguage;
  societyType: SocietyType;
  lastRouting?: RoutingResult;
  onOpenFlow: (flowId: string) => void;
  onToggleBylawsDrawer: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  isLoading,
  currentLanguage,
  societyType,
  lastRouting,
  onOpenFlow,
  onToggleBylawsDrawer,
}) => {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechProgress, setSpeechProgress] = useState<SpeechProgress | null>(null);
  const [attachedDoc, setAttachedDoc] = useState<UploadedDocument | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;
  const samplePrompts = SAMPLE_PROMPTS[currentLanguage] || SAMPLE_PROMPTS.en;

  // Subscribe to speech synthesis manager updates
  useEffect(() => {
    const unsubscribe = speechManager.subscribe((prog) => {
      setSpeechProgress(prog);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // File processing helper
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
          setAttachedDoc({
            name: file.name,
            type: file.type || "text/plain",
            size: file.size,
            dataUrl,
            base64Data,
            textExcerpt: textContent.substring(0, 1000),
          });
        };
        textReader.readAsText(file);
      } else {
        setAttachedDoc({
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
    if (file) {
      handleProcessFile(file);
    }
    // reset input value so re-uploading the same file triggers change
    if (e.target) e.target.value = "";
  };

  const handleSelectPreset = (preset: SampleDocumentPreset) => {
    setAttachedDoc(preset.document);
    setInputText(preset.suggestedPrompt);
    setShowPresetsMenu(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Speech Recognition Setup (Web Speech API)
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);
      recognition.lang = currentLangMeta?.voiceLangCode || "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Speech recognition initiation error:", e);
      setIsListening(false);
    }
  };

  // Text-to-Speech Synthesis
  const handleSpeak = (messageId: string, text: string, lang: SupportedLanguage) => {
    speechManager.speakMessage(messageId, text, lang);
  };

  const handleStopSpeak = () => {
    speechManager.stop();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedDoc) || isLoading) return;

    onSendMessage(inputText.trim(), attachedDoc || undefined);
    setInputText("");
    setAttachedDoc(null);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="flex-1 flex flex-col h-full bg-[#f4f7f5] overflow-hidden relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input for Native Document Picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
        className="hidden"
        id="hidden-document-file-input"
      />

      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 border-4 border-dashed border-emerald-400 m-2 rounded-2xl pointer-events-none animate-in fade-in duration-150">
          <FileUp className="w-16 h-16 text-emerald-300 animate-bounce mb-3" />
          <h3 className="text-xl font-bold mb-1">Drop Document to Upload</h3>
          <p className="text-sm text-emerald-200 text-center max-w-md">
            Release to analyze AGM notices, milk slips, audit sheets, or show cause letters with cooperative legal bylaws.
          </p>
        </div>
      )}

      {/* Audio Player Sticky Bar for High-Clarity Full Read Aloud */}
      <AudioPlayerBar progress={speechProgress} currentLanguage={currentLanguage} />

      {/* Quick Action Ribbon when conversation is active */}
      {messages.length > 0 && (
        <div className="bg-white/95 backdrop-blur-xs border-b border-gray-200 px-4 py-2 sticky top-0 z-20 shadow-2xs">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar text-xs">
            <div className="flex items-center gap-1.5 flex-shrink-0 text-gray-500 font-semibold text-[11px]">
              <Scale className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Statutory Workflows:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => onOpenFlow("flow-voting-rights")}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-amber-50 hover:text-amber-900 border border-gray-200 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Voting Eligibility
              </button>
              <button
                type="button"
                onClick={() => onOpenFlow("flow-grievance-redressal")}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-rose-50 hover:text-rose-900 border border-gray-200 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Grievance & Ombudsman
              </button>
              <button
                type="button"
                onClick={() => onOpenFlow("flow-coop-registration")}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-sky-50 hover:text-sky-900 border border-gray-200 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Registration
              </button>
              <button
                type="button"
                onClick={() => onOpenFlow("flow-inspect-books")}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-900 border border-gray-200 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Inspect Records
              </button>
            </div>
            <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-medium transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
                title={t.uploadDocTooltip}
              >
                <Upload className="w-3 h-3 text-emerald-700" />
                <span>Upload Doc</span>
              </button>
              <button
                type="button"
                onClick={onToggleBylawsDrawer}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-[11px] font-medium transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
                title={t.viewAllBylaws}
              >
                <BookOpen className="w-3 h-3 text-amber-700" />
                <span>Bylaws</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
        {messages.length === 0 ? (
          /* Empty State / Welcome Screen */
          <div className="max-w-4xl mx-auto space-y-6 pt-2 pb-8">
            {/* Welcome Banner */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-100 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto text-emerald-800 shadow-inner">
                <Scale className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {t.appTitle} – {t.appSubtitle}
              </h2>
              <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
                {t.tagline}. Grounded directly in the Multi-State Co-operative Societies Act 2023, State Acts, and National Model Bylaws.
              </p>

              {/* Core Feature Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Automatic Query Routing
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  RAG Act & Bylaws Grounding
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  AI Document Audit & Inspection
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  Guided State Machines
                </span>
              </div>
            </div>

            {/* Guided Workflow Quick Cards */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <span>Statutory Guided Workflows</span>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">Interactive State Machines</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div
                  onClick={() => onOpenFlow("flow-voting-rights")}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                      <Vote className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-amber-900 transition-colors">
                        {t.checkVotingBtn}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Active Member checks, 3-of-5 AGM attendance, loan clear status
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-amber-700 font-semibold">
                    <span>Section 29 MSCS Act</span>
                    <span className="group-hover:translate-x-1 transition-transform">Start Flow &rarr;</span>
                  </div>
                </div>

                <div
                  onClick={() => onOpenFlow("flow-grievance-redressal")}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-rose-900 transition-colors">
                        {t.fileGrievanceBtn}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Sec 84/85A petition to DDR & Ombudsman with letter draft & PDF
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-rose-700 font-semibold">
                    <span>Section 84 / 85A</span>
                    <span className="group-hover:translate-x-1 transition-transform">Start Flow &rarr;</span>
                  </div>
                </div>

                <div
                  onClick={() => onOpenFlow("flow-coop-registration")}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-sky-900 transition-colors">
                        {t.registerCoopBtn}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Promoters threshold, Form A, bank account & 60-day timeline
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-sky-700 font-semibold">
                    <span>Section 6 & 7</span>
                    <span className="group-hover:translate-x-1 transition-transform">Start Flow &rarr;</span>
                  </div>
                </div>

                <div
                  onClick={() => onOpenFlow("flow-inspect-books")}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-900 transition-colors">
                        {t.inspectBooksBtn}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Sec 106/108 audit records, member register, AGM minutes
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                    <span>Section 106 / 108</span>
                    <span className="group-hover:translate-x-1 transition-transform">Start Flow &rarr;</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload AI Audit Card */}
            <div className="bg-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/50 flex items-center justify-center flex-shrink-0 text-emerald-200">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <span>{t.uploadDocBtn}</span>
                      <span className="text-[10px] bg-emerald-700/80 text-emerald-200 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                        Instant Audit
                      </span>
                    </h3>
                    <p className="text-xs text-emerald-200/90 mt-0.5 leading-relaxed">
                      {t.uploadDocTooltip}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="welcome-upload-doc-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex-shrink-0 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t.uploadDocBtn}</span>
                </button>
              </div>

              {/* Sample Test Documents Presets */}
              <div className="pt-3 border-t border-emerald-800/80">
                <div className="text-[11px] font-semibold text-emerald-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.sampleDocsHeader}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SAMPLE_DOCUMENTS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="text-left p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/60 hover:border-emerald-400 transition-all text-xs group cursor-pointer"
                    >
                      <div className="font-semibold text-white group-hover:text-emerald-200 flex items-center justify-between">
                        <span className="truncate">{preset.title}</span>
                        <CornerDownLeft className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />
                      </div>
                      <div className="text-[11px] text-emerald-300/80 mt-1 line-clamp-2">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Frequently Asked Sample Queries in 2 columns */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-950">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{t.quickPromptTitle}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputText(prompt);
                      onSendMessage(prompt);
                    }}
                    className="text-left text-xs p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-950 border border-gray-200/80 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span className="line-clamp-2">{prompt}</span>
                    <CornerDownLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-700 flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg, index) => {
              let previousUserMessage: ChatMessage | undefined;
              for (let i = index - 1; i >= 0; i--) {
                if (messages[i].sender === "user") {
                  previousUserMessage = messages[i];
                  break;
                }
              }

              return (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  previousUserMessage={previousUserMessage}
                  allMessages={messages}
                  societyType={societyType}
                  currentLanguage={currentLanguage}
                  onOpenFlow={onOpenFlow}
                  onSelectPrompt={(promptText) => onSendMessage(promptText)}
                  isSpeaking={speechProgress?.messageId === msg.id && speechProgress?.isPlaying}
                  onSpeak={handleSpeak}
                  onStopSpeak={handleStopSpeak}
                />
              );
            })}

            {/* Loading / Typing State with Routing & Audit Status */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-emerald-200 rounded-2xl rounded-tl-sm p-4 shadow-sm space-y-2 max-w-md">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    <span>{t.analyzingDoc || "Analyzing query intent & retrieving legal grounding..."}</span>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar Area */}
      <div className="bg-white border-t border-gray-200 p-3 sm:p-4 shadow-md sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          {/* Active Attached Document Strip */}
          {attachedDoc && (
            <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {attachedDoc.name}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
                      Audit Ready
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {Math.round(attachedDoc.size / 1024) || 1} KB • {attachedDoc.type || "Document"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="remove-attached-doc-btn"
                onClick={() => setAttachedDoc(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title={t.removeAttachment}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Prompts Carousel if conversation has started */}
          {messages.length > 0 && (
            <div className="mb-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap hidden sm:inline">
                Suggested:
              </span>
              {samplePrompts.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(prompt);
                    onSendMessage(prompt);
                  }}
                  className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-900 border border-gray-200 text-[11px] whitespace-nowrap transition-colors cursor-pointer"
                >
                  {prompt.length > 45 ? `${prompt.substring(0, 45)}...` : prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
            {/* File Upload Button */}
            <div className="relative">
              <button
                type="button"
                id="chat-upload-file-btn"
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-xl border transition-all flex-shrink-0 cursor-pointer ${
                  attachedDoc
                    ? "bg-emerald-100 text-emerald-800 border-emerald-400"
                    : "bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-900 border-gray-200"
                }`}
                title={t.uploadDocTooltip}
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>

            {/* Sample Documents Preset Menu Button */}
            <div className="relative">
              <button
                type="button"
                id="chat-sample-docs-btn"
                onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                className="p-3 rounded-xl border border-gray-200 bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-900 transition-all flex-shrink-0 cursor-pointer flex items-center gap-1"
                title="Test with Sample Cooperative Documents"
              >
                <FileCheck className="w-5 h-5" />
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>

              {/* Presets Dropdown */}
              {showPresetsMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-40 space-y-1">
                  <div className="text-[11px] font-bold text-gray-500 uppercase px-2 py-1 flex items-center justify-between">
                    <span>{t.sampleDocsHeader}</span>
                    <button
                      type="button"
                      onClick={() => setShowPresetsMenu(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {SAMPLE_DOCUMENTS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 text-xs border border-transparent hover:border-emerald-200 transition-colors"
                    >
                      <div className="font-semibold text-gray-900">{preset.title}</div>
                      <div className="text-[11px] text-gray-500 line-clamp-1">{preset.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Input Button */}
            <button
              type="button"
              id="voice-mic-btn"
              onClick={handleToggleVoice}
              className={`p-3 rounded-xl border transition-all flex-shrink-0 cursor-pointer ${
                isListening
                  ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                  : "bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-900 border-gray-200"
              }`}
              title={isListening ? t.listening : t.speakTooltip}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input Text Area */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                id="chat-input-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? t.listening
                    : attachedDoc
                    ? `Ask a question about ${attachedDoc.name} or press Send to audit...`
                    : t.askPlaceholder
                }
                rows={1}
                className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-inner resize-none max-h-32 text-gray-900"
                style={{ minHeight: "44px" }}
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              id="chat-send-btn"
              disabled={(!inputText.trim() && !attachedDoc) || isLoading}
              className="p-3 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors flex-shrink-0 cursor-pointer"
              title={t.send}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
