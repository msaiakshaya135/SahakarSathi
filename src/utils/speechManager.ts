import { SupportedLanguage } from "../types.ts";
import { SUPPORTED_LANGUAGES } from "../data/translations.ts";

export interface SpeechProgress {
  messageId: string;
  totalChunks: number;
  currentChunkIndex: number;
  currentChunkText: string;
  isPlaying: boolean;
  isPaused: boolean;
  rate: number;
  voiceName: string;
  langCode: string;
}

export type SpeechListener = (progress: SpeechProgress | null) => void;

class SpeechManager {
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;
  private currentMessageId: string | null = null;
  private chunks: string[] = [];
  private currentChunkIndex = 0;
  private isPlaying = false;
  private isPaused = false;
  private rate = 0.92; // Clear, articulate cadence
  private currentLang: SupportedLanguage = "en";
  private listeners: Set<SpeechListener> = new Set();
  private interChunkTimer: any = null;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  private initVoices() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const available = window.speechSynthesis.getVoices();
    if (available && available.length > 0) {
      this.voices = available;
      this.voicesLoaded = true;
    }
  }

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    // immediately notify of current state
    listener(this.getProgress());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const progress = this.getProgress();
    for (const listener of this.listeners) {
      listener(progress);
    }
  }

  public getProgress(): SpeechProgress | null {
    if (!this.isPlaying && !this.isPaused) return null;
    if (!this.currentMessageId) return null;

    const currentVoice = this.findBestVoice(this.currentLang);

    return {
      messageId: this.currentMessageId,
      totalChunks: this.chunks.length,
      currentChunkIndex: this.currentChunkIndex,
      currentChunkText: this.chunks[this.currentChunkIndex] || "",
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      rate: this.rate,
      voiceName: currentVoice ? currentVoice.name : "Default System Voice",
      langCode: this.currentLang,
    };
  }

  /**
   * Pre-process text to remove markdown clutter, expand cooperative legal acronyms,
   * and optimize pronunciation for clear speech.
   */
  public cleanTextForSpeech(rawText: string, lang: SupportedLanguage): string[] {
    let text = rawText;

    // 1. Remove markdown code blocks and backticks
    text = text.replace(/```[\s\S]*?```/g, "");
    text = text.replace(/`([^`]+)`/g, "$1");

    // 2. Remove markdown images and links [title](url) -> title
    text = text.replace(/!\[.*?\]\(.*?\)/g, "");
    text = text.replace(/\[([^\]]+)\]\(.*?\)/g, "$1");

    // 3. Remove markdown headers, bold, italics, strikethrough, blockquotes
    text = text.replace(/^#{1,6}\s+/gm, "");
    text = text.replace(/\*\*(.*?)\*\*/g, "$1");
    text = text.replace(/\*(.*?)\*/g, "$1");
    text = text.replace(/__(.*?)__/g, "$1");
    text = text.replace(/~~(.*?)~~/g, "$1");
    text = text.replace(/^>\s+/gm, "");
    text = text.replace(/---/g, "");

    // 4. Clean table markers
    text = text.replace(/\|/g, ", ");

    // 5. Replace bullet points with clear spoken separators
    text = text.replace(/^[•\-\*]\s+/gm, "Point: ");
    text = text.replace(/^\d+\.\s+/gm, (match) => `Point ${match.trim()} `);

    // 6. Expand legal & cooperative abbreviations for clear phonetic enunciation
    // In English & Hinglish text
    text = text.replace(/\bSec\.\s*(\d+)/gi, "Section $1");
    text = text.replace(/\bu\/s\s*(\d+)/gi, "under Section $1");
    text = text.replace(/\bArt\.\s*(\d+)/gi, "Article $1");
    text = text.replace(/\bvs\.\s*/gi, "versus ");
    text = text.replace(/\bv\.\s*/gi, "versus ");
    text = text.replace(/₹\s*(\d+)/g, "$1 Rupees");
    text = text.replace(/\bRs\.\s*(\d+)/gi, "$1 Rupees");

    // Pronounce acronyms letter by letter for intelligibility
    text = text.replace(/\bAGM\b/g, "A.G.M.");
    text = text.replace(/\bPACS\b/g, "P.A.C.S.");
    text = text.replace(/\bDCS\b/g, "D.C.S.");
    text = text.replace(/\bFPO\b/g, "F.P.O.");
    text = text.replace(/\bMSCS\b/g, "M.S.C.S.");
    text = text.replace(/\bDDR\b/g, "D.D.R.");
    text = text.replace(/\bRCS\b/g, "R.C.S.");
    text = text.replace(/\bSNF\b/g, "S.N.F.");

    // Clean multiple whitespaces and newlines
    text = text.replace(/\r\n/g, "\n");
    text = text.replace(/\n{2,}/g, "\n");

    // 7. Segment into natural sentences and phrases
    // Split by sentence terminators: . ? ! । (Devanagari purna viram) or newlines
    const rawSegments = text.split(/(?<=[.?!।\n])\s+/);
    const resultChunks: string[] = [];

    for (let segment of rawSegments) {
      segment = segment.trim();
      if (!segment) continue;

      // If a segment is very long (> 200 chars), split by commas or semi-colons
      if (segment.length > 220) {
        const subParts = segment.split(/(?<=[,;])\s+/);
        let currentCombined = "";
        for (const part of subParts) {
          if ((currentCombined + " " + part).length > 200 && currentCombined.length > 0) {
            resultChunks.push(currentCombined.trim());
            currentCombined = part;
          } else {
            currentCombined = currentCombined ? `${currentCombined} ${part}` : part;
          }
        }
        if (currentCombined.trim()) {
          resultChunks.push(currentCombined.trim());
        }
      } else {
        resultChunks.push(segment);
      }
    }

    return resultChunks.filter((c) => c.length > 0);
  }

  /**
   * Find the highest-quality native or regional voice for the given language.
   */
  public findBestVoice(lang: SupportedLanguage): SpeechSynthesisVoice | null {
    if (!this.voices || this.voices.length === 0) {
      this.initVoices();
    }
    if (!this.voices || this.voices.length === 0) return null;

    const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    const targetCode = (langMeta?.voiceLangCode || "en-IN").toLowerCase();
    const baseCode = lang.toLowerCase();
    const langName = (langMeta?.name || "").toLowerCase();
    const nativeName = (langMeta?.nativeName || "").toLowerCase();

    // 1. Exact match by voice.lang (e.g. "hi-IN", "mr-IN", "ta-IN", "te-IN")
    const exactMatch = this.voices.find(
      (v) => v.lang.toLowerCase().replace("_", "-") === targetCode
    );
    if (exactMatch) return exactMatch;

    // 2. Starts with base language code (e.g. "hi-", "mr-", "ta-")
    const prefixMatch = this.voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith(baseCode + "-") ||
        v.lang.toLowerCase() === baseCode
    );
    if (prefixMatch) return prefixMatch;

    // 3. Match by language name or well-known Indian voice names
    const voiceNameSubstrings: Record<string, string[]> = {
      hi: ["hindi", "हिन्दी", "swara", "madhur", "kalpana", "hemant", "kavya"],
      mr: ["marathi", "मराठी", "aarohi", "manohar"],
      ta: ["tamil", "தமிழ்", "valluvar", "pallavi"],
      te: ["telugu", "తెలుగు", "mohan", "shruti"],
      kn: ["kannada", "ಕನ್ನಡ", "gagan", "sapna"],
      gu: ["gujarati", "ગુજરાતી", "niranjan", "dhwani"],
      bn: ["bengali", "বাংলা", "bashkar", "tanishaa"],
      pa: ["punjabi", "ਪੰਜਾਬੀ", "raaj", "harman"],
      en: ["india", "indian", "neerja", "prabhat", "en-in"],
    };

    const targetSubstrings = voiceNameSubstrings[baseCode] || [];
    const nameMatch = this.voices.find((v) => {
      const vName = v.name.toLowerCase();
      if (langName && vName.includes(langName)) return true;
      if (nativeName && vName.includes(nativeName)) return true;
      return targetSubstrings.some((sub) => vName.includes(sub));
    });
    if (nameMatch) return nameMatch;

    // 4. For Indian languages, if no native voice installed on client, fallback to Indian English voice
    // so Indian legal terms and phonemes sound natural rather than US/UK robotic voice
    const indianEnglish = this.voices.find(
      (v) =>
        v.lang.toLowerCase().replace("_", "-") === "en-in" ||
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("indian") ||
        v.name.toLowerCase().includes("neerja") ||
        v.name.toLowerCase().includes("prabhat")
    );
    if (indianEnglish) return indianEnglish;

    // 5. Default voice
    const defaultVoice = this.voices.find((v) => v.default);
    return defaultVoice || this.voices[0] || null;
  }

  /**
   * Automatically detect language from text characters (e.g., Devanagari, Tamil, Telugu, etc.)
   */
  public detectLanguageFromText(text: string, defaultLang: SupportedLanguage): SupportedLanguage {
    if (/[\u0900-\u097F]/.test(text)) {
      // Devanagari script: Hindi or Marathi
      return defaultLang === "mr" ? "mr" : "hi";
    }
    if (/[\u0B80-\u0BFF]/.test(text)) {
      return "ta"; // Tamil script
    }
    if (/[\u0C00-\u0C7F]/.test(text)) {
      return "te"; // Telugu script
    }
    if (/[\u0C80-\u0CFF]/.test(text)) {
      return "kn"; // Kannada script
    }
    if (/[\u0980-\u09FF]/.test(text)) {
      return "bn"; // Bengali script
    }
    if (/[\u0A80-\u0AFF]/.test(text)) {
      return "gu"; // Gujarati script
    }
    if (/[\u0A00-\u0A7F]/.test(text)) {
      return "pa"; // Gurmukhi/Punjabi script
    }
    return defaultLang;
  }

  /**
   * Start reading aloud a message completely from beginning to end without cutoffs.
   */
  public speakMessage(messageId: string, text: string, lang: SupportedLanguage) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported on this device/browser.");
      return;
    }

    this.stop(); // Stop any ongoing speech

    const effectiveLang = this.detectLanguageFromText(text, lang);
    this.currentMessageId = messageId;
    this.currentLang = effectiveLang;
    this.chunks = this.cleanTextForSpeech(text, effectiveLang);
    this.currentChunkIndex = 0;
    this.isPlaying = true;
    this.isPaused = false;

    if (this.chunks.length === 0) {
      this.stop();
      return;
    }

    this.notify();
    this.playCurrentChunk();
  }

  private playCurrentChunk() {
    if (!this.isPlaying || this.isPaused) return;

    if (this.currentChunkIndex >= this.chunks.length) {
      // Completed reading the full information!
      this.stop();
      return;
    }

    const chunkText = this.chunks[this.currentChunkIndex];
    if (!chunkText || !chunkText.trim()) {
      this.currentChunkIndex++;
      this.playCurrentChunk();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunkText);
    const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === this.currentLang);
    const voice = this.findBestVoice(this.currentLang);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || langMeta?.voiceLangCode || "en-IN";
    } else {
      utterance.lang = langMeta?.voiceLangCode || "en-IN";
    }

    utterance.rate = this.rate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (!this.isPlaying || this.isPaused) return;
      this.currentChunkIndex++;
      this.notify();

      // Brief natural pause of 120ms between sentences for clarity and breath
      this.interChunkTimer = setTimeout(() => {
        this.playCurrentChunk();
      }, 120);
    };

    utterance.onerror = (err) => {
      console.warn("Speech utterance error or interruption:", err);
      if (!this.isPlaying || this.isPaused) return;

      // Move to next chunk on error to avoid stalling
      this.currentChunkIndex++;
      this.notify();
      this.interChunkTimer = setTimeout(() => {
        this.playCurrentChunk();
      }, 120);
    };

    window.speechSynthesis.speak(utterance);
    this.notify();
  }

  public pause() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (this.isPlaying && !this.isPaused) {
        window.speechSynthesis.pause();
        this.isPaused = true;
        this.notify();
      }
    }
  }

  public resume() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (this.isPaused) {
        window.speechSynthesis.resume();
        this.isPaused = false;
        this.notify();
      }
    }
  }

  public stop() {
    if (this.interChunkTimer) {
      clearTimeout(this.interChunkTimer);
      this.interChunkTimer = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.currentMessageId = null;
    this.chunks = [];
    this.currentChunkIndex = 0;
    this.notify();
  }

  public setRate(newRate: number) {
    this.rate = newRate;
    if (this.isPlaying && !this.isPaused) {
      // Restart current chunk with new rate
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      this.playCurrentChunk();
    } else {
      this.notify();
    }
  }

  public nextChunk() {
    if (this.currentChunkIndex < this.chunks.length - 1) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      this.currentChunkIndex++;
      this.playCurrentChunk();
    }
  }

  public prevChunk() {
    if (this.currentChunkIndex > 0) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      this.currentChunkIndex--;
      this.playCurrentChunk();
    }
  }
}

export const speechManager = new SpeechManager();
