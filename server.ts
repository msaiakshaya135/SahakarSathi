import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { COOPERATIVE_KB, searchKnowledgeBase, classifyQuery } from "./src/data/knowledgeBaseEngine.ts";
import { FALLBACK_REPLIES } from "./src/data/multilingualReplies.ts";
import { SupportedLanguage } from "./src/types.ts";
import { extractChainedPrompts, getContextualChainedPrompts } from "./src/utils/promptChainingEngine.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. API: Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    kbArticlesCount: COOPERATIVE_KB.length,
    timestamp: new Date().toISOString(),
  });
});

// 2. API: Query Routing & Classification
app.post("/api/route", (req: Request, res: Response) => {
  try {
    const { query, societyType } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    const routingResult = classifyQuery(query, societyType);
    return res.json(routingResult);
  } catch (error) {
    console.error("Routing error:", error);
    return res.status(500).json({ error: "Failed to route query" });
  }
});

// 3. API: RAG Retrieval Search
app.post("/api/rag-search", (req: Request, res: Response) => {
  try {
    const { query, societyType, limit = 4 } = req.body;
    const results = searchKnowledgeBase(query || "", societyType, limit);
    return res.json({ results });
  } catch (error) {
    console.error("RAG search error:", error);
    return res.status(500).json({ error: "Failed to perform RAG search" });
  }
});

