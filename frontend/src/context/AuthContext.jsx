import { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { jwtDecode } from '../utils/jwt'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('ql_token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setUser({ id: decoded.id, role: decoded.role, token })
        } else {
          Cookies.remove('ql_token')
        }
      } catch {
        Cookies.remove('ql_token')
      }
    }
    setLoading(false)
  }, [])

  const login = (token, role) => {
    Cookies.set('ql_token', token, { expires: 1, sameSite: 'lax' })
    const decoded = jwtDecode(token)
    setUser({ id: decoded.id, role, token })
  }

  const logout = () => {
    Cookies.remove('ql_token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
