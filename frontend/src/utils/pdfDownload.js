import Cookies from 'js-cookie'
import { TOKEN_PDF, PRESCRIPTION_PDF } from '../api/endpoints'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Gets current JWT from cookie
const getJwt = () => Cookies.get('ql_token') || ''

// Download token PDF — passes JWT as query param (window.open can't set headers)
export const downloadTokenPDF = (tokenId) => {
  const jwt = getJwt()
  window.open(`${BASE}${TOKEN_PDF(tokenId)}?token=${jwt}`, '_blank')
}

// Download prescription PDF — passes JWT as query param
export const downloadPrescriptionPDF = (prescriptionId) => {
  const jwt = getJwt()
  window.open(`${BASE}${PRESCRIPTION_PDF(prescriptionId)}?token=${jwt}`, '_blank')
}
