import { SupportedLanguage } from "../types.ts";

export const FALLBACK_REPLIES: Record<
  SupportedLanguage,
  {
    legalRights: (legalBasis: string, section: string, content: string) => string;
    governance: (actOrBylaw: string, section: string, content: string) => string;
    general: (content: string, title: string, act: string) => string;
    letterDraft: (params: {
      memberName: string;
      membershipNo: string;
      societyName: string;
      location: string;
      complaintType: string;
      allegations: string;
      bylawCited?: string;
      date: string;
    }) => string;
  }
> = {
  en: {
    legalRights: (legalBasis, section, content) =>
      `As a registered member of a cooperative society, your democratic, inspection, and grievance rights are fully protected by statutory law under Section ${section} (${legalBasis}).\n\n` +
      `**Key Legal Provisions & Escalation Timeline:**\n` +
      `• ${content}\n` +
      `• **Mandatory Notice/Response Window:** The Managing Committee must respond to member requests within 15 to 30 days.\n` +
      `• **Escalation Forum:** If aggrieved, petition the **District Deputy Registrar (DDR)** or the **Cooperative Ombudsman** under Section 85A.\n\n` +
      `**Next Diagnostic Question for Your Case:**\n` +
      `Did the society committee issue a written decision or receipt with specific grounds, or was this communicated verbally?`,
    governance: (actOrBylaw, section, content) =>
      `Democratic governance in cooperatives requires strict compliance with registered model bylaws (${actOrBylaw} ${section}) and General Body oversight.\n\n` +
      `**Key Procedural Rules & Deadlines:**\n` +
      `• ${content}\n` +
      `• **Notice Period:** Minimum 14 clear days written notice is mandatory before convening an Annual General Body Meeting (AGM).\n` +
      `• **Quorum Requirement:** At least 1/5th of total active voting members or 50 members (whichever is less) must be present.\n\n` +
      `**Next Diagnostic Question for Your Case:**\n` +
      `Have you inspected the society's register of members and last approved audit balance sheet under Section 106?`,
    general: (content, title, act) =>
      `${content}\n\n` +
      `**Statutory Authority:** **${title} (${act})**\n\n` +
      `**Next Diagnostic Question for Your Case:**\n` +
      `Would you like to check your active member eligibility, inspect audit books, or draft a statutory grievance petition?`,

    letterDraft: ({ memberName, membershipNo, societyName, location, complaintType, allegations, bylawCited, date }) =>
      `DATE: ${date}\n\n` +
      `TO:\n` +
      `The District Deputy Registrar (DDR) / Cooperative Ombudsman,\n` +
      `Cooperative Societies Department, District: ${location}\n\n` +
      `COPY TO:\n` +
      `The Chairman / Secretary,\n` +
      `${societyName}\n\n` +
      `PETITIONER PARTICULARS:\n` +
      `Petitioner: ${memberName}\n` +
      `Membership No.: ${membershipNo}\n` +
      `Cooperative Society: ${societyName}\n` +
      `Location: ${location}\n\n` +
      `SUBJECT: FORMAL STATUTORY GRIEVANCE PETITION UNDER ${bylawCited || "SECTION 84 & 85A MSCS ACT 2023"} REGARDING ${complaintType.toUpperCase()}\n\n` +
      `Respected Authority,\n\n` +
      `I, ${memberName}, active member of ${societyName} bearing Membership No. ${membershipNo}, respectfully submit this statutory petition for immediate administrative intervention:\n\n` +
      `1. PETITIONER STANDING & MEMBERSHIP:\n` +
      `I am a bona fide active member of ${societyName} in continuous compliance with all registered bylaws and statutory provisions of the Cooperative Societies Act.\n\n` +
      `2. STATEMENT OF FACTS & GRIEVANCE:\n` +
      `${allegations}\n\n` +
      `3. STATUTORY GROUNDS & BYLAW VIOLATIONS:\n` +
      `- Direct violation of ${bylawCited || "Model Bylaws and Section 84/85A of the Cooperative Societies Act"}.\n` +
      `- Unlawful infringement of statutory member rights, procedural transparency, and natural justice.\n\n` +
      `4. PRAYER / SPECIFIC RELIEF SOUGHT:\n` +
      `In light of the above facts, I humbly pray that your esteemed office may be pleased to:\n` +
      `a) Direct the Society Management to immediately produce the relevant books, registers, and records;\n` +
      `b) Order a statutory inquiry / audit under Section 84/85A to rectify this grievance;\n` +
      `c) Grant interim protection safeguarding my membership rights and entitlements.\n\n` +
      `5. FORMAL VERIFICATION & DECLARATION:\n` +
      `I, ${memberName}, do hereby verify and declare that the statements made herein are true and correct to the best of my knowledge and belief.\n\n` +
      `Respectfully submitted,\n\n` +
      `___________________________\n` +
      `(Signature of Petitioner)\n` +
      `${memberName}\n` +
      `Membership No.: ${membershipNo}\n` +
      `Place: ${location}\n` +
      `Date: ${date}\n\n` +
      `ENCLOSURES:\n` +
      `1. Copy of Member Passbook / ID Card\n` +
      `2. Relevant supporting receipts / transaction records`,
  },

  hi: {
    legalRights: (legalBasis, section, content) =>
      `सहकारी समिति के सदस्य के रूप में धारा ${section} (${legalBasis}) के तहत आपके लोकतांत्रिक व वैधानिक अधिकारों को कानून द्वारा पूर्ण संरक्षण प्राप्त है।\n\n` +
      `**प्रमुख कानूनी प्रावधान व समयसीमा:**\n` +
      `• ${content}\n` +
      `• **अनिवार्य सूचना व समयसीमा:** समिति प्रबंधन को सदस्य के आवेदन पर 15 से 30 दिनों के भीतर लिखित निर्णय देना अनिवार्य है।\n` +
      `• **अपील प्राधिकारी:** असंतुष्ट होने पर **जिला उप-पंजीयक (DDR)** अथवा धारा 85A के तहत **सहकारी लोकपाल** के समक्ष याचिका दायर करें।\n\n` +
      `**मामले का अगला सवाल:**\n` +
      `क्या प्रबंध समिति ने आपको कारणों सहित कोई लिखित आदेश/नोटिस दिया है, अथवा यह केवल मौखिक रूप से कहा गया है?`,
    governance: (actOrBylaw, section, content) =>
      `सहकारी समिति का संचालन पंजीकृत उपविधियों (${actOrBylaw} ${section}) व साधारण सभा (General Body) की लोकतांत्रिक मर्यादाओं के अनुरूप होना अनिवार्य है।\n\n` +
      `**प्रक्रियात्मक नियम व समयसीमा:**\n` +
      `• ${content}\n` +
      `• **सूचना अवधि:** वार्षिक आम सभा (AGM) बुलाने से पूर्व कम से कम 14 स्पष्ट दिनों का लिखित नोटिस अनिवार्य है।\n` +
      `• **कोरम (गणपूर्ति):** कुल सक्रिय सदस्यों का कम से कम 1/5वां भाग या 50 सदस्य (जो भी कम हो) उपस्थित होना आवश्यक है।\n\n` +
      `**मामले का अगला सवाल:**\n` +
      `क्या आपने धारा 106 के तहत समिति का सदस्य रजिस्टर और अंतिम अनुमोदित ऑडिट रिपोर्ट की प्रति मांगी है?`,
    general: (content, title, act) =>
      `${content}\n\n` +
      `**संबद्ध कानूनी संदर्भ:** **${title} (${act})**\n\n` +
      `**मामले का अगला सवाल:**\n` +
      `क्या आप अपने मतदान अधिकार की जांच करना चाहते हैं, ऑडिट बहीखाता देखना चाहते हैं, या औपचारिक शिकायत पत्र तैयार करना चाहते हैं?`,

    letterDraft: ({ memberName, membershipNo, societyName, location, complaintType, allegations, bylawCited, date }) =>
      `दिनांक: ${date}\n\n` +
      `सेवा में:\n` +
      `जिला उप-पंजीयक (DDR) / सहायक निबंधक,\n` +
      `सहकारिता विभाग, जिला: ${location}\n\n` +
      `प्रतिलिपि:\n` +
      `अध्यक्ष / सचिव,\n` +
      `${societyName}\n\n` +
      `याचिकाकर्ता का विवरण:\n` +
      `नाम: ${memberName} | सदस्यता क्रमांक: ${membershipNo} | समिति: ${societyName}\n\n` +
      `विषय: ${bylawCited || "धारा 84 व 85A, सहकारिता अधिनियम"} के तहत औपचारिक शिकायत एवं याचिका - ${complaintType}\n\n` +
      `महोदय / महोदया,\n\n` +
      `मैं, ${memberName} (सदस्यता क्रमांक: ${membershipNo}), ${societyName} का सक्रिय व निष्ठावान सदस्य, तत्काल प्रशासनिक हस्तक्षेप हेतु यह याचिका प्रस्तुत कर रहा हूँ:\n\n` +
      `1. याचिकाकर्ता की स्थिति व सदस्यता:\n` +
      `मैं समिति का पंजीकृत सक्रिय सदस्य हूँ तथा उपविधियों के सभी नियमों का निरंतर पालन करता रहा हूँ।\n\n` +
      `2. मामले के मुख्य तथ्य एवं शिकायत:\n` +
      `${allegations}\n\n` +
      `3. अधिनियम व उपविधियों का उल्लंघन:\n` +
      `- प्रबंधन द्वारा ${bylawCited || "धारा 84/85A व मॉडल उपविधियों"} का खुला उल्लंघन किया गया है।\n` +
      `- प्राकृतिक न्याय के सिद्धांतों तथा सदस्यों के वैधानिक अधिकारों की उपेक्षा की गई है।\n\n` +
      `4. प्रार्थना एवं न्यायोचित मांग:\n` +
      `अतः श्रीमान जी से सविनय निवेदन है कि:\n` +
      `क) समिति प्रबंधन को मूल रिकॉर्ड एवं बहीखाता प्रस्तुत करने तथा समाधान का निर्देश दें;\n` +
      `ख) सहकारिता अधिनियम के तहत वैधानिक जांच का आदेश देकर सदस्य अधिकारों की रक्षा करें;\n` +
      `ग) मामले के अंतिम निस्तारण तक आवश्यक अंतरिम संरक्षण प्रदान करें।\n\n` +
      `5. औपचारिक सत्यापन एवं घोषणा:\n` +
      `मैं, ${memberName}, सत्यनिष्ठा से सत्यापित करता हूँ कि उक्त विवरण मेरी जानकारी एवं विश्वास के अनुसार सत्य है।\n\n` +
      `भवदीय,\n\n` +
      `___________________________\n` +
      `(हस्ताक्षर याचिकाकर्ता)\n` +
      `${memberName}\n` +
      `सदस्यता क्रमांक: ${membershipNo}\n` +
      `स्थान: ${location}\n` +
      `दिनांक: ${date}\n\n` +
      `संलग्नक:\n` +
      `1. सदस्यता पासबुक / पहचान पत्र की प्रति\n` +
      `2. संबंधित साक्ष्य व रसीदें`,
  },

  mr: {
    legalRights: (legalBasis, section, content) =>
      `सहकारी संस्थेचा सदस्य म्हणून कायद्याने कलम ${section} (${legalBasis}) अंतर्गत तुमचे हक्क संरक्षित केलेले आहेत.\n\n` +
      `**महत्त्वाची कायदेशीर तरतूद:**\n` +
      `${content}\n\n` +
      `**तातडीने करावयाची कायदेशीर कार्यवाही:**\n` +
      `1. सचिव / व्यवस्थापक समितीकडे लेखी अर्ज दाखल करून त्याची पोहोच पावती (Ack) घ्या.\n` +
      `2. १५ ते ३० दिवसांत निवारण न झाल्यास **जिल्हा उपनिबंधक (DDR)** किंवा **सहकारी लोकपाल** यांच्याकडे तक्रार करा.\n` +
      `3. निवडणूक किंवा आर्थिक वादासाठी कलम ८४ किंवा ९१ अंतर्गत लवाद (Arbitration) दाखल करा.\n\n` +
      `*टीप: वर दिलेल्या मार्गदर्शित फ्लो मधून थेट तक्रार अर्ज तयार करा!*`,
    governance: (actOrBylaw, section, content) =>
      `सहकारी संस्था कारभार व उपविधी कार्यपद्धतीनुसार (${actOrBylaw} ${section}):\n\n` +
      `${content}\n\n` +
      `**लक्षात ठेवण्याचे महत्त्वाचे नियम:**\n` +
      `• **नोटीस कालावधी:** वार्षिक सर्वसाधारण सभा (AGM) बोलावण्यापूर्वी किमान १४ दिवस अगोदर नोटीस देणे बंधनकारक आहे.\n` +
      `• **कोरम (गणसंख्या):** एकूण सक्रिय मतदारांपैकी किमान १/५ किंवा ५० सदस्य उपस्थित असणे आवश्यक आहे.\n` +
      `• **मतदानाचा हक्क:** सदस्याने मागील वर्षात संस्थेचे ठरवून दिलेले किमान व्यवहार पूर्ण केलेले असावेत.\n\n` +
      `*मार्गदर्शित प्रक्रियेसाठी वरील बटनांचा वापर करा!*`,
    general: (content, title, act) =>
      `${content}\n\nकायदेशीर संदर्भ: **${title} (${act})**`,
    letterDraft: ({ memberName, membershipNo, societyName, location, complaintType, allegations, date }) =>
      `दिनांक: ${date}\n\n` +
      `प्रति,\nमा. जिल्हा उपनिबंधक (DDR) / सहाय्यक निबंधक, सहकारी संस्था,\nजिल्हा: ${location}\n\n` +
      `प्रत माहितीसाठी:\nअध्यक्ष / सचिव,\n${societyName}\n\n` +
      `विषय: सहकारी संस्था कायदा व उपविधीनुसार तक्रार अर्ज - ${complaintType}\n\n` +
      `महोदय,\n\n` +
      `मी, ${memberName}, सभासद क्र. ${membershipNo}, ${societyName} चा नियमित सभासद असून खालील बाबींवर आपल्या हस्तक्षेपाची विनंती करत आहे:\n\n` +
      `१. तक्रारीचा तपशील:\n${allegations}\n\n` +
      `२. कायदेशीर तरतुदींचा भंग:\nसंस्थेच्या कारभारात नैसर्गिक न्याय आणि सभासदांच्या वैधानिक अधिकारांचे उल्लंघन झाले आहे.\n\n` +
      `३. मागणी / प्रार्थना:\nसदर प्रकरणाची चौकशी करून संस्थेच्या व्यवस्थापनाला योग्य ते आदेश द्यावेत आणि माझे सभासद हक्क पूर्ववत करावेत.\n\n` +
      `आपला नम्र,\n\n___________________________\n${memberName}\nसभासद क्र.: ${membershipNo}`,
  },

  gu: {
    legalRights: (legalBasis, section, content) =>
      `સહકારી મંડળીના સભ્ય તરીકે કલમ ${section} (${legalBasis}) હેઠળ તમારા અધિકારો કાયદા હેઠળ સુરક્ષિત છે.\n\n` +
      `**મુખ્ય કાનૂની જોગવાઈ:**\n` +
      `${content}\n\n` +
      `**તાત્કાલિક લેવાના પગલાં:**\n` +
      `1. મંત્રી / વ્યવસ્થાપક સમિતિને લેખિત અરજી આપો અને પહોંચ લો.\n` +
      `2. ૧૫-૩૦ દિવસમાં ઉકેલ ન આવે તો **જિલ્લા નાયબ રજિસ્ટ્રાર (DDR)** અથવા **સહકારી લોકપાલ** સમક્ષ ફરિયાદ કરો.\n` +
      `3. ચૂંટણી અથવા હિસાબી વિવાદ માટે કલમ 84 હેઠળ આર્બિટ્રેશન દાખલ કરો.`,
    governance: (actOrBylaw, section, content) =>
      `વહીવટ અને પેટાનિયમ પ્રક્રિયા (${actOrBylaw} ${section}):\n\n` +
      `${content}\n\n` +
      `**ધ્યાનમાં રાખવાના નિયમો:**\n` +
      `• વાર્ષિક સામાન્ય સભા (AGM) ની ઓછામાં ઓછી ૧૪ દિવસ અગાઉ નોટિસ આપવી ફરજિયાત છે.\n` +
      `• કોરમ: કુલ સક્રિય સભ્યોના ૧/૫ ભાગ અથવા ૫૦ સભ્યોની હાજરી જરૂરી છે.`,
    general: (content, title, act) => `${content}\n\nસંદર્ભ: **${title} (${act})**`,
    letterDraft: ({ memberName, membershipNo, societyName, location, complaintType, allegations, date }) =>
      `તારીખ: ${date}\n\nપ્રતિ,\nજિલ્લા રજિસ્ટ્રાર સાહેબ, સહકારી મંડળીઓ, જિલ્લો: ${location}\n\nનકલ રવાના: પ્રમુખ / મંત્રીશ્રી, ${societyName}\n\nવિષય: સહકારી કાયદા હેઠળ ફરિયાદ અરજી બાબત - ${complaintType}\n\nમાનનીય સાહેબ,\nહું ${memberName}, સભ્ય નંબર ${membershipNo}, ${societyName} નો સભ્ય છું. મારી ફરિયાદ નીચે મુજબ છે:\n${allegations}\n\nઆ બાબતે યોગ્ય તપાસ કરી ન્યાય આપવા વિનંતી છે.\n\nઆપનો વિશ્વાસુ,\n${memberName}`,
  },

  ta: {
    legalRights: (legalBasis, section, content) =>
      `கூட்டுறவு சங்கத்தின் உறுப்பினராக பிரிவு ${section} (${legalBasis}) கீழ் உங்களின் உரிமைகள் சட்டப்பூர்வமாக பாதுகாக்கப்படுகின்றன.\n\n` +
      `**முக்கிய சட்டப்பிரிவு:**\n` +
      `${content}\n\n` +
      `**உடனடி நடவடிக்கைகள்:**\n` +
      `1. சங்க செயலாளருக்கு எழுத்துப்பூர்வ மனு அளித்து ரசீது பெறவும்.\n` +
      `2. தீர்வு கிடைக்கவில்லை எனில் **மாவட்ட துணை பதிவாளர் (DDR)** அல்லது **கூட்டுறவு குறைதீர்ப்பாளர்** அவர்களிடம் மனு அளிக்கவும்.\n` +
      `3. தேர்தல் அல்லது நிதி விவகாரங்களுக்கு பிரிவு 84ன் கீழ் மேல்முறையீடு செய்யவும்.`,
    governance: (actOrBylaw, section, content) =>
      `நிர்வாகம் மற்றும் துணைவிதிகள் (${actOrBylaw} ${section}):\n\n` +
      `${content}\n\n` +
      `**நினைவில் கொள்ள வேண்டிய விதிகள்:**\n` +
      `• ஆண்டு பொதுக்குழு கூட்டம் (AGM) கூட்ட குறைந்தது 14 நாட்கள் முன்னறிவிப்பு கட்டாயம்.\n` +
      `• கோரம்: மொத்த செயலில் உள்ள உறுப்பினர்களில் 1/5 பங்கு அல்லது 50 உறுப்பினர்கள் வர வேண்டும்.`,
    general: (content, title, act) => `${content}\n\nசட்டப்பிரிவு: **${title} (${act})**`,
    letterDraft: ({ memberName, membershipNo, societyName, location, complaintType, allegations, date }) =>
      `தேதி: ${date}\n\nபெறுநர்:\nமாவட்ட துணை பதிவாளர் (DDR), கூட்டுறவுத்துறை, மாவட்டம்: ${location}\n\nநகல்: தலைவர்/செயலாளர், ${societyName}\n\nபொருள்: கூட்டுறவு சட்டம் மற்றும் துணைவிதிகளின்படி புகார் மனு - ${complaintType}\n\nஐயா/அம்மா,\nநான் ${memberName} (உறுப்பினர் எண்: ${membershipNo}), ${societyName} சங்கத்தின் உறுப்பினர். எனது புகார் விவரம்:\n${allegations}\n\nஉரிய விசாரணை மேற்கொண்டு நடவடிக்கை எடுக்குமாறு கேட்டுக்கொள்கிறேன்.\n\nஇப்படிக்கு,\n${memberName}`,
  },

  te: {
    legalRights: (legalBasis, section, content) =>
      `**చట్టపరమైన హక్కుల సమీక్ష (${legalBasis} కింద):**\n\n` +
      `సహకార సంఘం సభ్యుడిగా మీ హక్కులు చట్టం ద్వారా రక్షించబడ్డాయి.\n\n` +
      `**ముఖ్యమైన చట్ట నిబంధన (${section}):**\n` +
      `${content}\n\n` +
      `**వెంటనే తీసుకోవాల్సిన చర్యలు:**\n` +
      `1. కార్యదర్శి / పాలక మండలికి లిఖితపూర్వక దరఖాస్తు ఇచ్చి రశీదు తీసుకోండి.\n` +
      `2. పరిష్కారం లభించకపోతే **జిల్లా డిప్యూటీ రిజిస్ట్రార్ (DDR)** లేదా **సహకార అంబుడ్స్‌మన్** కు ఫిర్యాదు చేయండి.\n` +
      `3. ఎన్నికలు లేదా ఆర్థిక వివాదాల కోసం సెక్షన్ 84 కింద ఆర్బిట్రేషన్ దాఖలు చేయండి.`,
    governance: (actOrBylaw, section, content) =>
      `**పాలన & నిబంధనల విధానం (${actOrBylaw} ${section}):**\n\n` +
      `${content}\n\n` +
      `**ముఖ్యమైన నియమాలు:**\n` +
      `• వార్షిక సర్వసభ్య సమావేశం (AGM) కోసం కనీసం 14 రోజుల ముందస్తు నోటీసు తప్పనిసరి.\n` +
      `• కోరం: మొత్తం క్రియాశీల సభ్యులలో 1/5 వ వంతు లేదా 50 మంది సభ్యులు హాజరు కావాలి.`,
    general: (content, title, act) => `${content}\n\nచట్టపరమైన ఆధారం: **${title} (${act})**`,
    letterDraft: ({ memberName, membershipNo, societyName, location, complaintType, allegations, date }) =>
      `తేదీ: ${date}\n\nస్వీకర్త:\nజిల్లా డిప్యూటీ రిజిస్ట్రార్ (DDR), సహకార శాఖ, జిల్లా: ${location}\n\nనకలు: అధ్యక్షుడు / కార్యదర్శి, ${societyName}\n\nవిషయం: సహకార చట్టం కింద ఫిర్యాదు పత్రం - ${complaintType}\n\nఅయ్యా / అమ్మా,\nనేను ${memberName} (సభ్యత్వ సంఖ్య: ${membershipNo}), ${societyName} లో సభ్యుడిని. నా ఫిర్యాదు వివరాలు:\n${allegations}\n\nదీనిపై దర్యాప్తు జరిపి తగిన చర్యలు తీసుకోవాల్సిందిగా కోరుతున్నాను.\n\nభవదీయుడు,\n${memberName}`,
  },

  kn: {
    legalRights: (legalBasis, section, content) =>
      `**ಕಾನೂನು ಹಕ್ಕುಗಳ ಪರಿಶೀಲನೆ (${legalBasis} ಅಡಿಯಲ್ಲಿ):**\n\n` +
      `ಸಹಕಾರಿ ಸಂಘದ ಸದಸ್ಯರಾಗಿ ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ಕಾನೂನುಬದ್ಧವಾಗಿ ರಕ್ಷಿಸಲಾಗಿದೆ.\n\n` +
      `**ಪ್ರಮುಖ ಕಾನೂನು ನಿಯಮ (${section}):**\n` +
      `${content}\n\n` +
      `**ಮುಂದಿನ ಕ್ರಮಗಳು:**\n` +
      `1. ಕಾರ್ಯದರ್ಶಿ / ಆಡಳಿತ ಮಂಡಳಿಗೆ ಲಿಖಿತ ಅರ್ಜಿ ನೀಡಿ ಸ್ವೀಕೃತಿ ಪತ್ರ ಪಡೆಯಿರಿ.\n` +
      `2. ಸೂಕ್ತ ಪರಿಹಾರ ಸಿಗದಿದ್ದರೆ **ಜಿಲ್ಲಾ ಉಪ-ನಿಬಂಧಕರಿಗೆ (DDR)** ಅಥವಾ **ಸಹಕಾರಿ ಲೋಕಪಾಲರಿಗೆ** ದೂರು ಸಲ್ಲಿಸಿ.\n` +
      `3. ಚುನಾವಣಾ ಅಥವಾ ಹಣಕಾಸು ವಿವಾದಗಳಿಗೆ ಕಲಂ 84 ರ ಅಡಿಯಲ್ಲಿ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಿ.`,
    governance: (actOrBylaw, section, content) =>
      `**ಆಡಳಿತ ಮತ್ತು ಉಪವಿಧಿ ನಿಯಮಗಳು (${actOrBylaw} ${section}):**\n\n` +
      `${content}\n\n` +
      `**ನೆನಪಿಡಬೇಕಾದ ನಿಯಮಗಳು:**\n` +
      `• ವಾರ್ಷಿಕ ಮಹಾಸಭೆ (AGM) ನಡೆಸಲು ಕನಿಷ್ಠ 14 ದಿನಗಳ ಮುಂಚಿತ ನೋಟಿಸ್ ಕಡ್ಡಾಯ.\n` +
      `• ಕೋರಂ: ಒಟ್ಟು ಸಕ್ರಿಯ ಸದಸ್ಯರಲ್ಲಿ ಕನಿಷ್ಠ 1/5 ರಷ್ಟು ಅಥವಾ 50 ಸದಸ್ಯರು ಹಾಜರಿರಬೇಕು.`,
    general: (content, title, act) => `${content}\n\nಆಧಾರ: **${title} (${act})**`,
    letterDraft: ({ memberName, membershipNo, societyName, location, complaintType, allegations, date }) =>
      `ದಿನಾಂಕ: ${date}\n\nರವರಿಗೆ:\nಜಿಲ್ಲಾ ಉಪ-ನಿಬಂಧಕರು (DDR), ಸಹಕಾರ ಇಲಾಖೆ, ಜಿಲ್ಲೆ: ${location}\n\nಪ್ರತಿ: ಅಧ್ಯಕ್ಷರು / ಕಾರ್ಯದರ್ಶಿ, ${societyName}\n\nವಿಷಯ: ಸಹಕಾರ ಕಾಯ್ದೆಯ ಅನ್ವಯ ದೂರು ಅರ್ಜಿ - ${complaintType}\n\nಮಾನ್ಯರೇ,\nನಾನು ${memberName} (ಸದಸ್ಯತ್ವ ಸಂಖ್ಯೆ: ${membershipNo}), ${societyName} ನ ಸದಸ್ಯನಾಗಿದ್ದು, ದೂರು ವಿವರ ಕೆಳಗಿನಂತಿದೆ:\n${allegations}\n\nಇದನ್ನು ಪರಿಶೀಲಿಸಿ ಸೂಕ್ತ ಕ್ರಮ ಕೈಗೊಳ್ಳಲು ವಿನಂತಿಸುತ್ತೇನೆ.\n\nಇಂತಿ ತಮ್ಮ ವಿಶ್ವಾಸಿ,\n${memberName}`,
  },

  bn: {
    legalRights: (legalBasis, section, content) =>
      `**আইনি অধিকার পর্যালোচনা (${legalBasis} অধীনে):**\n\n` +
      `সমবায় সমিতির সদস্য হিসেবে আপনার অধিকার আইন দ্বারা সুরক্ষিত।\n\n` +
      `**মূল আইনি ধারা (${section}):**\n` +
      `${content}\n\n` +
      `**প্রয়োজনীয় পদক্ষেপ:**\n` +
      `1. সম্পাদক বা পরিচালনা পর্ষদকে লিখিত আবেদন জমা দিয়ে প্রাপ্তিস্বীকার নিন।\n` +
      `2. সমাধান না হলে **জেলা সহকারী নিবন্ধক (DDR)** বা **সমবায় ন্যায়পাল (Ombudsman)** এর কাছে অভিযোগ করুন।\n` +
      `3. নির্বাচনী বা আর্থিক বিরোধের জন্য ধারা ৮৪ অনুযায়ী সালিশি আবেদন করুন।`,
    governance: (actOrBylaw, section, content) =>
      `**প্রশাসন ও উপবিধি নিয়মাবলী (${actOrBylaw} ${section}):**\n\n` +
      `${content}\n\n` +
      `**জরুরি নিয়মাবলী:**\n` +
      `• বার্ষিক সাধারণ সভার (AGM) কমপক্ষে ১৪ দিন আগে লিখিত নোটিশ বাধ্যতামূলক।\n` +
      `• কোরাম: মোট সক্রিয় সদস্যের কমপক্ষে ১/৫ অংশ বা ৫০ জন সদস্যের উপস্থিতি আবশ্যক।`,
    general: (content, title, act) => `${content}\n\nআইনি সূত্র: **${title} (${act})**`,
    letterDraft: ({ memberName, membershipNo, societyName, location, complaintType, allegations, date }) =>
      `তারিখ: ${date}\n\nবরাবর:\nজেলা সহকারী সমবায় নিবন্ধক (DDR), জেলা: ${location}\n\nঅনুলিপি: সভাপতি / সম্পাদক, ${societyName}\n\nবিষয়: সমবায় সমিতি আইন ও উপবিধি অনুযায়ী অভিযোগপত্র - ${complaintType}\n\nমহাশয়,\nআমি ${memberName} (সদস্য নম্বর: ${membershipNo}), ${societyName}-এর সদস্য। আমার অভিযোগের বিবরণ নিচে দেওয়া হলো:\n${allegations}\n\nবিষয়টি খতিয়ে দেখে প্রয়োজনীয় ব্যবস্থা নেওয়ার অনুরোধ জানাচ্ছি।\n\nধন্যবাদান্তে,\n${memberName}`,
  },

  pa: {
    legalRights: (legalBasis, section, content) =>
      `**ਕਾਨੂੰਨੀ ਅਧਿਕਾਰ ਮੁਲਾਂਕਣ (${legalBasis} ਅਧੀਨ):**\n\n` +
      `ਸਹਿਕਾਰੀ ਸਭਾ ਦੇ ਮੈਂਬਰ ਵਜੋਂ ਤੁਹਾਡੇ ਅਧਿਕਾਰ ਕਾਨੂੰਨ ਦੁਆਰਾ ਸੁਰੱਖਿਅਤ ਹਨ।\n\n` +
      `**ਮੁੱਖ ਕਾਨੂੰਨੀ ਧਾਰਾ (${section}):**\n` +
      `${content}\n\n` +
      `**ਤੁਰੰਤ ਚੁੱਕੇ ਜਾਣ ਵਾਲੇ ਕਦਮ:**\n` +
      `1. ਸਕੱਤਰ / ਪ੍ਰਬੰਧਕ ਕਮੇਟੀ ਨੂੰ ਲਿਖਤੀ ਅਰਜ਼ੀ ਦੇ ਕੇ ਰਸੀਦ ਜ਼ਰੂਰ ਲਵੋ।\n` +
      `2. ਜੇਕਰ ਹੱਲ ਨਾ ਹੋਵੇ ਤਾਂ **ਜ਼ਿਲ੍ਹਾ ਡਿਪਟੀ ਰਜਿਸਟਰਾਰ (DDR)** ਜਾਂ **ਸਹਿਕਾਰੀ ਲੋਕਪਾਲ** ਕੋਲ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ।\n` +
      `3. ਚੋਣ ਜਾਂ ਵਿੱਤੀ ਝਗੜਿਆਂ ਲਈ ਧਾਰਾ 84 ਅਧੀਨ ਆਰਬਿਟਰੇਸ਼ਨ ਦਰਜ ਕਰੋ।`,
    governance: (actOrBylaw, section, content) =>
      `**ਪ੍ਰਬੰਧਨ ਅਤੇ ਉਪ-ਨਿਯਮ ਪ੍ਰਕਿਰਿਆ (${actOrBylaw} ${section}):**\n\n` +
      `${content}\n\n` +
      `**ਯਾਦ ਰੱਖਣ ਯੋਗ ਨਿਯਮ:**\n` +
      `• ਸਾਲਾਨਾ ਜਨਰਲ ਮੀਟਿੰਗ (AGM) ਲਈ ਘੱਟੋ-ਘੱਟ 14 ਦਿਨ ਪਹਿਲਾਂ ਨੋਟਿਸ ਲਾਜ਼ਮੀ ਹੈ।\n` +
      `• ਕੋਰਮ: ਕੁੱਲ ਸਰਗਰਮ ਮੈਂਬਰਾਂ ਦਾ ਘੱਟੋ-ਘੱਟ 1/5ਵਾਂ ਹਿੱਸਾ ਜਾਂ 50 ਮੈਂਬਰ ਹਾਜ਼ਰ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ।`,
    general: (content, title, act) => `${content}\n\nਕਾਨੂੰਨੀ ਹਵਾਲਾ: **${title} (${act})**`,
    letterDraft: ({ memberName, membershipNo, societyName, location, complaintType, allegations, date }) =>
      `ਮਿਤੀ: ${date}\n\nਸੇਵਾ ਵਿਖੇ:\nਜ਼ਿਲ੍ਹਾ ਡਿਪਟੀ ਰਜਿਸਟਰਾਰ (DDR), ਸਹਿਕਾਰਤਾ ਵਿਭਾਗ, ਜ਼ਿਲ੍ਹਾ: ${location}\n\nਕਾਪੀ: ਪ੍ਰਧਾਨ / ਸਕੱਤਰ, ${societyName}\n\nਵਿਸ਼ਾ: ਸਹਿਕਾਰੀ ਸਭਾਵਾਂ ਐਕਟ ਅਧੀਨ ਸ਼ਿਕਾਇਤ ਪੱਤਰ - ${complaintType}\n\nਸ਼੍ਰੀਮਾਨ ਜੀ,\nਮੈਂ ${memberName} (ਮੈਂਬਰਸ਼ਿਪ ਨੰਬਰ: ${membershipNo}), ${societyName} ਦਾ ਮੈਂਬਰ ਹਾਂ। ਮੇਰੀ ਸ਼ਿਕਾਇਤ ਦਾ ਵੇਰਵਾ ਇਸ ਪ੍ਰਕਾਰ ਹੈ:\n${allegations}\n\nਕਿਰਪਾ ਕਰਕੇ ਇਸ ਮਾਮਲੇ ਦੀ ਜਾਂਚ ਕਰਕੇ ਬਣਦੀ ਕਾਰਵਾਈ ਕੀਤੀ ਜਾਵੇ।\n\nਧੰਨਵਾਦ ਸਹਿਤ,\n${memberName}`,
  },
};
