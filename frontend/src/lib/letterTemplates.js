/**
 * Formal letter / application templates, built entirely in the browser so
 * drafting works even when the AI backend is unreachable. Content follows
 * standard Indian complaint/application formats and cites the relevant
 * statute for each scenario so the letter is taken seriously on arrival.
 */

export const COMMON_FIELDS = [
  { id: 'yourName', label: 'Your full name', required: true, placeholder: 'e.g. Ananya Sharma' },
  { id: 'yourAddress', label: 'Your address', required: false, placeholder: 'House / street / city / PIN' },
  { id: 'yourPhone', label: 'Your phone number', required: false, placeholder: 'e.g. 98765 43210' },
  { id: 'yourEmail', label: 'Your email', required: false, placeholder: 'e.g. you@example.com' },
]

export const SCENARIOS = [
  {
    id: 'consumer',
    label: 'Consumer complaint',
    blurb: 'Faulty product, bad service, refund refused \u2014 District Consumer Commission.',
    to: 'The President, District Consumer Disputes Redressal Commission',
    fields: [
      { id: 'authorityPlace', label: 'Commission district (city)', required: true, placeholder: 'e.g. Pune' },
      { id: 'sellerName', label: 'Company / seller name', required: true, placeholder: 'e.g. ABC Electronics Pvt Ltd' },
      { id: 'sellerAddress', label: 'Company / seller address', required: false, placeholder: 'Shop / registered office address' },
      { id: 'purchaseRef', label: 'Invoice / order / booking number', required: false, placeholder: 'e.g. Order #12345, Invoice INV-88' },
      { id: 'purchaseDate', label: 'Date of purchase / booking', type: 'date', required: false },
      { id: 'amount', label: 'Amount involved (\u20b9)', type: 'number', required: true, placeholder: 'e.g. 25000' },
      { id: 'facts', label: 'What happened (short, factual, in date order)', type: 'textarea', required: true, placeholder: 'Bought a fridge on 3 May. It stopped working on 20 May. Service centre refused to repair or refund since 25 May despite three visits\u2026' },
      { id: 'relief', label: 'What you want them to do', type: 'textarea', required: true, placeholder: 'Refund \u20b925,000 with interest, plus \u20b95,000 compensation and litigation cost.' },
    ],
    annexureNote: 'Bills / invoices / order confirmation, payment proof, complaint emails and their replies, photographs',
  },
  {
    id: 'police',
    label: 'Police complaint',
    blurb: 'Theft, harassment, fraud \u2014 written complaint to the station house officer.',
    to: 'The Station House Officer',
    fields: [
      { id: 'stationName', label: 'Police station', required: true, placeholder: 'e.g. Koramangala Police Station, Bengaluru' },
      { id: 'incidentDate', label: 'Date (and approximate time) of incident', required: true, placeholder: 'e.g. 10 Nov 2026, around 9 pm' },
      { id: 'incidentPlace', label: 'Place of incident', required: true, placeholder: 'e.g. near MG Road metro station' },
      { id: 'subject', label: 'What happened (factual, short sentences)', type: 'textarea', required: true, placeholder: 'My phone was snatched by two men on a bike while I was walking\u2026' },
      { id: 'accused', label: 'Accused details if known (names, vehicle, looks)', required: false, placeholder: 'Leave out if unknown' },
      { id: 'relief', label: 'Action you are requesting', required: false, placeholder: 'e.g. register the FIR, investigate, recover my phone' },
    ],
    annexureNote: 'ID proof, screenshots/chats, bill or receipt of stolen item, photos of the place',
  },
  {
    id: 'rti',
    label: 'RTI application',
    blurb: 'Ask any government body for records, statuses, files \u2014 they must reply in 30 days.',
    to: 'The Public Information Officer (PIO)',
    fields: [
      { id: 'authorityName', label: 'Which authority (ministry / department / office)', required: true, placeholder: 'e.g. Regional Passport Office, Mumbai' },
      { id: 'authorityAddress', label: 'Address of the public authority', required: false, placeholder: 'Office address (for the envelope)' },
      { id: 'period', label: 'Period / file / reference the question is about', required: false, placeholder: 'e.g. application no. AB123456 filed on 2 Jan 2026' },
      { id: 'questions', label: 'Information you want (numbered, one per point)', type: 'textarea', required: true, placeholder: '1. Certified copy of the action-taken report on\u2026\n2. Name and designation of the official responsible for\u2026' },
    ],
    annexureNote: 'Proof of identity (copy), proof of fee payment (\u20b910 IPO / online)',
  },
  {
    id: 'university',
    label: 'University grievance',
    blurb: 'Fee refund, withheld certificates, exam or hostel issues \u2014 cites UGC rules.',
    to: 'The Principal / Registrar',
    fields: [
      { id: 'institutionName', label: 'College / university name', required: true, placeholder: 'e.g. XYZ College of Engineering' },
      { id: 'enrolment', label: 'Your enrolment / roll number and course', required: true, placeholder: 'e.g. Roll 21CS041, B.Tech CSE' },
      { id: 'grievanceKind', label: 'Type of grievance', type: 'select', options: ['Refund of fee / caution deposit', 'Original certificates withheld', 'Result or marks-card error', 'Hostel issue', 'Other \u2014 described below'], required: true },
      { id: 'details', label: 'What happened (factual, in date order)', type: 'textarea', required: true, placeholder: 'I cancelled my admission on 5 July 2026, within the notified window. The office has not refunded the \u20b948,000 fee paid on 28 June 2026 despite my follow-ups on\u2026' },
      { id: 'amount', label: 'Amount involved (\u20b9), if any', type: 'number', required: false },
      { id: 'relief', label: 'What you want them to do', required: false, placeholder: 'e.g. refund the full fee within 15 days as per UGC rules' },
    ],
    annexureNote: 'Fee receipts, admission cancellation letter, previous written complaints, mark sheets',
  },
  {
    id: 'landlord',
    label: 'Security deposit reminder',
    blurb: 'Landlord not returning your deposit after you moved out \u2014 formal legal notice.',
    to: 'To',
    fields: [
      { id: 'landlordName', label: 'Landlord name', required: true, placeholder: 'e.g. Mr Ramesh Kumar' },
      { id: 'landlordAddress', label: 'Landlord address', required: false, placeholder: 'Known address' },
      { id: 'propertyAddress', label: 'Rented property address', required: true, placeholder: 'Flat 302, Green Residency\u2026' },
      { id: 'moveOutDate', label: 'Date you handed back possession', type: 'date', required: true },
      { id: 'depositAmount', label: 'Security deposit paid (\u20b9)', type: 'number', required: true, placeholder: 'e.g. 60000' },
      { id: 'details', label: 'Anything else (deductions claimed, refusals, agreement terms)', type: 'textarea', required: false, placeholder: 'e.g. Landlord claims \u20b98,000 for repainting although the agreement has no such clause\u2026' },
    ],
    annexureNote: 'Rent agreement, deposit payment proof, move-out photos/videos, handover message/chat',
  },
]

