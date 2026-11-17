/**
 * Plain-language rights cards for Indian citizens and students.
 *
 * Content is general information drawn from well-established Indian law:
 * - D.K. Basu v. State of West Bengal (1997) arrest safeguards, now carried
 *   forward into the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023.
 * - Lalita Kumari v. Govt. of U.P. (2014): police MUST register an FIR for
 *   cognizable offences.
 * - Consumer Protection Act, 2019 (District/State/National commissions,
 *   e-commerce covered, no lawyer required).
 * - UGC (Redressal of Grievances of Students) Regulations, 2023, the UGC
 *   fee-refund policy and UGC Anti-Ragging Regulations, 2009.
 * - Sexual Harassment of Women at Workplace (POSH) Act, 2013.
 * - Article 39A / Legal Services Authorities Act, 1987 (free legal aid).
 */

export const RIGHT_CARDS = [
  {
    id: 'stopped',
    title: 'If the police stop or question you',
    summary: 'Stay calm, be polite, and know the few things you must do and can ask.',
    points: [
      {
        h: 'You must',
        t: 'give your correct name and address when a police officer lawfully asks for them. Refusing to identify yourself can get you into trouble.',
      },
      {
        h: 'You may',
        t: 'politely ask for the officer\u2019s name, rank, badge/buckle number and which police station they belong to. Note it down or tell a family member where you are.',
      },
      {
        h: 'You do not have to',
        t: 'answer questions about an accusation on the spot, and you cannot be punished for staying silent about an offence (Article 20(3) of the Constitution). Be polite while doing it.',
      },
      {
        h: 'In an encounter with police',
        t: 'never argue, push or run. Anything that looks like resisting can be used against you later. Say you will cooperate and ask for a lawyer if needed.',
      },
    ],
    cite: 'Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023; Article 20(3), Constitution of India',
  },
  {
    id: 'arrested',
    title: 'If you are arrested — your checklist',
    summary: 'The Supreme Court\u2019s D.K. Basu safeguards exist to protect you. Use them.',
    points: [
      {
        h: 'Ask why',
        t: 'the police must tell you the grounds of arrest and whether the offence is bailable. If it is bailable, you are entitled to be released on bail.',
      },
      {
        h: 'Ask for a lawyer',
        t: 'you have the right to consult a lawyer of your choice and to be defended by one (Article 22). If you cannot afford one, free legal aid is your right \u2014 call 15100.',
      },
      {
        h: 'Demand an arrest memo',
        t: 'it must be prepared at the time of arrest, showing the time, date and place, and be signed by you plus a witness (a family member or a respectable local person).',
      },
      {
        h: 'One phone call',
        t: 'a friend, relative or the person named by you must be told where you are being held, as soon as practicable. Keep one or two numbers memorised.',
      },
      {
        h: '24 hours',
        t: 'you must be produced before a magistrate within 24 hours of arrest (excluding journey time). Nobody can keep you in custody beyond that without a magistrate\u2019s order.',
      },
      {
        h: 'Health and safety',
        t: 'you can ask for a medical examination by a doctor, and injuries must be recorded. Women can only be arrested between sunrise and sunset unless a magistrate specially permits it, and a lady officer must make the arrest.',
      },
    ],
    cite: 'D.K. Basu v. State of West Bengal (1997) 1 SCC 416; BNSS, 2023; Articles 21 & 22, Constitution of India',
  },
  {
    id: 'fir',
    title: 'If the police refuse to file your FIR',
    summary: 'Registering an FIR for a serious offence is their duty, not a favour.',
    points: [
      {
        h: 'They must register it',
        t: 'for cognizable offences (theft, assault, cheating, online fraud and the like), the Supreme Court has held that police must register the FIR. They cannot first "check if it is genuine".',
      },
      {
        h: 'Zero FIR',
        t: 'you can file the FIR at ANY police station, even outside the area where it happened. That station must register it and transfer it to the right one. This is called a Zero FIR.',
      },
      {
        h: 'If they still refuse',
        t: 'send your complaint in writing to the Superintendent of Police (SP) by post or in person. If the SP is satisfied, they can order an investigation. Keep proof of sending (registered post / receipt).',
      },
      {
        h: 'Still nothing?',
        t: 'you can approach the magistrate directly, who can order the police to investigate. A free lawyer from the District Legal Services Authority (15100) can help with this.',
      },
      {
        h: 'Always keep a copy',
        t: 'of the complaint you hand over, and ask for the FIR number or a receipt. Note the date, time and names of officers you met.',
      },
    ],
    cite: 'Lalita Kumari v. Govt. of U.P. (2014) 2 SCC 1; BNSS, 2023 (ss. 173\u2013175)',
  },
  {
    id: 'cyber',
    title: 'If money was stolen through online fraud',
    summary: 'The first hour decides everything. Move fast.',
    points: [
      {
        h: 'Call 1930 immediately',
        t: 'this is the national cyber-crime helpline. Report within the "golden hour" so the money can be frozen in the destination account before it moves.',
      },
      {
        h: 'Tell your bank too',
        t: 'call your bank\u2019s fraud line and send an email \u2014 ask them to block the transaction and give you a complaint/reference number in writing.',
      },
      {
        h: 'File online',
        t: 'cybercrime.gov.in takes complaints for financial fraud, and also for harassment, stalking and fake profiles. You do not need to go to a police station.',
      },
      {
        h: 'Preserve everything',
        t: 'screenshots of the payment, UTR/transaction ID, chat history, phone numbers and links. Do not delete the chat or app \u2014 it is your evidence.',
      },
    ],
    cite: 'Ministry of Home Affairs \u2014 National Cyber Crime Reporting Portal; RBI customer-protection directions',
  },
  {
    id: 'consumer',
    title: 'Consumer complaints \u2014 faulty product or bad service',
    summary: 'You can fight a company without paying a lawyer.',
    points: [
      {
        h: 'What counts',
        t: 'defective goods, poor or incomplete service, overcharging, false advertising, refusal to refund, e-commerce fraud \u2014 all covered by the Consumer Protection Act, 2019.',
      },
      {
        h: 'First, write to them',
        t: 'send a written complaint (email works) to the seller/company and keep a copy. Many refunds happen at this step \u2014 and the letter later becomes proof you tried.',
      },
      {
        h: 'Then the commission',
        t: 'claims up to \u20b950 lakh go to the District Consumer Disputes Redressal Commission of your area. Higher amounts go to the State/National Commission. You can file online through e-Daakhil, and a lawyer is NOT compulsory.',
      },
      {
        h: 'Time limit',
        t: 'generally within 2 years of the problem. Keep bills, receipts, screenshots, warranty cards and the complaint letters you sent.',
      },
      {
        h: 'Free help',
        t: 'the National Consumer Helpline (1915) and consumerhelpline.gov.in can pressure the company first, and guide you on filing.',
      },
    ],
    cite: 'Consumer Protection Act, 2019; Consumer Protection (Jurisdiction) Rules; e-Daakhil portal',
  },
  {
    id: 'student-fees',
    title: 'Students \u2014 fee refund and withheld certificates',
    summary: 'UGC rules protect you from colleges keeping your money or your papers.',
    points: [
      {
        h: 'Fee refund',
        t: 'under UGC\u2019s refund policy, if you withdraw admission quickly (within the notified window, about 15 days) you are owed a full refund minus a small processing fee (up to \u20b91,000). Later withdrawals get a sliding-scale refund, not zero.',
      },
      {
        h: 'Original certificates',
        t: 'UGC has directed colleges not to withhold original certificates (marks cards, migration, transfer certificate) as leverage for fees. You can demand them in writing.',
      },
      {
        h: 'Escalation path',
        t: '1) written complaint to the college principal, 2) the Student Grievance Redressal Committee (every HEI must have one), 3) the University Ombudsperson, 4) UGC itself (contact.ugc@nic.in). Keep every complaint in writing.',
      },
      {
        h: 'Write it properly',
        t: 'use the "Draft a Letter" page here \u2014 the university grievance template cites the exact UGC rules, which makes offices take the letter seriously.',
      },
    ],
    cite: 'UGC (Redressal of Grievances of Students) Regulations, 2023; UGC fee-refund public notices; UGC circulars on withholding of certificates',
  },
  {
    id: 'ragging',
    title: 'Students \u2014 ragging is a crime, not "tradition"',
    summary: 'There is a mandatory system to stop it. Use it early.',
    points: [
      {
        h: 'It is a punishable offence',
        t: 'under UGC\u2019s anti-ragging regulations, ragging can lead to suspension, expulsion, FIR against the culprits, and even cancellation of admission. "Light fun" is not an excuse.',
      },
      {
        h: 'Call 1800-180-5522',
        t: 'the UGC anti-ragging helpline, or file at antiragging.in \u2014 complaints go to the institution, the university and the police simultaneously. Complaints can be anonymous.',
      },
      {
        h: 'Every college must act',
        t: 'anti-ragging committees and squad patrols are compulsory. Wardens must keep the register of first-year students. Parents are told at admission that this exists.',
      },
      {
        h: 'If you see it happen',
        t: 'reporting someone else\u2019s ragging is protected \u2014 victims and witnesses are given confidentiality. Silence is what keeps ragging alive.',
      },
    ],
    cite: 'UGC Regulations on Curbing the Menace of Ragging, 2009 (as amended); Supreme Court directions in University of Kerala v. Govt. of Kerala',
  },
  {
    id: 'women',
    title: 'Women\u2019s safety \u2014 at home, street, campus and work',
    summary: 'Dedicated systems exist specifically for you.',
    points: [
      {
        h: 'Call 181',
        t: 'the women\u2019s helpline (Sakhi / One Stop Centres) \u2014 they help with police complaints, temporary shelter, medical aid, legal aid and counselling in one place. Dial 112 for immediate danger.',
      },
      {
        h: 'Zero FIR anywhere',
        t: 'any police station must register your FIR regardless of where the incident happened. You can also record a statement at home in front of a lady officer.',
      },
      {
        h: 'At work or internship',
        t: 'under the POSH Act, 2013, every workplace with 10+ employees must have an Internal Committee. Interns and students on placement are covered too. Complaints can be filed within 3 months of the incident (extendable).',
      },
      {
        h: 'Online harassment',
        t: 'report at cybercrime.gov.in (category: women-related crimes). Do not share the harasser\u2019s messages publicly first \u2014 preserve them as evidence.',
      },
    ],
    cite: 'POSH Act, 2013; BNSS, 2023; Ministry of Women & Child Development (One Stop Centres)',
  },
  {
    id: 'legalaid',
    title: 'Free legal aid \u2014 you do not have to pay for a lawyer',
    summary: 'If you cannot afford one, the law pays for it. This is a right, not charity.',
    points: [
      {
        h: 'Call 15100',
        t: 'the NALSA (National Legal Services Authority) helpline. Every district has a DLSA (District Legal Services Authority) office \u2014 usually inside the court complex.',
      },
      {
        h: 'Who qualifies',
        t: 'women, children, SC/ST members, people with disabilities, persons in custody, disaster victims, and anyone whose income is below the state-set ceiling. Students in many states qualify easily \u2014 just ask.',
      },
      {
        h: 'What they do',
        t: 'free advice, drafting, and a lawyer for court at no cost, including consumer, labour and family matters. Lok Adalats settle disputes quickly and without court fees.',
      },
      {
        h: 'Bring documents',
        t: 'ID proof, income proof (if claiming on income grounds) and every paper related to your matter \u2014 exactly the kind of evidence set the Timeline Generator on this site helps you organise.',
      },
    ],
    cite: 'Article 39A, Constitution of India; Legal Services Authorities Act, 1987; NALSA',
  },
]

export const HELPLINES = [
  { number: '112', label: 'Any emergency \u2014 police, fire, ambulance (national)' },
  { number: '181', label: 'Women\u2019s helpline (Sakhi / One Stop Centres)' },
  { number: '1098', label: 'CHILDLINE \u2014 children in distress (24\u00d77)' },
  { number: '1930', label: 'Cyber financial fraud \u2014 call within the first hour' },
  { number: '1915', label: 'National Consumer Helpline' },
  { number: '15100', label: 'NALSA \u2014 free legal aid' },
  { number: '1800-180-5522', label: 'UGC anti-ragging helpline' },
]

export const EMERGENCY_FIELDS = [
  { id: 'fullName', label: 'Your full name', required: true },
  { id: 'phone', label: 'Your phone number', required: true },
  { id: 'contactPerson', label: 'Contact person (name) \u2014 e.g. parent / friend', required: true },
  { id: 'contactPhone', label: 'Contact person\u2019s phone', required: true },
  { id: 'bloodGroup', label: 'Blood group', required: false },
  { id: 'medical', label: 'Allergies / medicines / medical notes', required: false },
  { id: 'address', label: 'Your address', required: false },
]
