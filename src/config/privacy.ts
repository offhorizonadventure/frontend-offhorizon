export type Block =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "h3"; text: string; id?: string }
  | { kind: "short"; text: string }
  | { kind: "table"; head: string[]; rows: string[][] };

export type Section = { id: string; title: string; blocks: Block[] };

export const PRIVACY_UPDATED = new Date("2026-03-20T00:00:00Z");

export const DSAR_URL = "https://app.termly.io/dsar/e25f3360-b200-463b-ba7f-f2b4f6aec0f2";

export const PRIVACY_INTRO: Block[] = [
  {
    kind: "p",
    text: "This Privacy Notice for Offhorizon Adventures (“we”, “us”, or “our”) describes how and why we might access, collect, store, use, and/or share (“process”) your personal information when you use our services (“Services”), including when you:",
  },
  {
    kind: "ul",
    items: [
      "Visit our website at [https://offhorizon.com](https://offhorizon.com), or any website of ours that links to this Privacy Notice",
      "Engage with us in other related ways, including any marketing or events",
    ],
  },
  {
    kind: "p",
    text: "**Questions or concerns?** Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at [info@offhorizon.com](mailto:info@offhorizon.com).",
  },
];

export const PRIVACY_SUMMARY: Block[] = [
  {
    kind: "p",
    text: "**What personal information do we process?** When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about [personal information you disclose to us](#infocollect).",
  },
  {
    kind: "p",
    text: "**Do we process any sensitive personal information?** Some of the information may be considered “special” or “sensitive” in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We do not process sensitive personal information.",
  },
  {
    kind: "p",
    text: "**Do we collect any information from third parties?** We do not collect any information from third parties.",
  },
  {
    kind: "p",
    text: "**How do we process your information?** We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about [how we process your information](#infouse).",
  },
  {
    kind: "p",
    text: "**In what situations and with which parties do we share personal information?** We may share information in specific situations and with specific third parties. Learn more about [when and with whom we share your personal information](#whoshare).",
  },
  {
    kind: "p",
    text: "**How do we keep your information safe?** We have adequate organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Learn more about [how we keep your information safe](#infosafe).",
  },
  {
    kind: "p",
    text: "**What are your rights?** Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about [your privacy rights](#privacyrights).",
  },
  {
    kind: "p",
    text: `**How do you exercise your rights?** The easiest way to exercise your rights is by submitting a [data subject access request](${DSAR_URL}), or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.`,
  },
];