const ME = (d) =>
  [
    d.yourName ? `Yours faithfully,\n${d.yourName}` : 'Yours faithfully,',
    d.yourAddress || '',
    [d.yourPhone, d.yourEmail].filter(Boolean).join(' | '),
  ]
    .filter((line) => String(line).trim())
    .join('\n')

const ANNEXURES = (items, extra) => {
  const lines = []
  if (items.length) lines.push(...items.map((t) => `${lines.length + 1}. ${t}`))
  if (extra) {
    extra
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => lines.push(`${lines.length + 1}. ${line}`))
  }
  if (!lines.length) return ''
  return `Enclosures:\n${lines.join('\n')}`
}

function dateLine() {
  const d = new Date()
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function numbered(text) {
  const lines = String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  if (!lines.length) return ''
  // A single paragraph reads better unnumbered.
  if (lines.length === 1 && !/^\d+[.)]/.test(lines[0])) return lines[0]
  return lines
    .map((line, i) => (/^\d+[.)]/.test(line) ? `   ${line}` : `   ${i + 1}. ${line}`))
    .join('\n')
}

function buildConsumer(d, annexures) {
  return {
    heading: `${SCENARIOS[0].to}, ${d.authorityPlace || '[your district]'}`,
    subject: `Consumer complaint under the Consumer Protection Act, 2019 \u2014 deficiency in service by ${d.sellerName || '[seller]'}`,
    body: `Respected Sir/Madam,

I, ${d.yourName || '[your name]'}, wish to file a complaint against ${d.sellerName || '[seller]'}${d.sellerAddress ? `, ${d.sellerAddress}` : ''} for deficiency in service / unfair trade practice.

1. I purchased/availed the goods or services${d.purchaseRef ? ` (ref: ${d.purchaseRef})` : ''}${d.purchaseDate ? ` on ${d.purchaseDate}` : ''} for \u20b9${d.amount || '[amount]'}.
2. The problem: ${numbered(d.facts)}
3. I request the following relief: ${numbered(d.relief)}
4. Copies of my bills, payment proof and my written complaints to the seller are enclosed.

The claim amount is \u20b9${d.amount || '[amount]'}, within the pecuniary jurisdiction of this Hon\u2019ble Commission. I am filing this complaint in person / through e-Daakhil and request it be admitted and decided as per law.

Thanking you,

${ME(d)}
${annexures}`,
  }
}

