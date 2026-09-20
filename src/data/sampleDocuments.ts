import { UploadedDocument } from "../types.ts";

export interface SampleDocumentPreset {
  id: string;
  title: string;
  description: string;
  category: "governance" | "dairy" | "rights";
  badge: string;
  document: UploadedDocument;
  suggestedPrompt: string;
}

const agmNoticeText = `===============================================================
SAMARTH AGRI-CREDIT CO-OPERATIVE SOCIETY LTD.
Registration No: MSCS/CR/2012/842
Registered Office: Station Road, Nashik, Maharashtra - 422001
===============================================================
URGENT NOTICE OF 28TH ANNUAL GENERAL BODY MEETING (AGM)

Date of Notice: September 18, 2026
To: All Members of the Society

Notice is hereby given that the 28th Annual General Body Meeting (AGM) 
of Samarth Agri-Credit Co-operative Society Ltd. will be held on:

Date: September 24, 2026 (Thursday)
Time: 10:00 AM Sharp
Venue: Society Samaj Bhavan Hall, Nashik

AGENDA OF THE MEETING:
1. To read and confirm the minutes of the previous Annual General Meeting.
2. To receive and adopt the Annual Audit Report, Balance Sheet, and Profit & Loss Account for FY 2025-26.
3. To conduct election for 3 vacant Director positions on the Managing Committee.
4. To consider and pass resolution for the disqualification and removal of 42 members who questioned the Board's credit disbursement policy.
5. Any other matter with the permission of the Chairman.

NOTE FOR MEMBERS:
- Only members present physically by 10:00 AM will be permitted to vote.
- Proxy voting is strictly prohibited.
- Audit reports will be distributed at the meeting venue only on the morning of the AGM.

By Order of the Board of Directors,
Sd/-
Managing Director / Secretary
Samarth Agri-Credit Co-operative Society Ltd.
`;

const dairySlipText = `===============================================================
SAMRUDDHI DISTRICT CO-OPERATIVE MILK PRODUCERS UNION LTD.
Primary Village Dairy Co-op Society (DCS) - Center #42 (Sangamner)
AUTOMATED MILK PROCUREMENT & QUALITY SLIP
===============================================================
Slip No: DCS-2026/09/19-0884
Date & Time: 19-Sep-2026 06:45 AM
Shift: MORNING
Pourer Member Code: MEM-4092 (Shri Tukaram Patil)
Cattle Type: COW MILK
Quantity Weighed: 24.5 Litres

AUTOMATED TEST READINGS:
- Temperature: 28.4 C
- FAT Reading: 3.10%  [Disputed by Farmer: Normal baseline is 4.10%]
- SNF Reading: 7.90%  [Minimum standard: 8.50%]
- Quality Grade: SUB-STANDARD (B-Grade Deduction Applied)

PAYMENT CALCULATION:
- Base Rate: Rs. 38.00 / Litre
- Fat/SNF Quality Penalty: -Rs. 11.50 / Litre
- Net Payable Rate: Rs. 26.50 / Litre
- Gross Amount: Rs. 649.25
- Mandatory Deductions:
  * Milk Chilling Plant Cess: Rs. 60.00
  * Union Building Fund Levy: Rs. 45.00
- NET PAYABLE TO MEMBER: Rs. 544.25

*Notice: Spot re-test request declined by Center Supervisor due to morning queue.*
Collection Operator Signature: [Operator #09]
`;

const expulsionNoticeText = `===============================================================
PRAGATI MULTI-PURPOSE CO-OPERATIVE SOCIETY LTD.
Regd. Under Cooperative Societies Act | Reg No. ARCS/PUN/2018-912
Head Office: Market Yard, Pune - 411037
===============================================================
CONFIDENTIAL / REGISTERED POST
REF: PMCS/LEGAL/2026/EXP-019
DATE: September 14, 2026

TO:
Shri Rameshwar M. Jadhav
Membership No: PMCS-1104
Flat No. 402, Building B, Pune

SUBJECT: SHOW CAUSE NOTICE FOR EXPULSION FROM MEMBERSHIP UNDER SECTION 30 / BYLAW 12

Sir,

WHEREAS, you are an enrolled member holding 100 shares in Pragati Multi-Purpose Co-operative Society Ltd.

AND WHEREAS, the Managing Committee in its executive meeting held on 12th September 2026 noted that you have engaged in acts detrimental to the interest, reputation, and smooth financial management of the Society by circulating questions regarding the Society's latest audit report and election schedule.

NOW THEREFORE, in exercise of powers vested under Section 30 of the Cooperative Societies Act and Society Bylaw 12, you are hereby called upon to:

1. SHOW CAUSE in writing within forty-eight (48) hours of receipt of this notice as to why you should not be expelled from the membership of the Society and your shares forfeited.

2. TAKE NOTE that if no written reply is received within 48 hours, it will be presumed that you have no defense to offer, and the Managing Committee shall proceed to pass a resolution of expulsion at the upcoming meeting without any further personal hearing or correspondence.

By Order of the Managing Committee,
Sd/-
Honorary Secretary
Pragati Multi-Purpose Co-operative Society Ltd.
`;

function toBase64(str: string): string {
  if (typeof window !== "undefined" && window.btoa) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str, "utf-8").toString("base64");
}

export const SAMPLE_DOCUMENTS: SampleDocumentPreset[] = [
  {
    id: "sample-agm-notice",
    title: "AGM Notice (Defective 6-Day Period)",
    description: "Annual General Body notice served with only 6 days gap instead of mandatory 14 clear days.",
    category: "governance",
    badge: "14-Day Notice Violation",
    suggestedPrompt: "Check if this AGM meeting notice complies with the 14 clear days notice rule and audit inspection rights under cooperative law.",
    document: {
      name: "AGM_Notice_Samarth_AgriCredit.txt",
      type: "text/plain",
      size: agmNoticeText.length,
      base64Data: toBase64(agmNoticeText),
      textExcerpt: agmNoticeText.substring(0, 300) + "...",
    },
  },
  {
    id: "sample-dairy-slip",
    title: "Dairy Fat & SNF Deduction Slip",
    description: "Milk procurement receipt showing sharp fat drop (3.10%) and refusal of Gerber spot re-test.",
    category: "dairy",
    badge: "Milk Testing & Arbitrary Cut",
    suggestedPrompt: "Review this dairy procurement slip. Can the center supervisor refuse spot re-testing and make unilateral deductions?",
    document: {
      name: "Milk_Collection_Slip_DCS42.txt",
      type: "text/plain",
      size: dairySlipText.length,
      base64Data: toBase64(dairySlipText),
      textExcerpt: dairySlipText.substring(0, 300) + "...",
    },
  },
  {
    id: "sample-expulsion-notice",
    title: "Member Expulsion 48-Hr Notice",
    description: "Vague show cause notice demanding reply within 48 hours without specific charges or 30-day time.",
    category: "rights",
    badge: "Natural Justice & Sec 30 Violation",
    suggestedPrompt: "Is this 48-hour expulsion show cause notice legal? How can I challenge it before the Cooperative Registrar?",
    document: {
      name: "Show_Cause_Expulsion_Notice.txt",
      type: "text/plain",
      size: expulsionNoticeText.length,
      base64Data: toBase64(expulsionNoticeText),
      textExcerpt: expulsionNoticeText.substring(0, 300) + "...",
    },
  },
];
