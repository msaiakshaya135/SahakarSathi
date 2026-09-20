import { KBArticle, QueryCategory, RoutingResult, SocietyType } from "../types.ts";

export const COOPERATIVE_KB: KBArticle[] = [
  {
    id: "kb-voting-rights-mscs",
    title: "Voting Rights & Active Member Requirement",
    actOrBylaw: "Multi-State Co-operative Societies Act, 2002 (Amended 2023)",
    section: "Section 29 & Section 30",
    category: "legal_rights",
    applicableSocieties: ["all", "multistate", "dairy", "pacs_credit"],
    content:
      "Every active member has one vote in the affairs of the society. Under the MSCS 2023 Amendment, to remain an 'Active Member' eligible to vote or contest elections, a member MUST: (1) Attend at least 3 out of the last 5 Annual General Meetings (AGMs), and (2) Utilize the minimum level of products/services prescribed in bylaws (e.g., minimum milk poured in dairy co-op, or minimum transactions in credit society). No proxy voting is permitted; one individual holds exactly one vote regardless of shareholding quantity.",
    keyRights: [
      "One member, one vote (equality of franchise)",
      "Right to receive draft voter list at least 30 days before election",
      "Right to file objection within 7 days of draft voter list display",
      "Strict ban on proxy voting to prevent management manipulation",
    ],
    statutoryTimelines: "Voter list must be published 30 days prior to election date.",
    escalationAuthority: "Co-operative Election Authority / Returning Officer / District Deputy Registrar (DDR)",
    keywords: [
      "vote",
      "voting",
      "election",
      "active member",
      "disqualification",
      "voter list",
      "proxy",
      "franchise",
      "agm attendance",
      "मतदान",
      "चुनाव",
      "मतदाता सूची",
    ],
  },
  {
    id: "kb-grievance-ombudsman",
    title: "Cooperative Ombudsman & Member Grievance Redressal",
    actOrBylaw: "Multi-State Co-operative Societies (Amendment) Act, 2023",
    section: "Section 85A & Cooperative Grievance Rules",
    category: "legal_rights",
    applicableSocieties: ["all", "multistate", "dairy", "pacs_credit", "fpo"],
    content:
      "The Central Government appoints one or more Cooperative Ombudsman to adjudicate complaints from cooperative members regarding: (a) Denial of membership or voting rights, (b) Failure to provide audited balance sheets/books, (c) Corruption, nepotism or mismanagement by the Managing Committee, (d) Unlawful deduction or under-payment of milk/crop proceeds. The Ombudsman has powers equivalent to a Civil Court and must pass an order within 3 months.",
    keyRights: [
      "Right to approach Ombudsman without expensive court litigation fees",
      "Time-bound resolution within 90 days",
      "Protection against retaliatory cancellation of membership",
      "Ombudsman order is binding on the Board of Directors",
    ],
    statutoryTimelines: "Ombudsman must decide grievances within 90 days of filing.",
    escalationAuthority: "Cooperative Ombudsman / Central Registrar of Cooperative Societies (CRCS)",
    keywords: [
      "grievance",
      "complaint",
      "ombudsman",
      "dispute",
      "harassment",
      "fraud",
      "mismanagement",
      "corruption",
      "secretary",
      "board",
      "शिकायत",
      "लोकपाल",
      "तक्रार",
    ],
  },
  {
    id: "kb-arbitration-disputes",
    title: "Arbitration of Disputes (Member vs Management / Society)",
    actOrBylaw: "Multi-State Co-operative Societies Act, 2002 / State Co-op Acts",
    section: "Section 84 (MSCS Act) / Section 91 (State Acts)",
    category: "legal_rights",
    applicableSocieties: ["all", "multistate", "dairy", "pacs_credit", "housing"],
    content:
      "Any dispute touching the constitution, management, elections, or business of a cooperative society between members, past members, or the committee MUST be referred to Arbitration by the Registrar. Civil Courts have no jurisdiction over internal cooperative matters. The Arbitrator has authority to issue summons, examine records, grant injunctions, and issue awards with the force of a civil court decree.",
    keyRights: [
      "Civil court bar ensures fast, cooperative-focused adjudication",
      "Right to seek stay on illegal committee decisions or biased elections",
      "Right to legal representation in arbitration hearings",
    ],
    statutoryTimelines: "Disputes relating to elections must be filed within 30 to 60 days of result declaration.",
    escalationAuthority: "Registrar of Cooperative Societies / Appointed Arbitrator / Cooperative Court",
    keywords: [
      "arbitration",
      "section 84",
      "section 91",
      "cooperative court",
      "legal case",
      "injunction",
      "stay",
      "election dispute",
      "न्यायालय",
      "विवाद",
      "मध्यस्थता",
    ],
  },
  {
    id: "kb-inspect-books",
    title: "Right to Inspect Books, Registers & Audit Reports",
    actOrBylaw: "Cooperative Societies Model Bylaws & MSCS Act 2023",
    section: "Section 106 & 108 (MSCS) / Section 79 (State Acts)",
    category: "legal_rights",
    applicableSocieties: ["all", "dairy", "pacs_credit", "housing", "multistate"],
    content:
      "Every member has an absolute statutory right to inspect, free of charge during office hours: (1) The approved Bylaws of the Society, (2) The Register of Members and voter list, (3) The list of Board/Committee members, (4) The audited Balance Sheet, Profit & Loss statement, and Auditor's special report. A member is entitled to certified copies within 30 days upon paying a nominal statutory fee (typically Rs 5-20 per page). Refusal by the Chief Executive or Secretary attracts administrative penalties.",
    keyRights: [
      "Absolute right of financial inspection without needing board permission",
      "Right to receive certified copies of audit report within 30 days",
      "Right to inspect voter register and AGM attendance records",
    ],
    statutoryTimelines: "Certified copies must be furnished within 30 days of written application.",
    escalationAuthority: "District Deputy Registrar (DDR) / Assistant Registrar (ARCS)",
    keywords: [
      "inspect",
      "audit report",
      "balance sheet",
      "accounts",
      "records",
      "rti",
      "information",
      "minutes",
      "financials",
      "बहीखाता",
      "ऑडिट रिपोर्ट",
      "माहिती अधिकार",
    ],
  },
  {
    id: "kb-dairy-fat-testing",
    title: "Dairy Cooperative: Milk FAT/SNF Testing & Payment Transparency",
    actOrBylaw: "Model Dairy Cooperative Society Bylaws & NDDB Standards",
    section: "Bylaw Rule 18-22 (Milk Procurement & Pricing)",
    category: "governance_procedural",
    applicableSocieties: ["dairy"],
    content:
      "In a primary dairy cooperative (DCS), milk testing must be conducted transparently in the presence of the pouring farmer using automated milk analyzers and electronic weighing scales. Bylaws mandate: (1) Daily calibration of testing equipment with standard control milk, (2) Duplicate printed or digital slip issued on the spot showing weight, FAT%, SNF%, and calculated payable rate, (3) Right to spot re-test using the Gerber reference method if farmer disputes the reading, (4) Payment cycle strictly every 7 or 10 days without unilateral deductions.",
    keyRights: [
      "Right to witness FAT and SNF testing on calibrated analyzer",
      "Immediate printed/SMS receipt showing FAT%, SNF%, and payment rate",
      "Right to demand spot Gerber re-test in case of disputed reading",
      "Right to annual bonus/patronage rebate from dairy federation profits",
    ],
    statutoryTimelines: "Milk payment must be cleared within 7 to 10 days of the procurement cycle.",
    escalationAuthority: "District Cooperative Milk Union (Managing Director) / Quality Inspector / Registrar",
    keywords: [
      "dairy",
      "milk",
      "fat",
      "snf",
      "testing",
      "doodh",
      "दूध",
      "फैट",
      "anand pattern",
      "dairy union",
      "milk price",
      "weighing scale",
      "डेयरी",
    ],
  },
  {
    id: "kb-pacs-model-bylaws",
    title: "Primary Agricultural Credit Societies (PACS) Model Bylaws 2023",
    actOrBylaw: "Model Bye-laws for PACS (Ministry of Cooperation, GoI)",
    section: "Rules 4, 12, 28 & 42 (PACS Governance)",
    category: "governance_procedural",
    applicableSocieties: ["pacs_credit"],
    content:
      "The Ministry of Cooperation launched national Model Bylaws for PACS enabling them to operate as multi-purpose service centers (CSC, fertilizer distribution, custom hiring centers, grain storage). Key governance rules: (1) Managing Committee consists of 9 to 13 members, with mandatory reservation of 2 seats for women and 1 seat for SC/ST members, (2) Crop loan limits determined by District Technical Committee scales of finance, (3) Interest subvention (KCC 3% prompt repayment benefit) must be credited directly to farmer account.",
    keyRights: [
      "Fair access to Kisan Credit Card (KCC) and short-term agricultural loans",
      "Mandatory representation of women and marginalized farmers on Board",
      "Access to multi-service facilities (fertilizers, seeds, CSC services)",
    ],
    statutoryTimelines: "Managing Committee term is strictly 5 years.",
    escalationAuthority: "District Central Cooperative Bank (DCCB) / District Deputy Registrar (DDR)",
    keywords: [
      "pacs",
      "credit society",
      "loan",
      "kcc",
      "crop loan",
      "interest subvention",
      "agriculture",
      "farmer credit",
      "पैक्स",
      "ऋण",
      "किसान",
      "खाद",
    ],
  },
  {
    id: "kb-agm-procedures",
    title: "Annual General Meeting (AGM) Notice, Quorum & Conduct",
    actOrBylaw: "Cooperative Societies Acts & Model Bylaws",
    section: "Section 39 (MSCS Act) / Rule 14 (State Rules)",
    category: "governance_procedural",
    applicableSocieties: ["all", "multistate", "dairy", "pacs_credit", "housing"],
    content:
      "The Board MUST convene the Annual General Meeting (AGM) of the General Body within 6 months of the close of each financial year (on or before September 30th). Procedural requirements: (1) Notice period: Minimum 14 clear days notice in writing sent to all members or published in local newspapers, (2) Quorum: Minimum 1/5th of total active voting members or 50 members (whichever is less), (3) If quorum is not met, meeting is adjourned for 30 minutes; adjourned meeting transacts agenda without quorum requirement (except bylaw amendments).",
    keyRights: [
      "Right to receive agenda and audited balance sheet 14 days before AGM",
      "Right to speak, question expenditures, and vote on agenda items",
      "Decisions regarding bylaw amendments require 2/3rd majority",
    ],
    statutoryTimelines: "AGM must be held within 6 months of financial year close (by Sept 30).",
    escalationAuthority: "District Deputy Registrar (DDR) can supersede board if AGM is not held.",
    keywords: [
      "agm",
      "annual general meeting",
      "quorum",
      "notice period",
      "general body",
      "minutes",
      "adjournment",
      "आम सभा",
      "वार्षिक बैठक",
      "कोरम",
      "नोटीस",
    ],
  },
  {
    id: "kb-registration-steps",
    title: "Registration of a New Cooperative Society / FPO",
    actOrBylaw: "Cooperative Societies Act (Central MSCS / State Act)",
    section: "Section 6, 7 & 8 (Registration Provisions)",
    category: "governance_procedural",
    applicableSocieties: ["all", "multistate", "fpo", "dairy", "pacs_credit"],
    content:
      "Step-by-step registration for a new primary cooperative: (1) Minimum Promoters: At least 10 or 20 adult individuals belonging to different families residing in the area of operation, (2) First Promoters Meeting: Elect a Chief Promoter and adopt proposed bylaws, (3) Bank Account: Open a temporary account in a District Cooperative or Nationalized Bank to deposit initial share capital, (4) Application: Submit Form A to the Registrar along with 4 copies of bylaws, promoter affidavits, and bank certificate, (5) Statutory Deadline: Registrar must register or convey objections within 60 to 90 days; failing which deemed registration applies.",
    keyRights: [
      "Right to deemed registration if Registrar fails to decide within statutory timeline",
      "Right to appeal against rejection of registration to the Cooperative Tribunal within 60 days",
    ],
    statutoryTimelines: "Registrar must decide application within 60-90 days.",
    escalationAuthority: "Central Registrar (CRCS) for Multi-State / District Registrar for State Co-ops",
    keywords: [
      "register",
      "registration",
      "new society",
      "fpo",
      "promoters",
      "by-laws drafting",
      "chief promoter",
      "पंजीकरण",
      "रजिस्ट्रेशन",
      "नई समिति",
      "नोंदणी",
    ],
  },
  {
    id: "kb-expulsion-safeguards",
    title: "Protection Against Arbitrary Expulsion or Suspension",
    actOrBylaw: "Cooperative Societies Act & Supreme Court Precedents",
    section: "Section 30 (MSCS Act) / Section 35 (State Acts)",
    category: "legal_rights",
    applicableSocieties: ["all", "dairy", "pacs_credit", "multistate"],
    content:
      "A cooperative society cannot arbitrarily expel a member. Expulsion requires strict adherence to natural justice: (1) Issue a detailed Show Cause Notice with at least 15 days to reply, (2) Provide an opportunity of personal hearing before the General Body, (3) Expulsion resolution must be passed by a Special General Meeting with at least 2/3rd majority of members present and voting, (4) The resolution is INVALID until formally sanctioned and approved by the Registrar of Cooperative Societies. Until Registrar approves, member rights remain intact.",
    keyRights: [
      "Mandatory Show Cause Notice and personal hearing before expulsion",
      "Requires 2/3rd majority vote in General Body meeting",
      "Expulsion has no legal effect until approved in writing by the Registrar",
      "Right to appeal expulsion to the Cooperative Appellate Tribunal",
    ],
    statutoryTimelines: "Minimum 15 days notice to reply to show cause.",
    escalationAuthority: "Registrar of Cooperative Societies / Cooperative Appellate Tribunal",
    keywords: [
      "expel",
      "expulsion",
      "suspend",
      "suspension",
      "terminate membership",
      "show cause notice",
      "natural justice",
      "निष्कासन",
      "निलंबन",
      "सदस्यता रद्द",
    ],
  },
  {
    id: "kb-dividend-patronage",
    title: "Dividend & Patronage Rebate Distribution Rules",
    actOrBylaw: "Cooperative Societies Act & Model Bylaws",
    section: "Section 63 (Net Profit Distribution)",
    category: "governance_procedural",
    applicableSocieties: ["all", "dairy", "pacs_credit", "sugar"],
    content:
      "Statutory allocation of net profits: (1) At least 25% must be transferred to the Statutory Reserve Fund, (2) 1% to the Cooperative Education Fund, (3) Dividend on paid-up share capital cannot exceed the statutory ceiling (typically 12% to 15% per annum), (4) Remaining surplus is distributed as Patronage Bonus (e.g. bonus per liter of milk poured, or rebate on loan interest paid). Dividends approved by the AGM must be credited to members within 30 days.",
    keyRights: [
      "Right to proportionate patronage bonus based on actual volume of business with society",
      "Payment of declared dividend within 30 days of AGM",
      "Right to inspect Reserve Fund investments and balance sheets",
    ],
    statutoryTimelines: "Approved dividend must be paid within 30 days of AGM resolution.",
    escalationAuthority: "District Deputy Registrar (DDR)",
    keywords: [
      "dividend",
      "patronage bonus",
      "profit",
      "rebate",
      "surplus",
      "reserve fund",
      "लाभांश",
      "बोनस",
      "मुनाफा",
      "नफा वाटप",
    ],
  },
];

