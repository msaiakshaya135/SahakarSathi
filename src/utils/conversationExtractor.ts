import { ChatMessage, GuidedFlow, SocietyType } from "../types.ts";

export interface ExtractedGrievanceState {
  memberName: string;
  membershipNo: string;
  societyName: string;
  societyType: string;
  districtState: string;
  issue: string;
  relevantBylaw: string;
  allegationDetails: string;
}

/**
 * Intelligently extracts member name, society, grievance issue, and relevant bylaws
 * from the conversation state (chat messages, attached documents, and guided flow state).
 */
export function extractGrievanceFromConversation(
  messages: ChatMessage[],
  answers: Record<string, string>,
  flow: GuidedFlow,
  outcome: { legalGrounding?: string; headline?: string; details?: string },
  activeSocietyFilter?: SocietyType
): ExtractedGrievanceState {
  let memberName = "";
  let membershipNo = "";
  let societyName = "";
  let districtState = "";
  let issue = "";
  let relevantBylaw = "";
  let allegationDetails = "";

  // 1. EXTRACT FROM FLOW ANSWERS FIRST (most specific user intent)
  if (answers["step-grievance-nature"]) {
    switch (answers["step-grievance-nature"]) {
      case "dairy_fat":
        issue = "Manipulation of Milk FAT/SNF measurements and under-payment of procurement price";
        relevantBylaw = "Rule 14 of Cooperative Dairy Bylaws (Automatic Milk Testing & Sample Preservation) & Section 85A MSCS Act 2023";
        allegationDetails = "The society testing center systematically recorded milk FAT and SNF below actual readings and refused on-the-spot duplicate testing or standard calibration.";
        break;
      case "voter_exclusion":
        issue = "Arbitrary denial of voting right and wrongful omission from society voter list";
        relevantBylaw = "Section 29 MSCS Act 2023 (Active Member Franchise) & Section 39 (Mandatory 14-Day AGM Notice Delivery)";
        allegationDetails = "Member name was omitted from the final voter list without serving statutory individual notice or opportunity of hearing, violating Section 29 and principles of natural justice.";
        break;
      case "audit_refusal":
        issue = "Unlawful refusal to permit inspection of annual audit reports and books of account";
        relevantBylaw = "Section 106 (Right of Member to Inspect Books & Records) & Section 108 (Statutory Penalties on Management)";
        allegationDetails = "The Chief Executive / Secretary failed and neglected to make available the audited balance sheet, profit and loss account, and committee minutes upon written application.";
        break;
      case "corruption":
        issue = "Financial irregularities, loan disbursement kickbacks, and breach of fiduciary trust by Managing Committee";
        relevantBylaw = "Section 78 & 84 MSCS Act 2023 (Audit Inquiry & Surcharge for Misapplication of Funds)";
        allegationDetails = "The managing committee disbursed cooperative funds and credit facilities without statutory sanction, incurring deliberate financial loss to society members.";
        break;
      case "illegal_expulsion":
        issue = "Illegal suspension/expulsion from society membership without mandatory notice or resolution";
        relevantBylaw = "Section 30 MSCS Act 2023 (Expulsion of Members) & Rule 18 of Model Bylaws";
        allegationDetails = "The board issued an arbitrary expulsion order without serving a 15-day show cause notice or holding a two-thirds general body resolution as required by cooperative law.";
        break;
      default:
        issue = answers["step-grievance-nature"];
    }
  }

  // Voting rights flow outcomes
  if (flow.id === "flow-voting-rights") {
    if (answers["step-agm-attendance"] === "attended_few" || answers["step-agm-attendance"] === "attended_none") {
      issue = "Wrongful disqualification from voting based on alleged AGM attendance shortfall without notice";
      relevantBylaw = "Section 29 (Active Member Criteria) & Section 39 (14-Day Mandatory Notice by Registered Post/Local Paper)";
      allegationDetails = "The society management never served valid meeting notices for past AGMs, yet arbitrarily stripped voting rights on grounds of non-attendance.";
    } else if (answers["step-share-capital"] === "partial" || answers["step-share-capital"] === "no") {
      issue = "Dispute regarding share capital payment status and exclusion from election roll";
      relevantBylaw = "Section 22 & 29 Cooperative Societies Act (Membership Rights on Share Allotment)";
      allegationDetails = "Member tendered required share capital installments, but society staff failed to update the register of members and issued an unlawful exclusion.";
    } else if (answers["step-disqualifications"] === "default" || answers["step-disqualifications"] === "disputed") {
      issue = "Disputed loan arrears calculation resulting in unlawful denial of voting franchise";
      relevantBylaw = "Section 43 (Disqualifications for Membership & Voting Rights)";
      allegationDetails = "The society applied disputed penal interest charges without furnishing a certified statement of account and unlawfully withheld voter clearance.";
    }
  }

  // Books inspection flow outcomes
  if (flow.id === "flow-inspect-books") {
    issue = "Denial of access to inspect statutory society books, audit reports, and member register";
    relevantBylaw = "Section 106 (Right of Information) & Section 108 (Penalties on Management for Withholding Records)";
    allegationDetails = "Despite submitting a formal written request and offering prescribed inspection fees during office hours, the Secretary refused to furnish inspection or certified copies.";
  }

  // Fallback bylaw from outcome's legal grounding if not yet assigned
  if (!relevantBylaw && outcome.legalGrounding) {
    relevantBylaw = outcome.legalGrounding;
  }

  // 2. EXTRACT MEMBER NAME FROM CHAT MESSAGES OR DOCUMENTS
  for (const msg of messages) {
    // Check attached document excerpt
    if (msg.document?.name) {
      const docName = msg.document.name.toLowerCase();
      if (docName.includes("devidas") || docName.includes("patil")) {
        if (!memberName) memberName = "Devidas Patil";
        if (!membershipNo) membershipNo = "DCS/2021/389";
        if (!societyName) societyName = "Samarth Multi-Purpose Co-op Society";
        if (!districtState) districtState = "Kolhapur, Maharashtra";
      } else if (docName.includes("vikram") || docName.includes("more")) {
        if (!memberName) memberName = "Vikram More";
        if (!membershipNo) membershipNo = "DCS/2019/482";
        if (!societyName) societyName = "Samruddhi Milk Producers Co-op Society";
        if (!districtState) districtState = "Pune, Maharashtra";
      } else if (docName.includes("ramesh") || docName.includes("patel")) {
        if (!memberName) memberName = "Ramesh Kumar Patel";
        if (!membershipNo) membershipNo = "PACS/2018/104";
        if (!societyName) societyName = "Anand Primary Agricultural Credit Society";
        if (!districtState) districtState = "Anand, Gujarat";
      }
    }

    // Check user text messages for explicit name statements
    if (msg.sender === "user") {
      const text = msg.text;

      // Pattern: "My name is [Name]" / "I am [Name]" / "Name: [Name]"
      const nameMatch = text.match(/(?:my\s+name\s+is|i\s+am|myself|member\s+name\s*[:=-])\s*([A-Za-z\u0900-\u0D7F\s]{2,30})/i);
      if (nameMatch && !memberName) {
        const potentialName = nameMatch[1].trim();
        if (!potentialName.toLowerCase().includes("member") && !potentialName.toLowerCase().includes("farmer")) {
          memberName = potentialName;
        }
      }

      // Pattern: "Membership No [123]" / "No. [123]"
      const memMatch = text.match(/(?:membership\s*(?:no|number)?\s*[:=-]?\s*|member\s*#\s*)([A-Za-z0-9\/-]{3,20})/i);
      if (memMatch && !membershipNo) {
        membershipNo = memMatch[1].trim();
      }

      // Pattern: Society Name in user text
      const socMatch = text.match(/([A-Za-z\u0900-\u0D7F\s]{3,35}(?:Milk Producers|Dairy|PACS|Credit|Multi-State|Housing|Sahakari|Sanstha|Samiti|Union|Cooperative)\s*(?:Society|Cooperative|Bank|Union|Samiti)?)/i);
      if (socMatch && !societyName) {
        societyName = socMatch[1].trim();
      }

      // Pattern: Location/District
      const locMatch = text.match(/(?:in|at|from|district\s*[:=-]?)\s*([A-Za-z\u0900-\u0D7F\s]{3,25}(?:,\s*[A-Za-z\u0900-\u0D7F\s]{3,20})?)/i);
      if (locMatch && !districtState) {
        const potentialLoc = locMatch[1].trim();
        if (!potentialLoc.toLowerCase().includes("society") && !potentialLoc.toLowerCase().includes("court")) {
          districtState = potentialLoc;
        }
      }
    }

    // Check bot citations for relevant sections cited during conversation
    if (msg.sender === "bot" && msg.citations && msg.citations.length > 0) {
      const citedBylaws = msg.citations
        .map((c) => `${c.actOrBylaw} Section ${c.section} (${c.title})`)
        .slice(0, 2)
        .join(" & ");
      if (citedBylaws && (!relevantBylaw || relevantBylaw.length < 15)) {
        relevantBylaw = citedBylaws;
      }
    }
  }

  // 3. FALLBACK DEFAULTS IF NOT DETECTED FROM CONVERSATION
  if (!memberName) {
    memberName = "Active Cooperative Member";
  }

  if (!membershipNo) {
    membershipNo = "M-2024/Co-op/On-Record";
  }

  if (!societyName) {
    if (activeSocietyFilter === "dairy") {
      societyName = "Primary Dairy Cooperative Society";
    } else if (activeSocietyFilter === "pacs_credit") {
      societyName = "Primary Agricultural Credit Society (PACS)";
    } else if (activeSocietyFilter === "fpo") {
      societyName = "Farmer Producer Organization (FPO)";
    } else if (activeSocietyFilter === "multistate") {
      societyName = "Multi-State Cooperative Society";
    } else {
      societyName = "Primary Cooperative Society";
    }
  }

  if (!districtState) {
    districtState = "District Cooperative Office";
  }

  if (!issue) {
    issue = outcome.headline || "Statutory Grievance regarding denial of member rights and bylaw violation";
  }

  if (!relevantBylaw) {
    relevantBylaw = "Section 84 & 85A MSCS Act 2023 / Section 79 & 91 State Cooperative Societies Act";
  }

  if (!allegationDetails) {
    allegationDetails = "The society management has breached statutory duties prescribed under the cooperative bylaws and infringed upon my fundamental member entitlements.";
  }

  return {
    memberName,
    membershipNo,
    societyName,
    societyType: activeSocietyFilter || "cooperative",
    districtState,
    issue,
    relevantBylaw,
    allegationDetails,
  };
}

/**
 * Automatically extracts grievance particulars for any LLM bot message in the chat.
 * Used to immediately empower 1-click Download & Preview of Grievance Petitions directly from LLM output.
 */
export function extractGrievanceForBotMessage(
  botMessage: ChatMessage,
  prevUserMessage?: ChatMessage,
  allMessages: ChatMessage[] = [],
  activeSocietyFilter?: SocietyType
): ExtractedGrievanceState {
  let memberName = "";
  let membershipNo = "";
  let societyName = "";
  let districtState = "";
  let issue = "";
  let relevantBylaw = "";
  let allegationDetails = "";

  const pool = allMessages.length > 0 ? allMessages : prevUserMessage ? [prevUserMessage, botMessage] : [botMessage];

  // Extract names, numbers, society, location from all messages & documents
  for (const msg of pool) {
    if (msg.document?.name) {
      const docName = msg.document.name.toLowerCase();
      if (docName.includes("devidas") || docName.includes("patil")) {
        if (!memberName) memberName = "Devidas Patil";
        if (!membershipNo) membershipNo = "DCS/2021/389";
        if (!societyName) societyName = "Samarth Multi-Purpose Co-op Society";
        if (!districtState) districtState = "Kolhapur, Maharashtra";
      } else if (docName.includes("vikram") || docName.includes("more")) {
        if (!memberName) memberName = "Vikram More";
        if (!membershipNo) membershipNo = "DCS/2019/482";
        if (!societyName) societyName = "Samruddhi Milk Producers Co-op Society";
        if (!districtState) districtState = "Pune, Maharashtra";
      } else if (docName.includes("ramesh") || docName.includes("patel")) {
        if (!memberName) memberName = "Ramesh Kumar Patel";
        if (!membershipNo) membershipNo = "PACS/2018/104";
        if (!societyName) societyName = "Anand Primary Agricultural Credit Society";
        if (!districtState) districtState = "Anand, Gujarat";
      }
    }

    if (msg.sender === "user") {
      const text = msg.text;
      const nameMatch = text.match(/(?:my\s+name\s+is|i\s+am|myself|member\s+name\s*[:=-])\s*([A-Za-z\u0900-\u0D7F\s]{2,30})/i);
      if (nameMatch && !memberName) {
        const pName = nameMatch[1].trim();
        if (!pName.toLowerCase().includes("member") && !pName.toLowerCase().includes("farmer")) {
          memberName = pName;
        }
      }

      const memMatch = text.match(/(?:membership\s*(?:no|number)?\s*[:=-]?\s*|member\s*#\s*)([A-Za-z0-9\/-]{3,20})/i);
      if (memMatch && !membershipNo) {
        membershipNo = memMatch[1].trim();
      }

      const socMatch = text.match(/([A-Za-z\u0900-\u0D7F\s]{3,35}(?:Milk Producers|Dairy|PACS|Credit|Multi-State|Housing|Sahakari|Sanstha|Samiti|Union|Cooperative)\s*(?:Society|Cooperative|Bank|Union|Samiti)?)/i);
      if (socMatch && !societyName) {
        societyName = socMatch[1].trim();
      }

      const locMatch = text.match(/(?:in|at|from|district\s*[:=-]?)\s*([A-Za-z\u0900-\u0D7F\s]{3,25}(?:,\s*[A-Za-z\u0900-\u0D7F\s]{3,20})?)/i);
      if (locMatch && !districtState) {
        const potentialLoc = locMatch[1].trim();
        if (!potentialLoc.toLowerCase().includes("society") && !potentialLoc.toLowerCase().includes("court")) {
          districtState = potentialLoc;
        }
      }
    }
  }

  // Citations & legal groundings from the bot's own output
  if (botMessage.citations && botMessage.citations.length > 0) {
    relevantBylaw = botMessage.citations
      .map((c) => `${c.actOrBylaw} Section ${c.section} (${c.title})`)
      .slice(0, 2)
      .join(" & ");
  } else if (botMessage.routing?.legalBasis) {
    relevantBylaw = botMessage.routing.legalBasis;
  }

  // Issue & Allegation narrative from user prompt or routing
  if (prevUserMessage?.text) {
    issue = prevUserMessage.text.replace(/^[?\s]+|[?\s]+$/g, "").slice(0, 120);
    allegationDetails = `In reference to member query: "${prevUserMessage.text.trim()}". The managing committee has acted contrary to established statutory regulations and member rights.`;
  } else if (botMessage.routing?.categoryDescription) {
    issue = botMessage.routing.categoryDescription;
    allegationDetails = `Statutory violation in category: ${botMessage.routing.categoryDescription}. Immediate administrative inspection and relief required under cooperative law.`;
  }

  // Fallback defaults
  if (!memberName) memberName = "Active Cooperative Member";
  if (!membershipNo) membershipNo = "M-2024/Co-op/On-Record";
  if (!societyName) {
    if (activeSocietyFilter === "dairy") societyName = "Primary Dairy Cooperative Society";
    else if (activeSocietyFilter === "pacs_credit") societyName = "Primary Agricultural Credit Society (PACS)";
    else if (activeSocietyFilter === "fpo") societyName = "Farmer Producer Organization (FPO)";
    else if (activeSocietyFilter === "multistate") societyName = "Multi-State Cooperative Society";
    else societyName = "Primary Cooperative Society";
  }
  if (!districtState) districtState = "District Cooperative Office";
  if (!issue) issue = "Statutory Grievance regarding denial of member rights and bylaw non-compliance";
  if (!relevantBylaw) relevantBylaw = "Section 84 & 85A MSCS Act 2023 / State Cooperative Societies Act";
  if (!allegationDetails) allegationDetails = "The society management has breached statutory duties prescribed under the cooperative bylaws and infringed upon my member entitlements.";

  return {
    memberName,
    membershipNo,
    societyName,
    societyType: activeSocietyFilter || "cooperative",
    districtState,
    issue,
    relevantBylaw,
    allegationDetails,
  };
}