function buildPolice(d, annexures) {
  return {
    heading: `${SCENARIOS[1].to},\n${d.stationName || '[police station]'}`,
    subject: `Complaint regarding incident of ${d.incidentDate || '[date]'} at ${d.incidentPlace || '[place]'} \u2014 request for registration of FIR`,
    body: `Respected Sir/Madam,

I, ${d.yourName || '[your name]'}, wish to report the following incident:

1. Date and time: ${d.incidentDate || '[date]'}.
2. Place: ${d.incidentPlace || '[place]'}.
3. What happened: ${numbered(d.facts)}
${d.accused ? `4. Details of the person(s) involved, as far as I know: ${d.accused}.\n` : ''}${d.relief ? `5. I request that ${d.relief}.\n` : ''}
I request you to kindly register the FIR, give me a free copy of the FIR as required by law, and investigate the matter. If any part of my complaint falls outside your jurisdiction, I request it be registered as a Zero FIR and transferred to the concerned police station.

Thanking you,

${ME(d)}
${annexures}`,
  }
}

function buildRti(d, annexures) {
  return {
    heading: `${SCENARIOS[2].to},\n${d.authorityName || '[public authority]'}`,
    subject: `Application under the Right to Information Act, 2005${d.period ? ` \u2014 ref: ${d.period}` : ''}`,
    body: `Sir/Madam,

Kindly provide me the following information under the Right to Information Act, 2005:

${numbered(d.questions)}

${d.period ? `The information relates to ${d.period}.\n\n` : ''}If the information is held by another public authority, I request you to transfer this application under Section 6(3) of the Act and inform me of the transfer. If you intend to deny any part, kindly do so in writing with the specific exemption relied upon.

A fee of \u20b910 is enclosed / paid online. I am a citizen of India. Kindly supply the information within 30 days as required by the Act (48 hours where it concerns life or liberty).

If no reply is received within 30 days, I will file a first appeal before the First Appellate Authority of the department, and thereafter a second appeal before the Central/State Information Commission.

Thanking you,

${ME(d)}
${annexures}`,
  }
}