// Query Classifier: Classifies query into Governance/Procedural vs Legal/Rights vs Guided Workflow
export function classifyQuery(query: string, userSocietyType?: SocietyType): RoutingResult {
  const normalized = query.toLowerCase().trim();

  // Workflow triggers
  if (
    normalized.includes("check voting") ||
    normalized.includes("can i vote") ||
    normalized.includes("eligible to vote") ||
    normalized.includes("voting eligibility") ||
    normalized.includes("वोटिंग चेक") ||
    normalized.includes("मतदान तपासणी")
  ) {
    return {
      category: "guided_workflow",
      categoryName: "Guided Workflow • Voting Eligibility",
      categoryDescription: "Interactive state machine to verify active voting member criteria",
      confidence: 0.98,
      societyType: userSocietyType || "all",
      legalBasis: "Section 29 MSCS Act 2023 & Model Bylaw Rules",
      matchedKeywords: ["voting eligibility", "check vote"],
      suggestedWorkflowId: "flow-voting-rights",
    };
  }

  if (
    normalized.includes("file grievance") ||
    normalized.includes("draft complaint") ||
    normalized.includes("complaint letter") ||
    normalized.includes("file complaint") ||
    normalized.includes("शिकायत पत्र") ||
    normalized.includes("तक्रार अर्ज")
  ) {
    return {
      category: "guided_workflow",
      categoryName: "Guided Workflow • Grievance Redressal & Letter Draft",
      categoryDescription: "Step-by-step state machine with ready-to-print legal petition letter generator",
      confidence: 0.97,
      societyType: userSocietyType || "all",
      legalBasis: "Section 84 & 85A MSCS Act 2023 (Ombudsman & Arbitration)",
      matchedKeywords: ["grievance", "complaint letter"],
      suggestedWorkflowId: "flow-grievance-redressal",
    };
  }

  if (
    normalized.includes("register society") ||
    normalized.includes("registration step") ||
    normalized.includes("form a co-op") ||
    normalized.includes("start fpo") ||
    normalized.includes("पंजीकरण प्रक्रिया")
  ) {
    return {
      category: "guided_workflow",
      categoryName: "Guided Workflow • Cooperative Registration",
      categoryDescription: "Step-by-step state machine for forming a new cooperative society or FPO",
      confidence: 0.95,
      societyType: userSocietyType || "all",
      legalBasis: "Sections 6-8 MSCS Act & State Registration Rules",
      matchedKeywords: ["registration steps", "new society"],
      suggestedWorkflowId: "flow-coop-registration",
    };
  }

  // Legal & Rights Indicators
  const legalKeywords = [
    "right",
    "rights",
    "legal",
    "ombudsman",
    "arbitration",
    "dispute",
    "complaint",
    "grievance",
    "fraud",
    "corruption",
    "cheat",
    "cheating",
    "illegal",
    "unlawful",
    "expel",
    "expulsion",
    "suspended",
    "rejection",
    "harassment",
    "denied",
    "refused",
    "court",
    "tribunal",
    "section 84",
    "section 29",
    "section 30",
    "section 85a",
    "section 106",
    "advocate",
    "hearing",
    "show cause",
    "अधिकार",
    "शिकायत",
    "विवाद",
    "हक्क",
    "तक्रार",
    "गैरव्यवहार",
  ];

  // Governance & Procedural Indicators
  const governanceKeywords = [
    "procedure",
    "process",
    "rule",
    "rules",
    "bylaw",
    "bylaws",
    "bye-law",
    "quorum",
    "notice",
    "agm",
    "sgm",
    "general meeting",
    "tenure",
    "committee",
    "board",
    "director",
    "secretary",
    "chairman",
    "election authority",
    "term",
    "audit",
    "accounts",
    "balance sheet",
    "dividend",
    "bonus",
    "fat",
    "snf",
    "testing",
    "procurement",
    "kcc",
    "loan limit",
    "amendment",
    "प्रक्रिया",
    "नियम",
    "उपविधि",
    "बैठक",
    "कोरम",
  ];

  let legalScore = 0;
  let govScore = 0;
  const matchedLegal: string[] = [];
  const matchedGov: string[] = [];

  for (const kw of legalKeywords) {
    if (normalized.includes(kw)) {
      legalScore += 1;
      matchedLegal.push(kw);
    }
  }

  for (const kw of governanceKeywords) {
    if (normalized.includes(kw)) {
      govScore += 1;
      matchedGov.push(kw);
    }
  }

  // Detect society type if mentioned in query
  let detectedSociety: SocietyType = userSocietyType && userSocietyType !== "all" ? userSocietyType : "all";
  if (normalized.includes("milk") || normalized.includes("dairy") || normalized.includes("doodh") || normalized.includes("दूध")) {
    detectedSociety = "dairy";
  } else if (normalized.includes("pacs") || normalized.includes("credit") || normalized.includes("loan") || normalized.includes("पैक्स")) {
    detectedSociety = "pacs_credit";
  } else if (normalized.includes("fpo") || normalized.includes("farmer producer") || normalized.includes("fpc")) {
    detectedSociety = "fpo";
  } else if (normalized.includes("multi-state") || normalized.includes("mscs") || normalized.includes("national")) {
    detectedSociety = "multistate";
  }

  if (legalScore > govScore) {
    return {
      category: "legal_rights",
      categoryName: "Legal Rights & Dispute Redressal",
      categoryDescription: "Queries concerning member statutory protections, arbitration, or grievances against management",
      confidence: Math.min(0.7 + legalScore * 0.08, 0.98),
      societyType: detectedSociety,
      legalBasis:
        detectedSociety === "multistate"
          ? "MSCS Act 2023 (Sec 29, 84, 85A)"
          : "Cooperative Societies Act & Statutory Ombudsman Rules",
      matchedKeywords: matchedLegal,
      suggestedWorkflowId: "flow-grievance-redressal",
    };
  }

  if (govScore >= legalScore && govScore > 0) {
    return {
      category: "governance_procedural",
      categoryName: "Governance & Bylaw Procedures",
      categoryDescription: "Queries regarding meeting notices, election timelines, quorum, and official society operations",
      confidence: Math.min(0.7 + govScore * 0.08, 0.98),
      societyType: detectedSociety,
      legalBasis: "Approved Model Bylaws & Election Authority Directives",
      matchedKeywords: matchedGov,
      suggestedWorkflowId: normalized.includes("vote") || normalized.includes("election") ? "flow-voting-rights" : undefined,
    };
  }

  return {
    category: "general_faq",
    categoryName: "General Cooperative Knowledge",
    categoryDescription: "Broad query regarding cooperative principles, structure, or definitions",
    confidence: 0.75,
    societyType: detectedSociety,
    legalBasis: "Cooperative Societies Act & Bylaws Compendium",
    matchedKeywords: [],
  };
}

