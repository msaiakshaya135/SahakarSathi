import React from "react";
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  SkipForward,
  SkipBack,
  Gauge,
  Sparkles,
} from "lucide-react";
import { SpeechProgress, speechManager } from "../utils/speechManager.ts";
import { SupportedLanguage } from "../types.ts";
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from "../data/translations.ts";

interface AudioPlayerBarProps {
  progress: SpeechProgress | null;
  currentLanguage: SupportedLanguage;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  progress,
  currentLanguage,
}) => {
  if (!progress) return null;

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;
  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === progress.langCode);

  const percent = progress.totalChunks > 0
    ? Math.round(((progress.currentChunkIndex + 1) / progress.totalChunks) * 100)
    : 0;

  return (
    <div
      id="audio-player-bar"
      className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white border-b border-emerald-700/80 px-3 sm:px-6 py-2.5 shadow-lg relative z-30 transition-all animate-in slide-in-from-top-2 duration-200"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Status & Current Spoken Sentence */}
        <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto flex-1">
          {/* Animated Equalizer Visualizer */}
          <div className="w-8 h-8 rounded-lg bg-emerald-800/80 border border-emerald-600 flex items-center justify-center flex-shrink-0">
            {progress.isPlaying && !progress.isPaused ? (
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-1 bg-amber-400 animate-[bounce_0.8s_infinite] rounded-full h-3" />
                <span className="w-1 bg-emerald-300 animate-[bounce_0.6s_infinite_0.1s] rounded-full h-4" />
                <span className="w-1 bg-amber-400 animate-[bounce_0.7s_infinite_0.2s] rounded-full h-2.5" />
                <span className="w-1 bg-emerald-300 animate-[bounce_0.9s_infinite_0.3s] rounded-full h-3.5" />
              </div>
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-300" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{progress.isPaused ? "Speech Paused" : "Reading Aloud with Clarity"}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-100 font-semibold border border-emerald-600">
                {langMeta?.nativeName || langMeta?.name || "Audio"}
              </span>
              <span className="text-[11px] text-gray-300 hidden md:inline truncate max-w-xs" title={progress.voiceName}>
                • {progress.voiceName}
              </span>
            </div>

            {/* Current Sentence Excerpt */}
            <div className="text-xs text-gray-200 truncate mt-0.5 font-normal italic">
              "{progress.currentChunkText || "..."}"
            </div>
          </div>
        </div>

        {/* Right: Controls & Progress */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 flex-shrink-0">
          {/* Progress Tracker */}
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-semibold text-emerald-300">
              {progress.currentChunkIndex + 1} / {progress.totalChunks}
            </div>
            <div className="w-16 bg-emerald-900 rounded-full h-1.5 overflow-hidden mt-0.5 border border-emerald-700">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Playback Buttons */}
          <div className="flex items-center gap-1.5 bg-emerald-900/80 px-2 py-1 rounded-xl border border-emerald-700/60">
            {/* Prev Sentence */}
            <button
              type="button"
              id="speech-prev-btn"
              onClick={() => speechManager.prevChunk()}
              disabled={progress.currentChunkIndex === 0}
              className="p-1 rounded text-gray-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Previous Sentence"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Play/Pause */}
            {progress.isPlaying && !progress.isPaused ? (
              <button
                type="button"
                id="speech-pause-btn"
                onClick={() => speechManager.pause()}
                className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold transition-colors cursor-pointer shadow-xs"
                title="Pause"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                id="speech-resume-btn"
                onClick={() => speechManager.resume()}
                className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold transition-colors cursor-pointer shadow-xs"
                title="Resume"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Next Sentence */}
            <button
              type="button"
              id="speech-next-btn"
              onClick={() => speechManager.nextChunk()}
              disabled={progress.currentChunkIndex >= progress.totalChunks - 1}
              className="p-1 rounded text-gray-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Next Sentence"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Rate Toggle */}
          <div className="flex items-center gap-1 bg-emerald-900/80 px-2 py-1 rounded-xl border border-emerald-700/60 text-[11px] font-semibold">
            <Gauge className="w-3 h-3 text-emerald-300 mr-0.5" />
            {[0.8, 0.92, 1.15].map((rateVal) => (
              <button
                key={rateVal}
                type="button"
                onClick={() => speechManager.setRate(rateVal)}
                className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                  Math.abs(progress.rate - rateVal) < 0.05
                    ? "bg-amber-400 text-emerald-950 font-bold"
                    : "text-emerald-200 hover:text-white"
                }`}
                title={`Speed ${rateVal === 0.92 ? "Normal (0.92x)" : `${rateVal}x`}`}
              >
                {rateVal === 0.92 ? "1.0x" : `${rateVal}x`}
              </button>
            ))}
          </div>

          {/* Stop Audio Button */}
          <button
            type="button"
            id="speech-stop-btn"
            onClick={() => speechManager.stop()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            title={t.stopAudio || "Stop"}
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.stopAudio || "Stop"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