function buildUniversity(d, annexures) {
  const kindLine = d.grievanceKind ? `\u201c${d.grievanceKind}\u201d` : ''
  return {
    heading: `${SCENARIOS[3].to},\n${d.institutionName || '[institution]'}`,
    subject: `Grievance regarding ${d.grievanceKind || '[issue]'}${d.enrolment ? ` \u2014 ${d.enrolment}` : ''}`,
    body: `Respected Sir/Madam,

I am ${d.yourName || '[your name]'}${d.enrolment ? `, ${d.enrolment}` : ''}. I wish to raise the following grievance: ${kindLine}

1. Facts: ${numbered(d.details)}
${d.amount ? `2. The amount involved is \u20b9${d.amount}.\n` : ''}${d.relief ? `3. I request that ${d.relief}.\n` : ''}
I would like to point out that:
- Under the UGC (Redressal of Grievances of Students) Regulations, 2023, every higher educational institution must maintain a Student Grievance Redressal Committee, and every student has the right to escalate to the University Ombudsperson if the grievance is not redressed within 15 days.
- UGC\u2019s fee-refund policy entitles students who withdraw within the notified window to a full refund, after deduction of at most \u20b91,000 as processing charges.
- UGC has separately directed institutions not to withhold original certificates of students.

I request a written reply within 15 days. If the grievance is not redressed, I will approach the Ombudsperson appointed under the above Regulations and, where necessary, UGC.

Thanking you,

${ME(d)}
${annexures}`,
  }
}

function buildLandlord(d, annexures) {
  return {
    heading: `To,\n${d.landlordName || '[landlord]'}${d.landlordAddress ? `\n${d.landlordAddress}` : ''}`,
    subject: `Return of security deposit of \u20b9${d.depositAmount || '[amount]'} \u2014 ${d.propertyAddress || '[property]'}`,
    body: `Respected Sir/Madam,

I was a tenant at ${d.propertyAddress || '[property address]'} and handed back peaceful possession of the premises on ${d.moveOutDate || '[date]'}. A security deposit of \u20b9${d.depositAmount || '[amount]'} was paid at the start of the tenancy${d.details ? `.\n\n${d.details}` : '.'}

Despite this, the deposit has not been returned till date. I request you to return the full security deposit of \u20b9${d.depositAmount || '[amount]'} (after only such lawful deductions as are supported by bills and agreed in the rent agreement) within 15 days of receipt of this letter.

Please treat this as a formal notice before legal action. If the amount is not returned within 15 days, I will be constrained to pursue my remedies before the appropriate civil court / rent authority, along with costs and interest, and this letter will be relied upon as proof of demand.

Thanking you,

${ME(d)}
${annexures}`,
  }
}

const BUILDERS = {
  consumer: buildConsumer,
  police: buildPolice,
  rti: buildRti,
  university: buildUniversity,
  landlord: buildLandlord,
}

/**
 * Build the full letter text. `evidenceTitles` are the timeline item titles
 * the user ticked off; `extraAnnexures` is free text (one per line).
 */
export function buildLetter(scenarioId, data, evidenceTitles = [], extraAnnexures = '') {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]
  const builder = BUILDERS[scenario.id]
  const annexures = ANNEXURES(evidenceTitles, extraAnnexures)
  const { heading, subject, body } = builder(data, annexures)

  return [
    `Place: ${data.authorityPlace || data.stationName || ''}`.replace(': ', ': ').trim(),
    `Date: ${dateLine()}`,
    '',
    heading,
    '',
    `Subject: ${subject}`,
    '',
    body,
    '',
    scenario.id === 'rti'
      ? 'Note: fee of \u20b910 \u2014 Indian Postal Order payable to the Accounts Officer of the public authority, or pay online at rtionline.gov.in.'
      : '',
  ]
    .filter((part) => part !== '')
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
}

export function missingRequired(scenario, data) {
  return scenario.fields
    .filter((field) => field.required && !String(data[field.id] ?? '').trim())
    .map((field) => field.label)
}