// 4. API: Chat endpoint with Query Routing + RAG Retrieval + Multilingual Gemini + Document Analysis
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message, document, conversationHistory = [], language = "en", societyType = "general" } = req.body;

    const hasMessage = typeof message === "string" && message.trim().length > 0;
    if (!hasMessage && !document) {
      return res.status(400).json({ error: "Either a message or an uploaded document is required." });
    }

    const effectiveMessage = hasMessage
      ? message.trim()
      : `Please examine this attached cooperative document (${document.name}), summarize its content, check its legal validity under the Cooperative Societies Act and Model Bylaws, identify any bylaw violations or deadlines, and guide my rights and recommended next actions as a member.`;

    // Step A: Route query (including document text cues for accurate routing)
    const queryForSearch = `${effectiveMessage} ${document?.name || ""} ${document?.textExcerpt || ""}`.trim();
    const routing = classifyQuery(queryForSearch, societyType);

    // Step B: RAG retrieval over Cooperative Societies Act & Model Bylaws
    const retrievedDocs = searchKnowledgeBase(queryForSearch, societyType, 4);

    // Format retrieved context
    const contextText = retrievedDocs
      .map(
        (doc, i) =>
          `[Source ${i + 1}] Title: ${doc.title}\nAct/Bylaw: ${doc.actOrBylaw}\nSection/Clause: ${doc.section}\nCategory: ${doc.category}\nContent: ${doc.content}\nKey Rights: ${doc.keyRights?.join(", ")}`
      )
      .join("\n\n---\n\n");

    // Check if Gemini AI is available
    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const languageNameMap: Record<string, string> = {
          en: "English",
          hi: "Hindi (हिन्दी)",
          mr: "Marathi (मराठी)",
          gu: "Gujarati (ગુજરાતી)",
          ta: "Tamil (தமிழ்)",
          te: "Telugu (తెలుగు)",
          kn: "Kannada (ಕನ್ನಡ)",
          bn: "Bengali (বাংলা)",
          pa: "Punjabi (ਪੰਜਾਬੀ)",
        };

        const targetLanguageName = languageNameMap[language] || "English";

        const docAuditInstruction = document
          ? `\n\nDOCUMENT LEGAL AUDIT MANDATE:
The user has attached an official document: "${document.name}" (Type: ${document.type || "Document"}, Size: ${Math.round((document.size || 0) / 1024)} KB).
You MUST inspect the attached document and structure your response with:
1. Document Identification: State what type of document it is, who issued it, and the stated subject.
2. Key Clauses & Extracted Details: Note dates (e.g. notice period between issue date and meeting date), quorum requirements, milk testing metrics (FAT/SNF), deductions, or allegations.
3. Statutory & Bylaw Compliance: State whether the document violates mandatory rules (e.g., Section 39 MSCS Act 14-day notice requirement for AGM, NDDB Rule 18-22 for milk FAT transparency and spot Gerber re-testing, Section 30 natural justice / 30-day notice for expulsion, or Section 106 audit inspection rights).
4. Concrete Member Action Steps: Numbered legal steps the member should take (e.g. submit written objection, preserve payment slip, petition District Deputy Registrar [DDR] or file under Section 85A with Cooperative Ombudsman).`
          : "";

        const systemInstruction = `You are "Sahakar Sathi" (सहकार साथी), an authoritative, friendly legal advisor for members of Indian Cooperative Societies (Dairy Co-ops, PACS, Sugar Co-ops, Urban Credit Societies, Housing Co-ops, and FPOs).

CRITICAL MANDATORY LANGUAGE REQUIREMENT:
You MUST generate your ENTIRE output exclusively in ${targetLanguageName}.
Do NOT reply in English unless the selected language is English.

CRITICAL BREVITY & CONCISENESS REQUIREMENT (STRICT LENGTH LIMIT):
- Keep your entire answer UNDER 120-140 WORDS TOTAL. Be razor-sharp, direct, and concise.
- Strictly ban lengthy preambles, introductory filler, or generic disclaimers.

MANDATORY INTERACTIVE Q&A FORMAT:
1. Statutory Legal Position:
   - 1-2 punchy, authoritative sentences directly answering the query.
   - Do NOT include artificial headings like "Direct Statutory Answer (...):" or "Direct Answer:". Start directly with the clear legal explanation.
   - Cite the exact statutory Act and Section/Bylaw (e.g., Section 29, Section 39, Section 84, Section 85A, Section 106/108 of MSCS Act / State Act, NDDB Milk Testing Code Rule 18-22, Model PACS Bylaws 2023).
   - Cite exact statutory timelines (e.g., 14-day notice, 30-day inspection deadline, 30-day appeal).

2. **Key Remedies (मुख्य उपाय):**
   - Exactly 2 short bullet points (max 1 sentence each) stating the immediate legal remedy and escalation authority (e.g., District Deputy Registrar [DDR], Cooperative Ombudsman under Section 85A).

3. **Next Diagnostic Question (मामले का अगला सवाल):**
   - Exactly ONE short diagnostic question to probe the member's factual situation.

4. **[CHAINED_PROMPTS] Block:**
   - Exactly 3 short follow-up prompts (under 10 words each) in this format at the very end:
[CHAINED_PROMPTS]
- <Follow-up prompt 1>
- <Follow-up prompt 2>
- <Follow-up prompt 3>
[/CHAINED_PROMPTS]

Rules you must strictly follow:
1. QUERY ROUTING:
   - Category: ${routing.category.toUpperCase()} (${routing.categoryDescription})
   - Primary Legal Grounding: ${routing.legalBasis}
   - Society Type: ${routing.societyType}
2. GROUNDED RETRIEVAL: Ground your answers in the provided knowledge base context:
${contextText}
${docAuditInstruction}`;

        // Format recent history for multi-turn context
        const formattedHistory = conversationHistory.slice(-4).map((msg: any) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }));

        // Prepare user parts with text + inlineData if document attached
        const userParts: any[] = [];
        const docHeader = document
          ? `[Attached Document: "${document.name}" | Type: ${document.type || "Document"} | Size: ${Math.round((document.size || 0) / 1024)} KB]\n\n`
          : "";

        userParts.push({
          text: `[Selected Response Language: ${targetLanguageName}. Please answer in ${targetLanguageName}.]\n\n${docHeader}${effectiveMessage}`,
        });

        if (document && document.base64Data) {
          let mime = document.type || "application/pdf";
          if (
            mime.includes("text/plain") ||
            mime.includes("text/csv") ||
            mime.includes("text/markdown") ||
            mime.includes("application/json")
          ) {
            mime = "text/plain";
          } else if (!mime || mime === "application/octet-stream") {
            if (document.name?.endsWith(".pdf")) mime = "application/pdf";
            else if (document.name?.endsWith(".png")) mime = "image/png";
            else if (document.name?.endsWith(".jpg") || document.name?.endsWith(".jpeg")) mime = "image/jpeg";
            else mime = "text/plain";
          }

          userParts.push({
            inlineData: {
              mimeType: mime,
              data: document.base64Data,
            },
          });
        }

        // Model call with candidate fallback to ensure high availability and responsiveness
        const candidateModels = ["gemini-2.5-flash", "gemini-2.5-pro"];
        let response: any = null;

        for (const modelCandidate of candidateModels) {
          try {
            const generatePromise = ai.models.generateContent({
              model: modelCandidate,
              contents: [
                ...formattedHistory,
                {
                  role: "user",
                  parts: userParts,
                },
              ],
              config: {
                systemInstruction,
                temperature: 0.3,
                thinkingConfig: { thinkingBudget: 0 },
                maxOutputTokens: 2048,
              },
            });

            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout for ${modelCandidate}`)), 16000)
            );

            response = await Promise.race([generatePromise, timeoutPromise]);
            if (response && response.text && response.text.trim().length > 10) {
              break;
            }
          } catch (modelErr: any) {
            console.warn(`Model ${modelCandidate} failed or timed out:`, modelErr?.message || modelErr);
          }
        }

        if (response && response.text) {
          const contextualFallbackPrompts = getContextualChainedPrompts(
            message || (document ? document.name : ""),
            routing.category,
            routing.societyType,
            language as SupportedLanguage
          );

          const { cleanText, chainedPrompts, diagnosticQuestion } = extractChainedPrompts(
            response.text,
            contextualFallbackPrompts
          );

          return res.json({
            reply: cleanText,
            routing,
            chainedPrompts,
            diagnosticQuestion,
            citations: retrievedDocs.map((d) => ({
              title: d.title,
              actOrBylaw: d.actOrBylaw,
              section: d.section,
              category: d.category,
              snippet: d.content.substring(0, 160) + "...",
            })),
          });
        }
      } catch (geminiError: any) {
        console.error("Gemini API error, using fallback RAG generation:", geminiError?.message || geminiError);
      }
    }

    // Rule-grounded deterministic response when Gemini API is unavailable, fully rendered in the selected language
    const langKey = (language as SupportedLanguage) in FALLBACK_REPLIES ? (language as SupportedLanguage) : "en";
    const langTemplates = FALLBACK_REPLIES[langKey] || FALLBACK_REPLIES.en;
    const topDoc = retrievedDocs[0];
    let fallbackReply = "";

    if (document) {
      const docLower = `${document.name} ${document.textExcerpt || ""}`.toLowerCase();
      let docAdvice = "";

      if (docLower.includes("agm") || docLower.includes("notice") || docLower.includes("meeting")) {
        docAdvice =
          `Under Section 39 of the Multi-State Co-operative Societies Act and Model Bylaws, a **minimum 14 clear days written notice** is mandatory before the AGM date.\n\n` +
          `**Key Defect & Legal Impact:**\n` +
          `• If the notice period between delivery and meeting date is less than 14 clear days, the AGM proceedings and any resolutions passed (such as elections, expulsion, or balance sheet adoptions) are legally voidable.\n` +
          `• **Escalation Remedy:** File an immediate written protest before the Secretary and petition the District Deputy Registrar (DDR).\n\n` +
          `**Next Diagnostic Question for Your Case:**\n` +
          `What is the exact postmark or delivery date on which you received this notice?`;
      } else if (docLower.includes("dairy") || docLower.includes("milk") || docLower.includes("fat") || docLower.includes("snf")) {
        docAdvice =
          `Under NDDB Bylaw Rules 18-22, automated milk testing must be conducted transparently in the presence of the farmer, with instant dispute re-testing rights.\n\n` +
          `**Key Legal Rights & Re-Testing Provision:**\n` +
          `• Pouring members have a statutory right to immediate spot Gerber re-testing if the automated analyzer reading is disputed.\n` +
          `• Arbitrary quality deductions or cess without prior General Body approval are unlawful under cooperative law.\n\n` +
          `**Next Diagnostic Question for Your Case:**\n` +
          `Did the collection center supervisor provide you with a duplicate printed slip or spot Gerber re-test upon your objection?`;
      } else if (docLower.includes("expulsion") || docLower.includes("cause") || docLower.includes("disqualif")) {
        docAdvice =
          `Under Section 30 of the Cooperative Societies Act, expulsion requires strict compliance with statutory natural justice, a 30-day show-cause window, and a 2/3rd General Body majority.\n\n` +
          `**Statutory Natural Justice Requirements:**\n` +
          `• Any expulsion or disqualification without 30 days written notice and a personal hearing is legally void.\n` +
          `• **Emergency Redressal:** File an emergency stay petition before the Cooperative Ombudsman under Section 85A or District Deputy Registrar.\n\n` +
          `**Next Diagnostic Question for Your Case:**\n` +
          `Did the notice specify explicit factual charges, and were you granted a personal hearing before the General Body?`;
      } else {
        docAdvice =
          `Document examined against the Cooperative Societies Act and Model Bylaws.\n\n` +
          `**Relevant Grounding:** ${topDoc ? topDoc.title + " - " + topDoc.actOrBylaw + " (" + topDoc.section + ")" : "Cooperative Governance Principles"}.\n` +
          `• ${topDoc ? topDoc.content : "Every member has statutory rights to fair democratic governance, transparent records, and grievance redressal."}\n\n` +
          `**Next Diagnostic Question for Your Case:**\n` +
          `Would you like to draft a formal objection letter to the District Deputy Registrar (DDR) regarding this document?`;
      }
      fallbackReply = docAdvice;
    } else if (routing.category === "legal_rights") {
      fallbackReply = langTemplates.legalRights(
        routing.legalBasis,
        topDoc ? `${topDoc.actOrBylaw} (${topDoc.section})` : "Section 84 & 85A",
        topDoc ? topDoc.content : "Members have statutory rights against arbitrary actions, right to inspect audit books, and right to vote."
      );
    } else if (routing.category === "governance_procedural") {
      fallbackReply = langTemplates.governance(
        topDoc ? topDoc.actOrBylaw : "Model Cooperative Bylaws",
        topDoc ? topDoc.section : "Section 39",
        topDoc ? topDoc.content : "The managing committee is governed by democratic principles where every member holds one vote."
      );
    } else {
      fallbackReply = langTemplates.general(
        topDoc ? topDoc.content : "Welcome to Sahakar Sathi.",
        topDoc ? topDoc.title : "Cooperative Law",
        topDoc ? topDoc.actOrBylaw : "Cooperative Societies Act"
      );
    }

    const fallbackPrompts = getContextualChainedPrompts(
      message || (document ? document.name : ""),
      routing.category,
      routing.societyType,
      language as SupportedLanguage
    );

    const { cleanText, chainedPrompts, diagnosticQuestion } = extractChainedPrompts(
      fallbackReply,
      fallbackPrompts
    );

    return res.json({
      reply: cleanText,
      routing,
      chainedPrompts,
      diagnosticQuestion,
      citations: retrievedDocs.map((d) => ({
        title: d.title,
        actOrBylaw: d.actOrBylaw,
        section: d.section,
        category: d.category,
        snippet: d.content.substring(0, 160) + "...",
      })),
    });
  } catch (err: any) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "Internal server error occurred." });
  }
});

// 5. API: Letter Generator
app.post("/api/generate-letter", async (req: Request, res: Response) => {
  try {
    const {
      memberName,
      membershipNo,
      societyName,
      societyType,
      districtState,
      complaintType,
      allegationDetails,
      bylawCited,
      date,
      language = "en",
    } = req.body;

    const effectiveMemberName = (memberName && memberName.trim()) || "Active Cooperative Member";
    const effectiveSocietyName = (societyName && societyName.trim()) || "Primary Cooperative Society";
    const effectiveMembershipNo = (membershipNo && membershipNo.trim()) || "On Official Record";
    const effectiveDistrictState = (districtState && districtState.trim()) || "Cooperative District";
    const effectiveComplaintType = (complaintType && complaintType.trim()) || "Statutory Grievance & Member Rights Violation";
    const effectiveBylawCited = (bylawCited && bylawCited.trim()) || "Section 84 & 85A MSCS Act 2023 / State Cooperative Societies Act";
    const effectiveAllegation = (allegationDetails && allegationDetails.trim()) || "The managing committee has arbitrarily infringed upon statutory member rights and cooperative bylaws.";

    const currentDate = date || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    const langNames: Record<string, string> = {
      en: "English (Formal Legal Drafting)",
      hi: "Formal Hindi (कार्यालयीन हिंदी)",
      mr: "Formal Marathi (अधिकृत मराठी)",
      gu: "Formal Gujarati (સત્તાવાર ગુજરાતી)",
      ta: "Formal Tamil (அதிகாரபூர்வ தமிழ்)",
      te: "Formal Telugu (అధికారిక తెలుగు)",
      kn: "Formal Kannada (ಅಧಿಕೃತ ಕನ್ನಡ)",
      bn: "Formal Bengali (দাপ্তরিক বাংলা)",
      pa: "Formal Punjabi (ਦਫ਼ਤਰੀ ਪੰਜਾਬੀ)",
    };
    const targetLetterLanguage = langNames[language] || "English";

    // Try Gemini for hyper-personalized letter drafting
    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const letterPrompt = `Draft a complete, formal, and authoritative statutory grievance petition letter from an Indian cooperative society member.

CRITICAL MANDATORY INSTRUCTIONS:
1. Generate the ENTIRE letter strictly in: ${targetLetterLanguage}.
2. DO NOT use generic placeholders like "[Your Name]", "[Date]", or "[Address]". You MUST directly insert the actual case data:
   - Date: ${currentDate}
   - Petitioner Name: ${effectiveMemberName}
   - Membership Number: ${effectiveMembershipNo}
   - Cooperative Society: ${effectiveSocietyName} (${societyType || "Cooperative Society"})
   - District & State: ${effectiveDistrictState}
   - Subject / Issue: ${effectiveComplaintType}
   - Statutory Bylaws / Sections Cited: ${effectiveBylawCited}
   - Specific Factual Allegation: ${effectiveAllegation}

REQUIRED COMPLETE FORMAL PETITION FORMAT:
1. Date: ${currentDate}
2. Addressee:
   To: The District Deputy Registrar (DDR) / Cooperative Ombudsman,
   Department of Cooperation, District: ${effectiveDistrictState}
   Copy To: The Chairman / Secretary, ${effectiveSocietyName}
3. Petitioner Particulars:
   Petitioner: ${effectiveMemberName} | Membership No: ${effectiveMembershipNo} | Society: ${effectiveSocietyName}
4. Formal Subject:
   SUBJECT: Statutory Grievance Petition under ${effectiveBylawCited} regarding ${effectiveComplaintType}
5. Formal Salutation: Respected Sir / Madam (or respectful target language equivalent)
6. Numbered Legal Body Paragraphs:
   1. Petitioner Standing & Membership: Bona fide active member in continuous compliance with cooperative bylaws.
   2. Statement of Facts: Detailed narrative of the grievance based on: "${effectiveAllegation}".
   3. Statutory Grounds & Violations: Specific violations of ${effectiveBylawCited}.
   4. Prayer / Relief Sought:
      a) Direct the Society Management to immediately produce relevant records and remedy the grievance;
      b) Order a statutory inquiry / audit under Section 84/85A;
      c) Grant interim protection to safeguard the petitioner's member rights.
   5. Formal Verification:
      Solemn affirmation and verification that the statements are true and correct.
