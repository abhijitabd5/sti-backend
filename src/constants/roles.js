export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  TRAINER: 'trainer',
  WARDEN: 'warden',
  STUDENT: 'student',
  ACCOUNT: 'account',
  SEO: 'seo',
  MARKETING: 'marketing'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    'all_permissions'
  ],
  [USER_ROLES.ADMIN]: [
    'manage_students',
    'manage_courses',
    'manage_certificates',
    'manage_payments',
    'manage_expenses',
    'manage_enquiries',
    'manage_gallery',
    'manage_reviews',
    'view_dashboard',
    'manage_cms'
  ],
  [USER_ROLES.EMPLOYEE]: [
    // Reserved for future use
  ],
  [USER_ROLES.TRAINER]: [
    // Reserved for future use
  ],
  [USER_ROLES.WARDEN]: [
    // Reserved for future use
  ],
  [USER_ROLES.STUDENT]: [
    'view_profile',
    'view_payments',
    'view_certificates',
    'download_receipts',
    'download_certificates',
    'request_hard_copy'
  ],
  [USER_ROLES.ACCOUNT]: [
    'manage_payments',
    'manage_expenses',
    'view_financial_dashboard',
    'generate_financial_reports'
  ],
  [USER_ROLES.SEO]: [
    'manage_cms',
    'manage_blogs',
    'manage_meta_tags',
    'manage_seo_content'
  ],
  [USER_ROLES.MARKETING]: [
    // Reserved for future use
  ]
};

export default {
  USER_ROLES,
  ROLE_PERMISSIONS
};
