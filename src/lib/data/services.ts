import type { CampusService } from '@/types';

/**
 * PLMun service directory.
 *
 * Sources: the official PLMun website (plmun.edu.ph) and its Citizen's Charter,
 * captured through the Internet Archive while the live site was behind a bot
 * check. Office names, locations, extension numbers, document names, and the
 * Registrar's posted hours come from those PLMun pages.
 *
 * Queue counts are simulated in the prototype. Do not present them as live
 * University figures.
 */
export const CAMPUS_SERVICES: CampusService[] = [
  {
    id: 'registrar',
    code: 'REG',
    prefix: 'R',
    name: 'Registrar',
    office: 'Office of the University Registrar',
    description:
      'Student records and academic documents, including the Certificate of Matriculation (COM), Certificate of Grades (COG), and Transcript of Records (TOR).',
    location: '1st Floor, Student Center Bldg.',
    phoneExtension: '205',
    hours: {
      label: 'Monday–Friday',
      days: 'Monday–Friday',
      time: '8:00 AM–5:00 PM',
      verified: true,
      note: 'Office hours as posted by the Office of the University Registrar.',
    },
    counterCount: 3,
    avgServiceMinutes: 3,
    requestTypes: [
      { value: 'COM', label: 'Certificate of Matriculation (COM)' },
      { value: 'COG', label: 'Certificate of Grades (COG)' },
      { value: 'TOR', label: 'Transcript of Records (TOR)' },
      { value: 'CERTIFICATION', label: 'Certification' },
      { value: 'CORRECTION', label: 'Correction / record update' },
      { value: 'OTHER', label: 'Other' },
    ],
    requirements: [
      'Valid PLMun student ID',
      'Ask at the counter for the current request form and any fees',
    ],
    notes: [
      'Some documents require a completed request form or a payment receipt. Confirm at the counter before your turn.',
    ],
    accent: 'green',
  },
  {
    id: 'cashier',
    code: 'FIN',
    prefix: 'F',
    name: 'Cashier',
    office: 'Finance Office',
    description:
      'Payments and student account concerns, including assessment inquiries and official receipts.',
    location: '1st Floor, Annex Bldg.',
    phoneExtension: '213',
    hours: {
      label: 'Typical campus hours',
      days: 'Monday–Friday',
      time: '8:00 AM–5:00 PM',
      verified: false,
      note: 'Confirm the Finance Office’s current window hours with the office.',
    },
    counterCount: 2,
    avgServiceMinutes: 3,
    requestTypes: [
      { value: 'PAYMENT', label: 'Tuition / fee payment' },
      { value: 'ASSESSMENT', label: 'Assessment inquiry' },
      { value: 'RECEIPT', label: 'Official receipt' },
      { value: 'UNIFAST', label: 'UniFAST billing concern' },
      { value: 'OTHER', label: 'Other' },
    ],
    requirements: [
      'Valid PLMun student ID',
      'Assessment form or reference number, if available',
    ],
    notes: [
      'PLMun is a UniFAST recipient. Covered students may have no tuition to pay — confirm your assessment at the window.',
    ],
    accent: 'gold',
  },
  {
    id: 'student-affairs',
    code: 'OSA',
    prefix: 'OSA',
    name: 'Student Affairs',
    office: 'Office of Student Affairs — Scholarship and Financial Assistance Division',
    description:
      'Local and private scholarship applications, scholarship renewals, and the Student Assistantship program.',
    location: '2nd Floor, Student Center Bldg.',
    phoneExtension: '247',
    hours: {
      label: 'Typical campus hours',
      days: 'Monday–Friday',
      time: '8:00 AM–5:00 PM',
      verified: false,
      note: 'Confirm the OSA’s current hours with the office.',
    },
    counterCount: 2,
    avgServiceMinutes: 5,
    requestTypes: [
      { value: 'LOCAL_NEW', label: 'Local scholarship — new application' },
      { value: 'LOCAL_RENEW', label: 'Local scholarship — renewal' },
      { value: 'PRIVATE', label: 'Private scholarship' },
      { value: 'ASSISTANTSHIP', label: 'Student Assistantship' },
      { value: 'OTHER', label: 'Other' },
    ],
    requirements: [
      'Certificate of Matriculation (COM)',
      'Certificate of Grades (COG)',
      'Certificate of Good Moral Character',
      'Valid student ID',
    ],
    notes: [
      'Requirements vary by program. Check the posted scholarship guidelines for the complete list.',
    ],
    accent: 'teal',
  },
  {
    id: 'id-services',
    code: 'MIS',
    prefix: 'ID',
    name: 'Student ID',
    office: 'Management Information System (MIS) Office',
    description:
      'Printing and issuance of student identification cards through the MIS Office.',
    location: '2nd Floor, Main Bldg.',
    phoneExtension: '228',
    hours: {
      label: 'Typical campus hours',
      days: 'Monday–Friday',
      time: '8:00 AM–5:00 PM',
      verified: false,
      note: 'Confirm the MIS Office’s current ID processing hours.',
    },
    counterCount: 1,
    avgServiceMinutes: 4,
    requestTypes: [
      { value: 'NEW_ID', label: 'New student ID' },
      { value: 'REPLACEMENT', label: 'ID replacement' },
      { value: 'CLAIM', label: 'Claim printed ID' },
      { value: 'OTHER', label: 'Other' },
    ],
    requirements: [
      'Certificate of Matriculation (COM) from the Registrar',
      'Complete student information for the ID form',
    ],
    notes: [
      'The MIS Office verifies enrollment before printing. Bring your COM.',
    ],
    accent: 'blue',
  },
  {
    id: 'guidance',
    code: 'GCS',
    prefix: 'G',
    name: 'Guidance & Counseling',
    office: 'Center for Guidance and Counseling Services — Office of Student Affairs',
    description:
      'Guidance and counseling support, including individual sessions, referrals, and follow-ups.',
    location: '2nd Floor, Student Center Bldg.',
    phoneExtension: '247',
    hours: {
      label: 'Typical campus hours',
      days: 'Monday–Friday',
      time: '8:00 AM–5:00 PM',
      verified: false,
      note: 'Confirm counselor availability before going to the office.',
    },
    counterCount: 1,
    avgServiceMinutes: 20,
    requestTypes: [
      { value: 'COUNSELING', label: 'Counseling session' },
      { value: 'REFERRAL', label: 'Referral' },
      { value: 'FOLLOW_UP', label: 'Follow-up' },
      { value: 'OTHER', label: 'Other' },
    ],
    requirements: ['Valid student ID', 'Counseling referral form, if applicable'],
    notes: [
      'Keep personal details brief in your queue request. Counseling conversations stay with your counselor.',
    ],
    accent: 'violet',
  },
  {
    id: 'clinic',
    code: 'MDC',
    prefix: 'MD',
    name: 'Medical & Dental Clinic',
    office: 'Medical and Dental Division — Office of Student Affairs',
    description:
      'Medical and dental consultations, first aid, and student health records.',
    location: '2nd Floor, Student Center Bldg.',
    phoneExtension: '247',
    hours: {
      label: 'Typical campus hours',
      days: 'Monday–Friday',
      time: '8:00 AM–5:00 PM',
      verified: false,
      note: 'Clinic hours and available consultants may change. Confirm with the clinic.',
    },
    counterCount: 2,
    avgServiceMinutes: 12,
    requestTypes: [
      { value: 'MEDICAL', label: 'Medical consultation' },
      { value: 'DENTAL', label: 'Dental consultation' },
      { value: 'FIRST_AID', label: 'First aid' },
      { value: 'RECORD', label: 'Medical / dental record' },
      { value: 'OTHER', label: 'Other' },
    ],
    requirements: ['Valid student ID', 'Medical or dental record on file'],
    notes: [
      'For a medical emergency, go directly to the clinic or call for assistance. Do not wait for a queue number.',
    ],
    accent: 'rose',
  },
];

export const SERVICE_MAP = new Map(CAMPUS_SERVICES.map((service) => [service.id, service]));

export function getService(id: string): CampusService | undefined {
  return SERVICE_MAP.get(id);
}

export const COURSE_OPTIONS = [
  'BS Psychology',
  'BA Communication',
  'BA Political Science',
  'BS Accountancy',
  'BS Business Administration — Operations Management',
  'BS Business Administration — Marketing Management',
  'BS Business Administration — Human Resource Management',
  'BS Criminology',
  'BS Information Technology',
  'BS Computer Science',
  'Associate in Computer Technology',
  'Bachelor in Elementary Education',
  'Bachelor in Secondary Education — Sciences',
  'Bachelor in Secondary Education — English',
  'Bachelor in Secondary Education — Social Science',
  'Graduate Studies',
  'Other',
] as const;

export const YEAR_LEVELS = [
  '1st year',
  '2nd year',
  '3rd year',
  '4th year',
  '5th year',
  'Graduate student',
] as const;
