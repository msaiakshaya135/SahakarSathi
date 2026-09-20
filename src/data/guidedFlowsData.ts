import { GuidedFlow } from "../types.ts";

export const GUIDED_FLOWS: Record<string, GuidedFlow> = {
  "flow-voting-rights": {
    id: "flow-voting-rights",
    title: "Check Voting Rights & Election Eligibility",
    titleHindi: "मतदान अधिकार और चुनाव पात्रता जांच",
    description: "Verify if you qualify as an 'Active Member' entitled to vote under Section 29 of the MSCS Act 2023 and Model Bylaws.",
    category: "governance_procedural",
    icon: "Vote",
    totalSteps: 4,
    steps: [
      {
        id: "step-society-type",
        question: "Select your Cooperative Society type:",
        questionHindi: "अपनी सहकारी संस्था का प्रकार चुनें:",
        description: "Voting and patronage criteria vary slightly between dairy, credit (PACS), and multi-state societies.",
        options: [
          { label: "Dairy Cooperative Society (DCS)", labelHindi: "डेयरी सहकारी समिति", value: "dairy" },
          { label: "Primary Agricultural Credit Society (PACS)", labelHindi: "प्राथमिक कृषि ऋण समिति (पैक्स)", value: "pacs" },
          { label: "Urban Credit / Thrift Society", labelHindi: "शहरी साख / क्रेडिट सोसाइटी", value: "credit" },
          { label: "Multi-State Cooperative Society", labelHindi: "मल्टी-स्टेट सहकारी समिति", value: "multistate" },
        ],
      },
      {
        id: "step-share-capital",
        question: "Have you fully paid your minimum Share Capital and Membership Fee?",
        questionHindi: "क्या आपने अपनी न्यूनतम शेयर पूंजी और सदस्यता शुल्क पूरी तरह से जमा कर दिया है?",
        description: "Under cooperative law, only members who hold at least one fully paid-up share have the right to exercise franchise.",
        options: [
          { label: "Yes, fully paid up with share certificate/passbook entry", labelHindi: "हाँ, शेयर प्रमाण पत्र/पासबुक के साथ पूर्ण भुगतान किया है", value: "yes" },
          { label: "Partially paid / Pending installments", labelHindi: "आंशिक भुगतान / किश्तें लंबित हैं", value: "partial", isDisqualifying: true, guidanceNote: "You must clear any unpaid share capital call before the final voter list publication date." },
          { label: "No / Not sure", labelHindi: "नहीं / जानकारी नहीं है", value: "no", isDisqualifying: true, guidanceNote: "Check your society passbook or ask the Secretary for your share certificate." },
        ],
      },
      {
        id: "step-agm-attendance",
        question: "Did you attend at least 3 of the last 5 Annual General Meetings (AGMs)?",
        questionHindi: "क्या आपने पिछली 5 वार्षिक आम बैठकों (AGM) में से कम से कम 3 में भाग लिया है?",
        description: "The 2023 Cooperative Amendment mandates attending at least 3 out of the last 5 AGMs to remain classified as an 'Active Member' with voting rights.",
        options: [
          { label: "Yes, attended 3 or more AGMs (signed attendance register)", labelHindi: "हाँ, 3 या अधिक बैठकों में भाग लिया और हस्ताक्षर किए", value: "attended_regular" },
          { label: "Attended only 1 or 2 AGMs", labelHindi: "केवल 1 या 2 बैठकों में भाग लिया", value: "attended_few", isDisqualifying: true, guidanceNote: "If the society failed to properly issue written AGM notices to you, this disqualification can be challenged before the District Deputy Registrar!" },
          { label: "Did not attend any / Society did not hold meetings", labelHindi: "किसी में भाग नहीं लिया / समिति ने बैठकें आयोजित नहीं कीं", value: "attended_none", isDisqualifying: true, guidanceNote: "If the Managing Committee failed to convene AGMs annually, the Board itself is liable for disqualification." },
        ],
      },
      {
        id: "step-disqualifications",
        question: "Do you have any overdue loan defaults or competing business conflicts?",
        questionHindi: "क्या आप पर कोई अतिदेय ऋण बकाया है या प्रतिस्पर्धी व्यापार का विवाद है?",
        description: "Members who are in default of society loans for more than 3 months or run competing businesses are disqualified from voting.",
        options: [
          { label: "No defaults; all dues and accounts are clear", labelHindi: "कोई बकाया नहीं; सभी खाते और देयताएं स्पष्ट हैं", value: "clear" },
          { label: "Yes, loan overdue for more than 90 days", labelHindi: "हाँ, 90 दिनों से अधिक का ऋण बकाया है", value: "default", isDisqualifying: true, guidanceNote: "Clear the overdue amount before the draft voter list objection period to reinstate your voting right." },
          { label: "Dispute regarding interest calculation", labelHindi: "ब्याज गणना को लेकर विवाद है", value: "disputed", guidanceNote: "Submit a written protest letter along with the undisputed principal amount." },
        ],
      },
    ],
    outcomeTemplates: {
      eligible: {
        status: "eligible",
        headline: "✅ You are fully eligible as an Active Voting Member!",
        details: "Based on your responses, you satisfy all requirements under Section 29 of the Cooperative Societies Act: fully paid share capital, minimum AGM attendance, and clean standing.",
        legalGrounding: "Section 29 (Voting Rights) & Model Bylaw Election Code",
        nextSteps: [
          "Check the Draft Voter List displayed at the society office at least 30 days before elections.",
          "Ensure your name and membership number match your official photo identity document.",
          "Remember: Voting is strictly personal (1 member = 1 vote); no proxy can cast your vote.",
        ],
      },
      disqualified_attendance: {
        status: "conditional",
        headline: "⚠️ Conditional Voting Status: Attendance Shortfall",
        details: "Under the 2023 Amendment, members must attend at least 3 of the last 5 AGMs. However, if the society did not send you notice 14 days in advance by registered post or local publication, the exclusion is legally invalid.",
        legalGrounding: "Section 39 (Notice of General Meetings) & Natural Justice",
        nextSteps: [
          "Inspect the AGM attendance register under Section 106 to verify past records.",
          "File an objection within 7 days of the draft voter list publication.",
          "If the society management deliberately excluded you, submit an immediate appeal to the Returning Officer / District Deputy Registrar (DDR).",
        ],
      },
      disqualified_arrears: {
        status: "action_required",
        headline: "⚠️ Action Required: Clear Overdue Arrears to Vote",
        details: "Cooperative bylaws disqualify members in default of loan installments or minimum transactions from voting.",
        legalGrounding: "Section 43 (Disqualifications for Membership & Voting)",
        nextSteps: [
          "Pay the overdue installment before the Returning Officer finalizes the voter list.",
          "Obtain an official 'No Due' receipt from the Society Secretary.",
          "Submit the receipt to the Election Authority to restore your voting franchise.",
        ],
      },
    },
  },

  "flow-grievance-redressal": {
    id: "flow-grievance-redressal",
    title: "File Grievance Against Management / Secretary",
    titleHindi: "प्रबंधन / सचिव के खिलाफ शिकायत और निवारण",
    description: "Step-by-step statutory dispute resolution flow under Section 84 & 85A, with automatic formal petition generator.",
    category: "legal_rights",
    icon: "FileText",
    totalSteps: 4,
    steps: [
      {
        id: "step-grievance-nature",
        question: "What is the primary nature of your grievance?",
        questionHindi: "आपकी शिकायत का मुख्य विषय क्या है?",
        description: "Selecting the correct category determines the statutory escalation pathway and responsible authority.",
        options: [
          { label: "Milk FAT/SNF manipulation or under-payment", labelHindi: "दूध फैट/एसएनएफ में हेराफेरी या कम भुगतान", value: "dairy_fat" },
          { label: "Arbitrary denial of voting right or exclusion from voter list", labelHindi: "मतदान अधिकार से मनमाना निष्कासन या मतदाता सूची से नाम हटाना", value: "voter_exclusion" },
          { label: "Refusal to provide inspection of accounts / audit report", labelHindi: "ऑडिट रिपोर्ट / वित्तीय बहीखाता दिखाने से इनकार", value: "audit_refusal" },
          { label: "Financial corruption, loan kickbacks or nepotism in committee", labelHindi: "वित्तीय भ्रष्टाचार, ऋण में रिश्वत या प्रबंध समिति की धांधली", value: "corruption" },
          { label: "Illegal suspension or expulsion from membership", labelHindi: "सदस्यता से अवैध निलंबन या निष्कासन", value: "illegal_expulsion" },
        ],
      },
      {
        id: "step-internal-notice",
        question: "Have you submitted a written complaint to the Society Board or Secretary?",
        questionHindi: "क्या आपने समिति बोर्ड या सचिव को लिखित शिकायत दी है?",
        description: "Statutory rules require first establishing that internal society redressal was sought with proof of delivery.",
        options: [
          { label: "Yes, and received acknowledgment / stamp on copy", labelHindi: "हाँ, और पावती/सील प्राप्त की है", value: "ack_received" },
          { label: "Yes, sent by Registered Post / Speed Post / Email", labelHindi: "हाँ, रजिस्टर्ड डाक या ईमेल द्वारा भेजी है", value: "postal_proof" },
          { label: "No, only complained verbally", labelHindi: "नहीं, केवल मौखिक रूप से बात की थी", value: "verbal_only", guidanceNote: "Always submit a written letter first and keep a stamped receiving copy. It serves as prime legal evidence!" },
        ],
      },
      {
        id: "step-timeline-elapsed",
        question: "How long has elapsed since your written complaint was submitted?",
        questionHindi: "लिखित शिकायत प्रस्तुत किए कितना समय बीत चुका है?",
        description: "Under Cooperative Grievance Rules, the Society has 15 to 30 days to reply or resolve the grievance.",
        options: [
          { label: "Less than 15 days", labelHindi: "15 दिनों से कम", value: "under_15" },
          { label: "15 to 30 days without satisfactory action", labelHindi: "15 से 30 दिन (कोई संतोषजनक कार्रवाई नहीं)", value: "15_to_30" },
          { label: "More than 30 days / Flatly refused to respond", labelHindi: "30 दिनों से अधिक / उत्तर देने से स्पष्ट इनकार", value: "over_30" },
        ],
      },
      {
        id: "step-escalation-target",
        question: "Which regulatory authority do you wish to escalate your petition to?",
        questionHindi: "आप अपनी शिकायत किस सक्षम प्राधिकारी को भेजना चाहते हैं?",
        description: "Choose your primary forum for formal intervention.",
        options: [
          { label: "District Deputy Registrar (DDR) / Assistant Registrar of Co-ops", labelHindi: "जिला उप-निबंधक (DDR) / सहायक निबंधक", value: "ddr" },
          { label: "Cooperative Ombudsman (Section 85A MSCS Act)", labelHindi: "सहकारी लोकपाल (धारा 85A)", value: "ombudsman" },
          { label: "Cooperative Arbitration Court (Section 84)", labelHindi: "सहकारी मध्यस्थता न्यायालय (धारा 84)", value: "court" },
        ],
      },
    ],
    outcomeTemplates: {
      eligible: {
        status: "eligible",
        headline: "⚖️ Ready to Escalate: Statutory Legal Petition",
        details: "You have satisfied the prerequisite grounds to file a formal statutory petition. Under the law, the Registrar / Ombudsman has the power to summon committee members, inspect accounts, and order corrective relief.",
        legalGrounding: "Section 84 & 85A MSCS Act 2023 / Section 79 & 91 State Acts",
        nextSteps: [
          "Generate and print the pre-drafted legal complaint letter below.",
          "Attach copies of your membership passbook, previous written letters, and receipts.",
          "Submit by Speed Post or in person to the District Deputy Registrar (DDR) / Ombudsman office.",
        ],
        canGenerateLetter: true,
      },
      verbal_warning: {
        status: "action_required",
        headline: "📝 Submit Written Representation First",
        details: "Courts and the Registrar require documentary proof that the society was formally notified in writing before they entertain a petition.",
        legalGrounding: "Principles of Administrative Natural Justice",
        nextSteps: [
          "Use our template to draft a formal representation to the Secretary.",
          "Ensure you get a stamped 'Receiving' with date on your duplicate copy.",
          "If no resolution within 15 days, immediately proceed with DDR/Ombudsman escalation.",
        ],
        canGenerateLetter: true,
      },
    },
  },

  "flow-coop-registration": {
    id: "flow-coop-registration",
    title: "Register a New Cooperative Society / FPO",
    titleHindi: "नई सहकारी समिति / एफपीओ का पंजीकरण",
    description: "Complete legal roadmap to establish a new primary dairy, credit, or farmer producer cooperative.",
    category: "governance_procedural",
    icon: "Building2",
    totalSteps: 4,
    steps: [
      {
        id: "step-society-model",
        question: "Which type of cooperative entity do you want to establish?",
        questionHindi: "आप किस प्रकार की सहकारी संस्था स्थापित करना चाहते हैं?",
        description: "Primary cooperatives operate within one state/district; Multi-State societies operate across multiple states.",
        options: [
          { label: "Primary Society (Dairy, PACS, or Credit in one State)", labelHindi: "प्राथमिक समिति (डेयरी, पैक्स या साख - एक राज्य में)", value: "primary" },
          { label: "Farmer Producer Organization (FPO / Producer Company)", labelHindi: "किसान उत्पादक संगठन (FPO/FPC)", value: "fpo" },
          { label: "Multi-State Cooperative Society (MSCS - 2+ states)", labelHindi: "मल्टी-स्टेट सहकारी समिति (2 या अधिक राज्य)", value: "multistate" },
        ],
      },
      {
        id: "step-promoter-count",
        question: "Do you have the minimum required number of adult promoters from different families?",
        questionHindi: "क्या आपके पास विभिन्न परिवारों के न्यूनतम आवश्यक वयस्क प्रवर्तक हैं?",
        description: "Statutory minimum: At least 10 adult individuals from distinct families for State co-ops (or 50 from each state for Multi-State co-ops).",
        options: [
          { label: "Yes, 10+ adults from separate households with Aadhaar & land/dairy proof", labelHindi: "हाँ, अलग-अलग परिवारों से 10+ वयस्क (आधार एवं प्रमाण पत्र सहित)", value: "promoters_ok" },
          { label: "5 to 9 members only", labelHindi: "केवल 5 से 9 सदस्य", value: "promoters_short", isDisqualifying: true, guidanceNote: "You must enlist at least 10 qualifying members from separate families to satisfy statutory registration minimums." },
          { label: "All members belong to the same immediate family", labelHindi: "सभी सदस्य एक ही परिवार से हैं", value: "same_family", isDisqualifying: true, guidanceNote: "Cooperative law strictly prohibits societies composed exclusively of members of a single family." },
        ],
      },
      {
        id: "step-first-meeting",
        question: "Have you conducted the first informal meeting of promoters?",
        questionHindi: "क्या आपने प्रवर्तकों की पहली बैठक आयोजित कर ली है?",
        description: "The promoters must elect a Chief Promoter, choose the society name, and resolve to open a temporary bank account.",
        options: [
          { label: "Yes, resolution passed and Chief Promoter elected", labelHindi: "हाँ, प्रस्ताव पारित और मुख्य प्रवर्तक का चयन हो चुका है", value: "meeting_done" },
          { label: "Not yet conducted", labelHindi: "अभी तक आयोजित नहीं की गई", value: "meeting_pending", guidanceNote: "Draft the minutes of the first meeting signed by all promoters; it is a compulsory attachment for Form A." },
        ],
      },
      {
        id: "step-bylaws-alignment",
        question: "Are your proposed bylaws based on the official Model Bylaws of the department?",
        questionHindi: "क्या आपकी प्रस्तावित उपविधियां विभाग के मॉडल नियमों पर आधारित हैं?",
        description: "Adopting official Model Bylaws guarantees swift registration approval within 60 days without arbitrary queries.",
        options: [
          { label: "Yes, adopted official Model Bylaws with required local insertions", labelHindi: "हाँ, आधिकारिक मॉडल उपविधियों को अपनाया गया है", value: "model_adopted" },
          { label: "Drafted custom bylaws from scratch", labelHindi: "स्वयं नए नियम तैयार किए हैं", value: "custom_bylaws", guidanceNote: "Ensure custom bylaws do not violate any mandatory clauses of the Cooperative Societies Act." },
        ],
      },
    ],
    outcomeTemplates: {
      eligible: {
        status: "eligible",
        headline: "📋 Ready to Submit Registration Dossier",
        details: "Your group meets all legal benchmarks: adequate promoter count from distinct families, elected Chief Promoter, and aligned bylaws.",
        legalGrounding: "Sections 6, 7 & 8 Cooperative Societies Act",
        nextSteps: [
          "Submit Form A along with 4 copies of proposed bylaws to the District Registrar office or CRCS online portal.",
          "Attach the bank certificate proving collection of initial share capital in the temporary account.",
          "Under Section 8, the Registrar must decide within 60 to 90 days, or grant deemed registration.",
        ],
      },
      shortfall: {
        status: "action_required",
        headline: "⚠️ Complete Statutory Promoter Pre-requisites",
        details: "Registrar will summarily reject applications that do not meet the minimum promoter household threshold.",
        legalGrounding: "Section 6 (Registration Qualifications)",
        nextSteps: [
          "Mobilize at least 10 independent adult farmers/artisans from different families.",
          "Conduct a formal promoters meeting to elect the Chief Promoter.",
          "Adopt the standardized departmental Model Bylaws to speed up clearance.",
        ],
      },
    },
  },

  "flow-inspect-books": {
    id: "flow-inspect-books",
    title: "Inspect Society Books, Records & Audit Reports",
    titleHindi: "समिति के बहीखाते, रिकॉर्ड और ऑडिट रिपोर्ट का निरीक्षण",
    description: "Exercise your fundamental statutory right under Section 106 & 108 to obtain financial transparency.",
    category: "legal_rights",
    icon: "Search",
    totalSteps: 3,
    steps: [
      {
        id: "step-document-type",
        question: "Which document or record do you wish to inspect?",
        questionHindi: "आप किस दस्तावेज या रिकॉर्ड का निरीक्षण करना चाहते हैं?",
        description: "Members have statutory rights to inspect statutory registers, balance sheets, and audit reports.",
        options: [
          { label: "Audited Balance Sheet & Auditor's Report", labelHindi: "ऑडिट की गई बैलेंस शीट एवं ऑडिटर रिपोर्ट", value: "audit_report" },
          { label: "Register of Members & Voter List", labelHindi: "सदस्य रजिस्टर एवं मतदाता सूची", value: "member_register" },
          { label: "Minutes of Annual General Meetings (AGMs)", labelHindi: "वार्षिक आम बैठकों (AGM) के कार्यवृत्त (Minutes)", value: "agm_minutes" },
          { label: "Society Bylaws and Amendments", labelHindi: "संस्था की उपविधियां और संशोधन", value: "bylaws" },
        ],
      },
      {
        id: "step-inspection-request-mode",
        question: "How did you request the document from the Secretary?",
        questionHindi: "आपने सचिव से दस्तावेज कैसे मांगा?",
        description: "An application must specify the document and be submitted during standard business hours.",
        options: [
          { label: "Formal written application with payment of statutory copying fees", labelHindi: "औपचारिक लिखित आवेदन (वैधानिक शुल्क सहित)", value: "formal_application" },
          { label: "Only oral request during office visit", labelHindi: "कार्यालय में केवल मौखिक अनुरोध", value: "oral_only", guidanceNote: "Always submit a written application referencing Section 106/108 so the 30-day statutory clock begins." },
        ],
      },
      {
        id: "step-secretary-action",
        question: "What was the management's reaction?",
        questionHindi: "प्रबंधन की क्या प्रतिक्रिया रही?",
        description: "Unreasonable refusal constitutes a statutory offense by the Chief Executive / Secretary.",
        options: [
          { label: "Refused access or demanded exorbitant illegal charges", labelHindi: "दिखाने से मना किया या अवैध शुल्क मांगा", value: "refused", isDisqualifying: true },
          { label: "Stated that records are unavailable / with auditor for months", labelHindi: "कहा कि रिकॉर्ड ऑडिटर के पास है और उपलब्ध नहीं है", value: "delayed", isDisqualifying: true },
          { label: "Allowed inspection but refused to provide certified copies", labelHindi: "दिखाया लेकिन प्रमाणित प्रतिलिपि देने से मना किया", value: "copies_refused" },
        ],
      },
    ],
    outcomeTemplates: {
      eligible: {
        status: "action_required",
        headline: "⚖️ Legal Remedy: File Section 108 Enforcement Application",
        details: "Under Section 106 & 108, denying a member access to audit reports or bylaws is a punishable regulatory violation.",
        legalGrounding: "Section 106 (Right of Information) & Section 108 (Penalties)",
        nextSteps: [
          "Send a final 7-day registered notice to the Secretary demanding certified copies as per statutory fees.",
          "If not delivered, file a complaint directly to the District Deputy Registrar (DDR).",
          "The DDR has powers to seize society records and levy administrative fines on the Secretary.",
        ],
        canGenerateLetter: true,
      },
    },
  },
};
