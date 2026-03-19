// Auth
export const AUTH_REGISTER = '/auth/register'
export const AUTH_LOGIN = '/auth/login'
export const AUTH_FORGOT_PASSWORD = '/auth/forgot-password'
export const AUTH_RESET_PASSWORD = '/auth/reset-password'

// Patient — public data
export const PATIENT_PUBLIC_DEPARTMENTS = '/patient/departments'
export const PATIENT_PUBLIC_DOCTORS = '/patient/doctors'

// Patient — profile
export const PATIENT_PROFILE = '/patient/profile'
export const PATIENT_PROFILE_UPDATE = '/patient/profile'

// Patient — appointments
export const PATIENT_SLOTS = '/patient/slots'
export const PATIENT_BOOK_TOKEN = '/patient/book-token'
export const PATIENT_CANCEL_TOKEN = (tokenId) => `/patient/cancel-token/${tokenId}`
export const PATIENT_VISIT_HISTORY = '/patient/visit-history'

// Token
export const TOKEN_BY_ID = (tokenId) => `/token/${tokenId}`
export const TOKEN_MY_ALL = '/token/my/all'
export const TOKEN_PDF = (tokenId) => `/token/pdf/${tokenId}`

// Doctor
export const DOCTOR_CREATE_SCHEDULE = '/doctor/schedule'
export const DOCTOR_GET_SCHEDULE = '/doctor/schedule'
export const DOCTOR_QUEUE = '/doctor/queue'
export const DOCTOR_COMPLETE_TOKEN = (tokenId) => `/doctor/complete-token/${tokenId}`

// Prescriptions
export const PRESCRIPTION_CREATE = '/prescriptions'
export const PRESCRIPTION_PDF = (id) => `/prescriptions/${id}/pdf`

// MD
export const MD_CREATE_DEPARTMENT = '/md/department'
export const MD_DEPARTMENTS = '/md/departments'
export const MD_UPDATE_DEPARTMENT = (id) => `/md/department/${id}`
export const MD_CREATE_DOCTOR = '/md/doctor'
export const MD_DOCTORS = '/md/doctors'
export const MD_UPDATE_DOCTOR = (id) => `/md/doctor/${id}`
export const MD_TOGGLE_DOCTOR_STATUS = (id) => `/md/doctor/${id}/toggle-status`

// Analytics
export const ANALYTICS_DOCTOR_TODAY = '/analytics/doctor/today'
export const ANALYTICS_MD_TODAY = '/analytics/md/today'
