export const BACKEND: 'demo' = 'demo';

export const IS_DEMO = BACKEND === 'demo';

export const APP_NAME = 'SmartQueue';
export const INSTITUTION_NAME = 'Pamantasan ng Lungsod ng Muntinlupa';
export const INSTITUTION_SHORT = 'PLMun';
export const OFFICIAL_SITE = 'https://plmun.edu.ph/';
export const OFFICIAL_EMAIL = 'plmuncomm@plmun.edu.ph';
export const OFFICIAL_ADDRESS =
  'University Road, NBP Reservation, Brgy. Poblacion, City of Muntinlupa, Philippines, 1776';

export const DEMO_ACCOUNT = {
  email: 'studentdemo@plmun.edu.ph',
  name: 'Student Demo Account',
  studentId: '2025-00100',
  course: 'BSIT',
  yearLevel: '3rd year',
  phone: '0917 000 0000',
  preferredServices: ['registrar', 'cashier', 'student-affairs'],
} as const;

export const SESSION_KEY = 'sq_session_v1';
export const PROFILES_KEY = 'sq_profiles_v1';
export const QUEUE_KEY = 'sq_queue_state_v1';
export const NOTIFICATIONS_KEY = 'sq_notifications_v1';
export const REQUEST_DRAFT_KEY = 'sq_request_draft_v1';
export const SPLASH_KEY = 'sq_splash_seen_v1';
export const NOTIFICATION_PROMPT_KEY = 'sq_notification_prompt_v1';
