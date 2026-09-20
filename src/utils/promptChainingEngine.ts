import { QueryCategory, SocietyType, SupportedLanguage } from "../types.ts";

export interface ParsedQAResponse {
  cleanText: string;
  chainedPrompts: string[];
  diagnosticQuestion?: string;
}

/**
 * Extracts [CHAINED_PROMPTS] block and diagnostic question from LLM output
 */
export function extractChainedPrompts(
  rawText: string,
  fallbackPrompts: string[] = []
): ParsedQAResponse {
  let cleanText = rawText;
  let chainedPrompts: string[] = [];
  let diagnosticQuestion: string | undefined = undefined;

  // 1. Extract [CHAINED_PROMPTS] ... [/CHAINED_PROMPTS]
  const promptMatch = rawText.match(/\[CHAINED_PROMPTS\]([\s\S]*?)\[\/CHAINED_PROMPTS\]/i);
  if (promptMatch) {
    const rawList = promptMatch[1];
    chainedPrompts = rawList
      .split("\n")
      .map((line) => line.replace(/^[\s*•\-–\d.)\]]+/, "").trim())
      .filter((line) => line.length > 5 && !line.toLowerCase().startsWith("prompt"));

    // Remove the block from the text shown to the user
    cleanText = rawText.replace(/\[CHAINED_PROMPTS\][\s\S]*?\[\/CHAINED_PROMPTS\]/i, "").trim();
  }

  // 2. If model did not produce the tag or produced < 2 prompts, use fallback prompts
  if (chainedPrompts.length < 2 && fallbackPrompts.length > 0) {
    chainedPrompts = fallbackPrompts.slice(0, 3);
  }

  // 3. Extract diagnostic question if formatted with standard headers
  const diagMatch = cleanText.match(
    /(?:Next Diagnostic Question|मामले का अगला सवाल|Diagnostic Question|Next Question|पुढील तपासणी प्रश्न|આગળનો પ્રશ્ન)[:\s*]+([^\n]+(?:\n[^\n]+)?)/i
  );
  if (diagMatch && diagMatch[1]) {
    diagnosticQuestion = diagMatch[1].replace(/[*_]/g, "").trim();
  }

  return {
    cleanText,
    chainedPrompts,
    diagnosticQuestion,
  };
}

/**
 * Provides context-aware chained prompt sequences when LLM doesn't supply them
 * or for fast one-click chaining in the user interface.
 */
