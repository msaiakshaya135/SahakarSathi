export type QueryCategory = "governance_procedural" | "legal_rights" | "guided_workflow" | "general_faq";

export type SocietyType = "all" | "dairy" | "pacs_credit" | "sugar" | "fpo" | "housing" | "multistate" | "general";

export type SupportedLanguage = "en" | "hi" | "mr" | "gu" | "ta" | "te" | "kn" | "bn" | "pa";

export type ActiveAppView = "chat" | "workflows" | "documents" | "bylaws";

export interface RoutingResult {
  category: QueryCategory;
  categoryName: string;
  categoryDescription: string;
  confidence: number;
  societyType: SocietyType;
  legalBasis: string;
  matchedKeywords: string[];
  suggestedWorkflowId?: string;
}

export interface KBArticle {
  id: string;
  title: string;
  actOrBylaw: string;
  section: string;
  category: "governance_procedural" | "legal_rights";
  applicableSocieties: SocietyType[];
  content: string;
  keyRights: string[];
  statutoryTimelines?: string;
  escalationAuthority?: string;
  keywords: string[];
}

export interface Citation {
  title: string;
  actOrBylaw: string;
  section: string;
  category: string;
  snippet: string;
}

export interface UploadedDocument {
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  base64Data: string;
  textExcerpt?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  document?: {
    name: string;
    type: string;
    size: number;
    dataUrl?: string;
  };
  routing?: RoutingResult;
  citations?: Citation[];
  suggestedAction?: {
    type: "guided_flow" | "draft_letter" | "view_bylaw";
    workflowId?: string;
    title: string;
  };
  chainedPrompts?: string[];
  chainStep?: number;
  diagnosticQuestion?: string;
}

export interface GuidedFlowStep {
  id: string;
  question: string;
  questionHindi?: string;
  description: string;
  options: {
    label: string;
    labelHindi?: string;
    value: string;
    isDisqualifying?: boolean;
    nextStepId?: string;
    guidanceNote?: string;
  }[];
}

export interface GuidedFlow {
  id: string;
  title: string;
  titleHindi: string;
  description: string;
  category: QueryCategory;
  icon: string;
  totalSteps: number;
  steps: GuidedFlowStep[];
  outcomeTemplates: Record<
    string,
    {
      status: "eligible" | "ineligible" | "conditional" | "action_required";
      headline: string;
      details: string;
      legalGrounding: string;
      nextSteps: string[];
      canGenerateLetter?: boolean;
    }
  >;
}