7. Signature Block:
   Respectfully submitted,
   (Signature of Petitioner)
   ${effectiveMemberName} (Membership No: ${effectiveMembershipNo})
   Place: ${effectiveDistrictState}
   Date: ${currentDate}
8. Enclosures:
   1. Copy of Member Passbook / ID Card
   2. Copy of Disputed Records / Written Protest`;

        const letterCandidateModels = ["gemini-2.5-flash", "gemini-2.5-pro"];
        let letterRes: any = null;

        for (const candidateModel of letterCandidateModels) {
          try {
            const letterPromise = ai.models.generateContent({
              model: candidateModel,
              contents: letterPrompt,
              config: {
                temperature: 0.2,
                thinkingConfig: { thinkingBudget: 0 },
                maxOutputTokens: 2048,
              },
            });

            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Letter generation timed out")), 16000)
            );

            letterRes = await Promise.race([letterPromise, timeoutPromise]);
            if (letterRes && letterRes.text && letterRes.text.trim().length > 150) {
              break;
            }
          } catch (mErr: any) {
            console.warn(`Letter model ${candidateModel} failed:`, mErr?.message || mErr);
          }
        }

        if (letterRes && letterRes.text && letterRes.text.trim().length > 150) {
          return res.json({ letterText: letterRes.text.trim() });
        }
      } catch (err) {
        console.warn("Letter generation AI fallback:", err);
      }
    }

    // Deterministic multilingual fallback template
    const letterLangKey = (language as SupportedLanguage) in FALLBACK_REPLIES ? (language as SupportedLanguage) : "en";
    const letterTemplate = FALLBACK_REPLIES[letterLangKey] || FALLBACK_REPLIES.en;
    const fallbackLetter = letterTemplate.letterDraft({
      memberName: effectiveMemberName,
      membershipNo: effectiveMembershipNo,
      societyName: effectiveSocietyName,
      location: effectiveDistrictState,
      complaintType: effectiveComplaintType,
      allegations: effectiveAllegation,
      bylawCited: effectiveBylawCited,
      date: currentDate,
    });

    return res.json({ letterText: fallbackLetter });
  } catch (error) {
    console.error("Letter generation error:", error);
    return res.status(500).json({ error: "Failed to generate grievance letter" });
  }
});

// Vite middleware in dev or static files in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sahakar Sathi Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