export function getContextualChainedPrompts(
  query: string,
  category: QueryCategory,
  societyType: SocietyType = "all",
  language: SupportedLanguage = "en"
): string[] {
  const q = query.toLowerCase();

  // English chained prompts catalog
  if (language === "en") {
    // Milk & Dairy testing
    if (q.includes("milk") || q.includes("dairy") || q.includes("fat") || q.includes("snf") || societyType === "dairy") {
      return [
        "Can I demand an immediate spot Gerber re-test in front of me if reading is disputed?",
        "What is the statutory penalty if the society secretary tampers with the milk analyzer calibration?",
        "Draft a formal complaint letter to the District Milk Union Managing Director",
      ];
    }

    // Voting Rights & Disqualification
    if (q.includes("vote") || q.includes("voting") || q.includes("election") || q.includes("disqualif") || q.includes("voter list")) {
      return [
        "How can I file an urgent objection with the District Election Officer if my name is excluded?",
        "Can the managing committee disqualify me without serving a 30-day show-cause notice?",
        "What are the attendance exemptions under Section 29 if no AGM notice was served?",
      ];
    }

    // AGM, Notice & Governance
    if (q.includes("agm") || q.includes("notice") || q.includes("meeting") || q.includes("quorum") || q.includes("general body")) {
      return [
        "Is an AGM resolution legally void if members were given less than 14 clear days notice?",
        "What is the statutory quorum required to pass financial accounts and budget in AGM?",
        "How do I submit a formal requisition for a Special General Meeting (SGM)?",
      ];
    }

    // Inspection of Books & Accounts
    if (q.includes("inspect") || q.includes("audit") || q.includes("account") || q.includes("book") || q.includes("balance sheet")) {
      return [
        "What are my statutory inspection rights under Section 106 & 108 of the Cooperative Societies Act?",
        "What penalty applies to the Secretary or CEO for refusing to provide copies within 30 days?",
        "Draft an inspection application demanding copies of audited balance sheets and AGM minutes",
      ];
    }

    // Expulsion & Show-Cause
    if (q.includes("expul") || q.includes("show-cause") || q.includes("suspens") || q.includes("dismiss")) {
      return [
        "What principles of natural justice must the society follow before member expulsion under Section 30?",
        "Can the managing committee suspend me without a 2/3rd majority vote in the General Body?",
        "Draft an emergency stay petition to the District Deputy Registrar (DDR)",
      ];
    }

    // Default category based
    if (category === "legal_rights") {
      return [
        "What is the procedure to file a grievance before the Cooperative Ombudsman under Section 85A?",
        "What statutory timelines apply for appealing against an arbitrary committee decision?",
        "Draft a formal petition to the District Deputy Registrar (DDR) citing Section 84",
      ];
    }

    return [
      "What are the specific rights of active vs non-active members under Model Bylaws 2023?",
      "How do I inspect the society's register of members and last 3 years of audit reports?",
      "What legal remedies exist if the managing committee fails to hold elections on time?",
    ];
  }

  // Hindi chained prompts catalog
  if (language === "hi") {
    if (q.includes("दूध") || q.includes("डेयरी") || q.includes("फैट") || q.includes("snf") || societyType === "dairy") {
      return [
        "विवाद होने पर क्या मैं तुरंत अपने सामने गर्बर विधि से दोबारा जांच की मांग कर सकता हूँ?",
        "यदि सचिव मशीन की कैलिब्रेशन से छेड़छाड़ करता है तो क्या कानूनी कार्रवाई होगी?",
        "जिला दुग्ध संघ के प्रबंध निदेशक (MD) को आधिकारिक शिकायत पत्र तैयार करें",
      ];
    }

    if (q.includes("वोट") || q.includes("मतदान") || q.includes("चुनाव") || q.includes("मतदाता सूची") || q.includes("अयोग्य")) {
      return [
        "यदि मेरा नाम मतदाता सूची से काट दिया गया है तो चुनाव अधिकारी को आपत्ति कैसे दर्ज करें?",
        "क्या 30 दिन का कारण बताओ नोटिस दिए बिना प्रबंध समिति मुझे अयोग्य घोषित कर सकती है?",
        "धारा 29 के तहत यदि एजीएम का नोटिस नहीं मिला तो क्या छूट प्राप्त होगी?",
      ];
    }

    if (q.includes("एजीएम") || q.includes("नोटिस") || q.includes("बैठक") || q.includes("कोरम")) {
      return [
        "यदि 14 स्पष्ट दिनों की पूर्व सूचना नहीं दी गई तो क्या एजीएम के निर्णय रद्द हो सकते हैं?",
        "वार्षिक आम सभा में बजट पारित करने के लिए कानूनी गणपूर्ति (कोरम) कितनी आवश्यक है?",
        "विशेष आम सभा (SGM) बुलाने के लिए सदस्य मांग पत्र कैसे दाखिल करें?",
      ];
    }

    if (q.includes("ऑडिट") || q.includes("बहीखाता") || q.includes("निरीक्षण") || q.includes("हिसाब")) {
      return [
        "धारा 106 व 108 के तहत बहीखाता व ऑडिट रिपोर्ट देखने के मेरे क्या अधिकार हैं?",
        "यदि सचिव 30 दिन में प्रतियां देने से मना करे तो उस पर कितना जुर्माना लगता है?",
        "ऑडिट बैलेंस शीट व कार्यवाही रजिस्टर की प्रमाणित प्रति मांगने का आवेदन पत्र बनाएं",
      ];
    }

    return [
      "सहकारी लोकपाल (Ombudsman) के समक्ष धारा 85A में शिकायत दर्ज करने की क्या प्रक्रिया है?",
      "जिला उप-पंजीयक (DDR) के समक्ष धारा 84 के तहत वैधानिक याचिका का मसौदा तैयार करें",
      "सक्रिय सदस्य (Active Member) बनने के लिए न्यूनतम वार्षिक कारोबार व उपस्थिति के नियम क्या हैं?",
    ];
  }

  // Marathi chained prompts
  if (language === "mr") {
    return [
      "कलम १०६ व १०८ अन्वये लेखापरीक्षण अहवाल तपासण्याचे सभासदाचे कायदेशीर अधिकार काय आहेत?",
      "जिल्हा उपनिबंधक (DDR) यांच्याकडे कलम ८४/८५अ अंतर्गत तक्रार अर्ज कसा दाखल करावा?",
      "वार्षिक सर्वसाधारण सभेची (AGM) १४ दिवसांची पूर्वसूचना न दिल्यास काय कारवाई करता येईल?",
    ];
  }

  // Gujarati chained prompts
  if (language === "gu") {
    return [
      "કલમ ૧૦૬ અને ૧૦૮ હેઠળ ઓડિટ અહેવાલ અને ચોપડા તપાસવાના સભાસદના કાયદાકીય અધિકારો શું છે?",
      "જિલ્લા નાયબ રજિસ્ટ્રાર (DDR) સમક્ષ કલમ ૮૪ હેઠળ ઔપચારિક ફરિયાદ કેવી રીતે કરવી?",
      "દૂધ મંડળીમાં ફેટ અને SNF વિવાદ અંગે ગર્બર રી-ટેસ્ટિંગની માંગ કેવી રીતે કરવી?",
    ];
  }

  // Fallback default
  return [
    "What are the statutory escalation timelines before the District Deputy Registrar (DDR)?",
    "What is the procedure to inspect society accounts and audit reports under Section 106?",
    "Draft a formal statutory grievance petition letter citing relevant bylaws",
  ];
}
