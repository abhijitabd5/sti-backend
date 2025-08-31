export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  UPLOAD_PATHS: {
    COURSES: 'uploads/courses/',
    GALLERY: 'uploads/gallery/',
    CERTIFICATES: 'uploads/certificates/',
    DOCUMENTS: 'uploads/documents/',
    PROFILES: 'uploads/profiles/'
  }
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CHEQUE: 'cheque',
  UPI: 'upi',
  CARD: 'card',
  OTHER: 'other'
};

export const COURSE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft'
};

export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  DROPPED: 'dropped'
};

export const CERTIFICATE_STATUS = {
  ISSUED: 'issued',
  PENDING: 'pending',
  CANCELLED: 'cancelled'
};

export const ENQUIRY_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  CONTACTED: 'contacted',
  CONVERTED: 'converted',
  CLOSED: 'closed'
};

export const ACTION_TYPES = {
  CALL: 'call',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  MESSAGE: 'message',
  MEETING: 'meeting'
};

export const GALLERY_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video'
};

export const VIDEO_PLATFORMS = {
  YOUTUBE: 'youtube',
  FACEBOOK: 'facebook',
  VIMEO: 'vimeo',
  OTHER: 'other'
};

export const CMS_PAGE_TYPES = {
  ABOUT_US: 'about_us',
  VISION: 'vision',
  MISSION: 'mission',
  CONTACT_US: 'contact_us',
  REFUND_POLICY: 'refund_policy',
  TERMS_CONDITIONS: 'terms_conditions',
  PRIVACY_POLICY: 'privacy_policy',
  HOSTEL_MESS: 'hostel_mess',
  CERTIFICATIONS: 'certifications'
};

export const LANGUAGES = {
  EN: 'en',
  HI: 'hi'
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export const CACHE_KEYS = {
  COURSES: 'courses',
  GALLERY_IMAGES: 'gallery_images',
  GALLERY_VIDEOS: 'gallery_videos',
  REVIEWS: 'reviews',
  CMS_PAGES: 'cms_pages',
  DASHBOARD_STATS: 'dashboard_stats'
};

export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
};

export default {
  PAGINATION,
  FILE_UPLOAD,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  COURSE_STATUS,
  STUDENT_STATUS,
  CERTIFICATE_STATUS,
  ENQUIRY_STATUS,
  ACTION_TYPES,
  GALLERY_TYPES,
  VIDEO_PLATFORMS,
  CMS_PAGE_TYPES,
  LANGUAGES,
  USER_STATUS,
  GENDER,
  INDIAN_STATES,
  CACHE_KEYS,
  CACHE_TTL
};
