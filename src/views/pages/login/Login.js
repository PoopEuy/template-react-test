import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useAuth } from '../../../context/AuthContext'
import { apiAuth } from '../../../api/axios'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, user } = useAuth()

  // Kalau sudah login, langsung ke /products
  useEffect(() => {
    if (user) {
      navigate('/products', { replace: true })
    }
  }, [user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await apiAuth.post('/login', {
        email: formData.email,
        password: formData.password,
      })

      const data = res.data

      // Support berbagai bentuk response:
      // { token, user } atau { data: { token, user } } atau { accessToken, ... }
      const token = data.token ?? data.accessToken ?? data.data?.token ?? data.data?.accessToken
      const userData = data.user ?? data.data?.user ?? { email: formData.email }

      if (!token) {
        throw new Error('Token tidak ditemukan di response login')
      }

      login({ user: userData, token })
      navigate('/products', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message ?? err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={5}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign in to your account</p>

                    {error && (
                      <CAlert color="danger" className="py-2">
                        {error}
                      </CAlert>
                    )}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        name="email"
                        placeholder="Email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        name="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </CInputGroup>

                    <CButton
                      type="submit"
                      color="primary"
                      className="px-4 w-100"
                      disabled={loading}
                    >
                      {loading ? <CSpinner size="sm" className="me-2" /> : null}
                      {loading ? 'Logging in...' : 'Login'}
                    </CButton>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
