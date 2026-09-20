/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Navbar } from "./components/Navbar.tsx";
import { ChatWindow } from "./components/ChatWindow.tsx";
import { WorkflowsView } from "./components/WorkflowsView.tsx";
import { DocumentAuditView } from "./components/DocumentAuditView.tsx";
import { BylawsView } from "./components/BylawsView.tsx";
import { GuidedFlowModal } from "./components/GuidedFlowModal.tsx";
import { BylawsDrawer } from "./components/BylawsDrawer.tsx";
import {
  ActiveAppView,
  ChatMessage,
  RoutingResult,
  SocietyType,
  SupportedLanguage,
  UploadedDocument,
} from "./types.ts";
import { GUIDED_FLOWS } from "./data/guidedFlowsData.ts";
import { speechManager } from "./utils/speechManager.ts";

export default function App() {
  const [activeView, setActiveView] = useState<ActiveAppView>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>("en");
  const [societyType, setSocietyType] = useState<SocietyType>("all");
  const [lastRouting, setLastRouting] = useState<RoutingResult | undefined>(undefined);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [isBylawsDrawerOpen, setIsBylawsDrawerOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Synchronize audio playing state
  React.useEffect(() => {
    const unsub = speechManager.subscribe((prog) => {
      setIsAudioPlaying(!!prog && prog.isPlaying && !prog.isPaused);
    });
    return () => unsub();
  }, []);

  const handleSendMessage = async (text: string, document?: UploadedDocument) => {
    const userMessageId = `msg-user-${Date.now()}`;
    const currentStep = Math.floor(messages.filter((m) => m.sender === "user").length) + 1;
    const userMessage: ChatMessage = {
      id: userMessageId,
      sender: "user",
      text: text.trim() || (document ? `Uploaded Document for Analysis: ${document.name}` : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      document: document
        ? {
            name: document.name,
            type: document.type,
            size: document.size,
            dataUrl: document.dataUrl,
          }
        : undefined,
      chainStep: currentStep,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          document: document
            ? {
                name: document.name,
                type: document.type,
                size: document.size,
                base64Data: document.base64Data,
                textExcerpt: document.textExcerpt,
              }
            : undefined,
          conversationHistory: messages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          language: currentLanguage,
          societyType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: "bot",
        text: data.reply || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        routing: data.routing,
        citations: data.citations,
        chainedPrompts: data.chainedPrompts,
        diagnosticQuestion: data.diagnosticQuestion,
        chainStep: currentStep,
      };

      setLastRouting(data.routing);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: "bot",
        text: "I experienced a temporary communication error with the cooperative legal service. Please ensure your query is specific, or explore the Guided Flow and Bylaws tabs.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const activeFlow = activeFlowId ? GUIDED_FLOWS[activeFlowId] : null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f4f7f5] overflow-hidden font-sans">
      {/* Top Header Navigation with Active Feature Tabs */}
      <Navbar
        activeView={activeView}
        onViewChange={setActiveView}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        societyType={societyType}
        onSocietyTypeChange={setSocietyType}
        onOpenFlow={(flowId) => setActiveFlowId(flowId)}
        isAudioPlaying={isAudioPlaying}
        onStopAudio={() => speechManager.stop()}
      />

      {/* Main Content Area based on selected Feature View */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeView === "chat" && (
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            currentLanguage={currentLanguage}
            societyType={societyType}
            lastRouting={lastRouting}
            onOpenFlow={(flowId) => setActiveFlowId(flowId)}
            onToggleBylawsDrawer={() => setIsBylawsDrawerOpen(true)}
          />
        )}

        {activeView === "workflows" && (
          <WorkflowsView
            currentLanguage={currentLanguage}
            onOpenFlow={(flowId) => setActiveFlowId(flowId)}
            onSelectPrompt={(prompt) => {
              setActiveView("chat");
              handleSendMessage(prompt);
            }}
          />
        )}

        {activeView === "documents" && (
          <DocumentAuditView
            currentLanguage={currentLanguage}
            onAuditDocument={(doc, prompt) => {
              setActiveView("chat");
              handleSendMessage(prompt || `Audit ${doc.name} for statutory compliance and defects`, doc);
            }}
            onOpenFlow={(flowId) => setActiveFlowId(flowId)}
          />
        )}

        {activeView === "bylaws" && (
          <BylawsView
            currentLanguage={currentLanguage}
            societyType={societyType}
            onSelectArticleAsPrompt={(prompt) => {
              setActiveView("chat");
              handleSendMessage(prompt);
            }}
          />
        )}
      </main>

      {/* Step-by-Step Guided Flow State Machine Modal */}
      {activeFlow && (
        <GuidedFlowModal
          flow={activeFlow}
          currentLanguage={currentLanguage}
          messages={messages}
          societyType={societyType}
          onClose={() => setActiveFlowId(null)}
          onSendToChat={(summary) => {
            setActiveView("chat");
            handleSendMessage(summary);
          }}
        />
      )}

      {/* Comprehensive Bylaws & Act Compendium Drawer (available anytime via drawer toggle) */}
      <BylawsDrawer
        isOpen={isBylawsDrawerOpen}
        onClose={() => setIsBylawsDrawerOpen(false)}
        currentLanguage={currentLanguage}
        onSelectArticleAsPrompt={(prompt) => {
          setActiveView("chat");
          handleSendMessage(prompt);
        }}
      />
    </div>
  );
}