export const PRIVACY_SECTIONS: Section[] = [
  {
    id: "infocollect",
    title: "What information do we collect?",
    blocks: [
      { kind: "h3", text: "Personal information you disclose to us" },
      { kind: "short", text: "In Short: We collect personal information that you provide to us." },
      {
        kind: "p",
        text: "We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.",
      },
      {
        kind: "p",
        text: "**Personal Information Provided by You.** The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:",
      },
      {
        kind: "ul",
        items: [
          "names",
          "phone numbers",
          "email addresses",
          "mailing addresses",
          "debit/credit card numbers",
          "billing addresses",
          "contact or authentication data",
        ],
      },
      { kind: "p", text: "**Sensitive Information.** We do not process sensitive information." },
      {
        kind: "p",
        text: "**Payment Data.** We may collect data necessary to process your payment if you choose to make purchases, such as your payment instrument number, and the security code associated with your payment instrument. All payment data is handled and stored by Razorpay. You may find their privacy notice link(s) here: [https://razorpay.com/privacy/](https://razorpay.com/privacy/).",
      },
      {
        kind: "p",
        text: "**Social Media Login Data.** We may provide you with the option to register with us using your existing social media account details, like your Facebook, X, or other social media account. If you choose to register in this way, we will collect certain profile information about you from the social media provider, as described in the section called [How do we handle your social logins?](#sociallogins) below.",
      },
      {
        kind: "p",
        text: "All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.",
      },
      { kind: "h3", text: "Information automatically collected" },
      {
        kind: "short",
        text: "In Short: Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.",
      },
      {
        kind: "p",
        text: "We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.",
      },
      {
        kind: "p",
        text: "Like many businesses, we also collect information through cookies and similar technologies.",
      },
      { kind: "p", text: "The information we collect includes:" },
      {
        kind: "ul",
        items: [
          "*Log and Usage Data.* Log and usage data is service-related, diagnostic, usage, and performance information our servers automatically collect when you access or use our Services and which we record in log files. Depending on how you interact with us, this log data may include your IP address, device information, browser type, and settings and information about your activity in the Services (such as the date/time stamps associated with your usage, pages and files viewed, searches, and other actions you take such as which features you use), device event information (such as system activity, error reports (sometimes called “crash dumps”), and hardware settings).",
          "*Device Data.* We collect device data such as information about your computer, phone, tablet, or other device you use to access the Services. Depending on the device used, this device data may include information such as your IP address (or proxy server), device and application identification numbers, location, browser type, hardware model, Internet service provider and/or mobile carrier, operating system, and system configuration information.",
        ],
      },
      { kind: "h3", text: "Google API" },
      {
        kind: "p",
        text: "Our use of information received from Google APIs will adhere to [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the [Limited Use requirements](https://developers.google.com/terms/api-services-user-data-policy#limited-use).",
      },
    ],
  },
  {
    id: "infouse",
    title: "How do we process your information?",
    blocks: [
      {
        kind: "short",
        text: "In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We process the personal information for the following purposes listed below. We may also process your information for other purposes only with your prior explicit consent.",
      },
      {
        kind: "p",
        text: "**We process your personal information for a variety of reasons, depending on how you interact with our Services, including:**",
      },
      {
        kind: "ul",
        items: [
          "**To facilitate account creation and authentication and otherwise manage user accounts.** We may process your information so you can create and log in to your account, as well as keep your account in working order.",
          "**To save or protect an individual's vital interest.** We may process your information when necessary to save or protect an individual’s vital interest, such as to prevent harm.",
        ],
      },
    ],
  },
  {
    id: "legalbases",
    title: "What legal bases do we rely on to process your information?",
    blocks: [
      {
        kind: "short",
        text: "In Short: We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e., legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfill our contractual obligations, to protect your rights, or to fulfill our legitimate business interests.",
      },
      { kind: "p", text: "*If you are located in the EU or UK, this section applies to you.*" },
      {
        kind: "p",
        text: "The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases to process your personal information:",
      },
      {
        kind: "ul",
        items: [
          "**Consent.** We may process your information if you have given us permission (i.e., consent) to use your personal information for a specific purpose. You can withdraw your consent at any time. Learn more about [withdrawing your consent](#withdrawconsent).",
          "**Legal Obligations.** We may process your information where we believe it is necessary for compliance with our legal obligations, such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or disclose your information as evidence in litigation in which we are involved.",
          "**Vital Interests.** We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party, such as situations involving potential threats to the safety of any person.",
        ],
      },
      {
        kind: "p",
        text: "In legal terms, we are generally the “data controller” under European data protection laws of the personal information described in this Privacy Notice, since we determine the means and/or purposes of the data processing we perform. This Privacy Notice does not apply to the personal information we process as a “data processor” on behalf of our customers. In those situations, the customer that we provide services to and with whom we have entered into a data processing agreement is the “data controller” responsible for your personal information, and we merely process your information on their behalf in accordance with your instructions. If you want to know more about our customers' privacy practices, you should read their privacy policies and direct any questions you have to them.",
      },
      { kind: "p", text: "*If you are located in Canada, this section applies to you.*" },
      {
        kind: "p",
        text: "We may process your information if you have given us specific permission (i.e., express consent) to use your personal information for a specific purpose, or in situations where your permission can be inferred (i.e., implied consent). You can [withdraw your consent](#withdrawconsent) at any time.",
      },
      {
        kind: "p",
        text: "In some exceptional cases, we may be legally permitted under applicable law to process your information without your consent, including, for example:",
      },
      {
        kind: "ul",
        items: [
          "If collection is clearly in the interests of an individual and consent cannot be obtained in a timely way",
          "For investigations and fraud detection and prevention",
          "For business transactions provided certain conditions are met",
          "If it is contained in a witness statement and the collection is necessary to assess, process, or settle an insurance claim",
          "For identifying injured, ill, or deceased persons and communicating with next of kin",
          "If we have reasonable grounds to believe an individual has been, is, or may be victim of financial abuse",
          "If it is reasonable to expect collection and use with consent would compromise the availability or the accuracy of the information and the collection is reasonable for purposes related to investigating a breach of an agreement or a contravention of the laws of Canada or a province",
          "If disclosure is required to comply with a subpoena, warrant, court order, or rules of the court relating to the production of records",
          "If it was produced by an individual in the course of their employment, business, or profession and the collection is consistent with the purposes for which the information was produced",
          "If the collection is solely for journalistic, artistic, or literary purposes",
          "If the information is publicly available and is specified by the regulations",
          "We may disclose de-identified information for approved research or statistics projects, subject to ethics oversight and confidentiality commitments",
        ],
      },
    ],
  },
  {
    id: "whoshare",
    title: "When and with whom do we share your personal information?",
    blocks: [
      {
        kind: "short",
        text: "In Short: We may share information in specific situations described in this section and/or with the following third parties.",
      },
      {
        kind: "p",
        text: "**Vendors, Consultants, and Other Third-Party Service Providers.** We may share your data with third-party vendors, service providers, contractors, or agents (“**third parties**”) who perform services for us or on our behalf and require access to such information to do that work. We have contracts in place with our third parties, which are designed to help safeguard your personal information. This means that they cannot do anything with your personal information unless we have instructed them to do it. They will also not share your personal information with any organization apart from us. They also commit to protect the data they hold on our behalf and to retain it for the period we instruct.",
      },
      {
        kind: "p",
        text: "The third parties we may share personal information with are as follows:",
      },
      {
        kind: "ul",
        items: [
          "**Advertising, Direct Marketing, and Lead Generation:** Facebook Audience Network",
          "**Allow Users to Connect to Their Third-Party Accounts:** Google account",
        ],
      },
      {
        kind: "p",
        text: "We also may need to share your personal information in the following situations:",
      },
      {
        kind: "ul",
        items: [
          "**Business Transfers.** We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.",
        ],
      },
    ],
  },
  {
    id: "cookies",
    title: "Do we use cookies and other tracking technologies?",
    blocks: [
      {
        kind: "short",
        text: "In Short: We may use cookies and other tracking technologies to collect and store your information.",
      },
      {
        kind: "p",
        text: "We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services and your account, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.",
      },
      {
        kind: "p",
        text: "We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising, including to help manage and display advertisements or to tailor advertisements to your interests. The third parties and service providers use their technology to provide advertising about products and services tailored to your interests which may appear either on our Services or on other websites.",
      },
      {
        kind: "p",
        text: "To the extent these online tracking technologies are deemed to be a “sale”/“sharing” (which includes targeted advertising, as defined under the applicable laws) under applicable US state laws, you can opt out of these online tracking technologies by submitting a request as described below under section [Do United States residents have specific privacy rights?](#uslaws)",
      },
      {
        kind: "p",
        text: "Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.",
      },
      { kind: "h3", text: "Google Analytics" },
      {
        kind: "p",
        text: "We may share your information with Google Analytics to track and analyze the use of the Services. The Google Analytics Advertising Features that we may use include: Google Display Network Impressions Reporting. To opt out of being tracked by Google Analytics across the Services, visit [https://tools.google.com/dlpage/gaoptout](https://tools.google.com/dlpage/gaoptout). You can opt out of Google Analytics Advertising Features through [Ads Settings](https://adssettings.google.com/) and Ad Settings for mobile apps. Other opt out means include [http://optout.networkadvertising.org/](http://optout.networkadvertising.org/) and [http://www.networkadvertising.org/mobile-choice](http://www.networkadvertising.org/mobile-choice). For more information on the privacy practices of Google, please visit the [Google Privacy & Terms page](https://policies.google.com/privacy).",
      },
    ],
  },
  {
    id: "sociallogins",
    title: "How do we handle your social logins?",
    blocks: [
      {
        kind: "short",
        text: "In Short: If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.",
      },
      {
        kind: "p",
        text: "Our Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or X logins). Where you choose to do this, we will receive certain profile information about you from your social media provider. The profile information we receive may vary depending on the social media provider concerned, but will often include your name, email address, friends list, and profile picture, as well as other information you choose to make public on such a social media platform.",
      },
      {
        kind: "p",
        text: "We will use the information we receive only for the purposes that are described in this Privacy Notice or that are otherwise made clear to you on the relevant Services. Please note that we do not control, and are not responsible for, other uses of your personal information by your third-party social media provider. We recommend that you review their privacy notice to understand how they collect, use, and share your personal information, and how you can set your privacy preferences on their sites and apps.",
      },
    ],
  },
  {
    id: "inforetain",
    title: "How long do we keep your information?",
    blocks: [
      {
        kind: "short",
        text: "In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.",
      },
      {
        kind: "p",
        text: "We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.",
      },
      {
        kind: "p",
        text: "When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.",
      },
    ],
  },
  {
    id: "infosafe",
    title: "How do we keep your information safe?",
    blocks: [
      {
        kind: "short",
        text: "In Short: We aim to protect your personal information through a system of organizational and technical security measures.",
      },
      {
        kind: "p",
        text: "We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.",
      },
    ],
  },
  {
    id: "infominors",
    title: "Do we collect information from minors?",
    blocks: [
      {
        kind: "short",
        text: "In Short: We do not knowingly collect data from or market to children under 18 years of age or the equivalent age as specified by law in your jurisdiction.",
      },
      {
        kind: "p",
        text: "We do not knowingly collect, solicit data from, or market to children under 18 years of age or the equivalent age as specified by law in your jurisdiction, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18 or the equivalent age as specified by law in your jurisdiction or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of the Services. If we learn that personal information from users less than 18 years of age or the equivalent age as specified by law in your jurisdiction has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18 or the equivalent age as specified by law in your jurisdiction, please contact us at [info@offhorizon.com](mailto:info@offhorizon.com).",
      },
    ],
  },
  {
    id: "privacyrights",
    title: "What are your privacy rights?",
    blocks: [
      {
        kind: "short",
        text: "In Short: Depending on your state of residence in the US or in some regions, such as the European Economic Area (EEA), United Kingdom (UK), Switzerland, and Canada, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.",
      },
      {
        kind: "p",
        text: "In some regions (like the EEA, UK, Switzerland, and Canada), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; (iv) if applicable, to data portability; and (v) not to be subject to automated decision-making. If a decision that produces legal or similarly significant effects is made solely by automated means, we will inform you, explain the main factors, and offer a simple way to request human review. In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section [How can you contact us about this notice?](#contact) below.",
      },
      {
        kind: "p",
        text: "We will consider and act upon any request in accordance with applicable data protection laws.",
      },
      {
        kind: "p",
        text: "If you are located in the UK and are unhappy with how we have handled your personal information, you can make a complaint directly to us. This is in addition to the rights you have under the UK General Data Protection Regulation and the Data Protection Act 2018.",
      },
      { kind: "p", text: "How to contact us:" },
      {
        kind: "ul",
        items: [
          "**Online:** [https://offhorizon.com/en/contact-us](https://offhorizon.com/en/contact-us)",
          "**Email:** [info@offhorizon.com](mailto:info@offhorizon.com)",
          "**Post:** See [How can you contact us about this notice?](#contact)",
        ],
      },
      { kind: "p", text: "What happens after you complain:" },
      {
        kind: "ul",
        items: [
          "We will acknowledge your complaint within 30 days of receiving it.",
          "We will investigate without unjustifiable or excessive delay.",
          "We will keep you informed of progress and explain the outcome.",
        ],
      },
      {
        kind: "p",
        text: "If you are not happy with our final response, you can refer your complaint to the Information Commissioner's Office, the UK supervisory authority.",
      },
      {
        kind: "ul",
        items: [
          "**Website:** [ico.org.uk/make-a-complaint](https://ico.org.uk/make-a-complaint)",
          "**Helpline:** 0303 123 1113",
          "**Post:** Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF",
        ],
      },
      {
        kind: "p",
        text: "If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your [Member State data protection authority](https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm) or [UK data protection authority](https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/).",
      },
      {
        kind: "p",
        text: "If you are located in Switzerland, you may contact the [Federal Data Protection and Information Commissioner](https://www.edoeb.admin.ch/edoeb/en/home.html).",
      },
      { kind: "h3", text: "Withdrawing your consent", id: "withdrawconsent" },
      {
        kind: "p",
        text: "If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section [How can you contact us about this notice?](#contact) below or updating your preferences.",
      },
      {
        kind: "p",
        text: "However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.",
      },
      { kind: "h3", text: "Account Information" },
      {
        kind: "p",
        text: "If you would at any time like to review or change the information in your account or terminate your account, you can:",
      },
      { kind: "ul", items: ["Log in to your account settings and update your user account."] },
      {
        kind: "p",
        text: "Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.",
      },
      {
        kind: "p",
        text: "**Cookies and similar technologies:** Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Services.",
      },
      {
        kind: "p",
        text: "If you have questions or comments about your privacy rights, you may email us at [info@offhorizon.com](mailto:info@offhorizon.com).",
      },
    ],
  },
  {
    id: "DNT",
    title: "Controls for do-not-track features",
    blocks: [
      {
        kind: "p",
        text: "Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (“DNT”) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.",
      },
      {
        kind: "p",
        text: "California law requires us to let you know how we respond to web browser DNT signals. Because there currently is not an industry or legal standard for recognizing or honoring DNT signals, we do not respond to them at this time.",
      },
      {
        kind: "p",
        text: "**Global Privacy Control:** We recognize and honor Global Privacy Control (GPC) signals. If you use a browser or extension that supports GPC, we will treat this as a valid request to opt out of the sale or sharing of your personal information for targeted advertising purposes under applicable state privacy laws, including the California Consumer Privacy Act (CCPA). When we detect a GPC signal from your browser, we will automatically apply your opt-out preference without requiring you to take any additional action. For more information about GPC and how to enable it, visit [globalprivacycontrol.org](https://globalprivacycontrol.org/).",
      },
    ],
  },
  {
    id: "uslaws",
    title: "Do United States residents have specific privacy rights?",
    blocks: [
      {
        kind: "short",
        text: "In Short: You may have the right to request access to and receive details about the personal information we maintain about you and how we have processed it, correct inaccuracies, get a copy of, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. More information is provided below.",
      },
      { kind: "h3", text: "Categories of Personal Information We Collect" },
      {
        kind: "p",
        text: "The table below shows the categories of personal information we have collected in the past twelve (12) months. The table includes illustrative examples of each category and does not reflect the personal information we collect from you. For a comprehensive inventory of all personal information we process, please refer to the section [What information do we collect?](#infocollect)",
      },
      {
        kind: "table",
        head: ["Category", "Examples", "Collected"],
        rows: [
          [
            "A. Identifiers",
            "Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name",
            "YES",
          ],
          [
            "B. Protected classification characteristics under state or federal law",
            "Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data",
            "NO",
          ],
          [
            "C. Commercial information",
            "Transaction information, purchase history, financial details, and payment information",
            "NO",
          ],
          ["D. Biometric information", "Fingerprints and voiceprints", "NO"],
          [
            "E. Internet or other similar network activity",
            "Browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements",
            "NO",
          ],
          ["F. Geolocation data", "Device location", "NO"],
          [
            "G. Audio, electronic, sensory, or similar information",
            "Images and audio, video or call recordings created in connection with our business activities",
            "NO",
          ],
          [
            "H. Professional or employment-related information",
            "Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us",
            "NO",
          ],
          ["I. Education Information", "Student records and directory information", "NO"],
          [
            "J. Inferences drawn from collected personal information",
            "Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual’s preferences and characteristics",
            "YES",
          ],
          ["K. Sensitive personal Information", "", "NO"],
        ],
      },
      {
        kind: "p",
        text: "We may also collect other personal information outside of these categories through instances where you interact with us in person, online, or by phone or mail in the context of:",
      },
      {
        kind: "ul",
        items: [
          "Receiving help through our customer support channels;",
          "Participation in customer surveys or contests; and",
          "Facilitation in the delivery of our Services and to respond to your inquiries.",
        ],
      },
      {
        kind: "p",
        text: "We will use and retain the collected personal information as needed to provide the Services or for:",
      },
      {
        kind: "ul",
        items: ["Category A — 1 year", "Category J — As long as the user has an account with us"],
      },
      { kind: "h3", text: "Sources of Personal Information" },
      {
        kind: "p",
        text: "Learn more about the sources of personal information we collect in [What information do we collect?](#infocollect)",
      },
      { kind: "h3", text: "How We Use and Share Personal Information" },
      {
        kind: "p",
        text: "Learn more about how we use your personal information in the section, [How do we process your information?](#infouse)",
      },
      { kind: "p", text: "We collect and share your personal information through:" },
      { kind: "ul", items: ["Targeting cookies/Marketing cookies", "Social media cookies"] },
      { kind: "p", text: "**Will your information be shared with anyone else?**" },
      {
        kind: "p",
        text: "We may disclose your personal information with our service providers pursuant to a written contract between us and each service provider. Learn more about how we disclose personal information to in the section, [When and with whom do we share your personal information?](#whoshare)",
      },
      {
        kind: "p",
        text: "We may use your personal information for our own business purposes, such as for undertaking internal research for technological development and demonstration. This is not considered to be “selling” of your personal information.",
      },
      {
        kind: "p",
        text: "We have not sold or shared any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months. We have disclosed the following categories of personal information to third parties for a business or commercial purpose in the preceding twelve (12) months:",
      },
      { kind: "ul", items: ["Category A. Identifiers"] },
      {
        kind: "p",
        text: "The categories of third parties to whom we disclosed personal information for a business or commercial purpose can be found under [When and with whom do we share your personal information?](#whoshare)",
      },
      { kind: "h3", text: "Your Rights" },
      {
        kind: "p",
        text: "You have rights under certain US state data protection laws. However, these rights are not absolute, and in certain cases, we may decline your request as permitted by law. These rights include:",
      },
      {
        kind: "ul",
        items: [
          "**Right to know** whether or not we are processing your personal data",
          "**Right to access** your personal data",
          "**Right to correct** inaccuracies in your personal data",
          "**Right to request** the deletion of your personal data",
          "**Right to obtain a copy** of the personal data you previously shared with us",
          "**Right to non-discrimination** for exercising your rights",
          "**Right to opt out** of the processing of your personal data if it is used for targeted advertising, the sale of personal data, or profiling in furtherance of decisions that produce legal or similarly significant effects (“profiling”)",
        ],
      },
      { kind: "h3", text: "How to Exercise Your Rights" },
      {
        kind: "p",
        text: `To exercise these rights, you can contact us by submitting a [data subject access request](${DSAR_URL}), by emailing us at [info@offhorizon.com](mailto:info@offhorizon.com), or by referring to the contact details at the bottom of this document.`,
      },
      {
        kind: "p",
        text: "We will honor your opt-out preferences if you enact the [Global Privacy Control](https://globalprivacycontrol.org/) (GPC) opt-out signal on your browser.",
      },
      {
        kind: "p",
        text: "Under certain US state data protection laws, you can designate an authorized agent to make a request on your behalf. We may deny a request from an authorized agent that does not submit proof that they have been validly authorized to act on your behalf in accordance with applicable laws.",
      },
      { kind: "h3", text: "Request Verification" },
      {
        kind: "p",
        text: "Upon receiving your request, we will need to verify your identity to determine you are the same person about whom we have the information in our system. We will only use personal information provided in your request to verify your identity or authority to make the request. However, if we cannot verify your identity from the information already maintained by us, we may request that you provide additional information for the purposes of verifying your identity and for security or fraud-prevention purposes.",
      },
      {
        kind: "p",
        text: "If you submit the request through an authorized agent, we may need to collect additional information to verify your identity before processing your request and the agent will need to provide a written and signed permission from you to submit such request on your behalf.",
      },
    ],
  },
  {
    id: "policyupdates",
    title: "Do we make updates to this notice?",
    blocks: [
      {
        kind: "short",
        text: "In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws.",
      },
      {
        kind: "p",
        text: "We may update this Privacy Notice from time to time. The updated version will be indicated by an updated “Revised” date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.",
      },
    ],
  },
  {
    id: "contact",
    title: "How can you contact us about this notice?",
    blocks: [
      {
        kind: "p",
        text: "If you have questions or comments about this notice, you may contact us by post at:",
      },
      {
        kind: "p",
        text: "Offhorizon Adventures\nLog Huts Area Rd\nManali, Himachal Pradesh 175131\nIndia",
      },
      {
        kind: "p",
        text: "You may also email us at [info@offhorizon.com](mailto:info@offhorizon.com) or write to us through the [contact form](https://offhorizon.com/en/contact-us).",
      },
    ],
  },
  {
    id: "request",
    title: "How can you review, update, or delete the data we collect from you?",
    blocks: [
      {
        kind: "p",
        text: `Based on the applicable laws of your country or state of residence in the US, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please fill out and submit a [data subject access request](${DSAR_URL}).`,
      },
    ],
  },
];