// RAG Search function: Vector/keyword hybrid search over knowledge base
export function searchKnowledgeBase(query: string, societyType?: SocietyType, limit = 4): KBArticle[] {
  const normalized = query.toLowerCase().trim();
  const queryTokens = normalized.split(/\s+/).filter((t) => t.length > 2);

  const scored = COOPERATIVE_KB.map((doc) => {
    let score = 0;

    // Direct keyword matches in content & title
    if (doc.title.toLowerCase().includes(normalized)) score += 40;
    if (doc.actOrBylaw.toLowerCase().includes(normalized)) score += 25;
    if (doc.section.toLowerCase().includes(normalized)) score += 30;

    for (const kw of doc.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 15;
      }
    }

    for (const token of queryTokens) {
      if (doc.title.toLowerCase().includes(token)) score += 8;
      if (doc.content.toLowerCase().includes(token)) score += 3;
      if (doc.section.toLowerCase().includes(token)) score += 10;
    }

    // Society type matching bonus
    if (societyType && societyType !== "all") {
      if (doc.applicableSocieties.includes(societyType)) {
        score += 12;
      }
    }

    return { doc, score };
  });

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  // Return top results, or default top articles if no match
  const filtered = scored.filter((item) => item.score > 0).map((item) => item.doc);
  return filtered.length > 0 ? filtered.slice(0, limit) : COOPERATIVE_KB.slice(0, limit);
}
