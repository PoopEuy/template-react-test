import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked } from '@coreui/icons'
import { backendAuth } from '../../../api/axios'
import { useAuth } from '../../../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({ emailOrUsername: '', password: '' })
  const navigate = useNavigate()
  const { login } = useAuth()

  // Cek apakah token masih valid
  useEffect(() => {
    const token = localStorage.getItem('token')
    const expiresAt = localStorage.getItem('expiresAt') // timestamp expiry
    console.log('expired_at : ', expiresAt)
    if (token && expiresAt) {
      const now = Date.now()
      if (now < Number(expiresAt)) {
        navigate('/dashboard')
        console.log('Auto Login')
        return
      } else {
        console.log('Expired Login')
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('expiresIn')
        localStorage.removeItem('expiresAt')
      }
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await backendAuth.post('/login', {
        emailOrUsername: formData.emailOrUsername,
        password: formData.password,
      })

      if (res.data.success) {
        const { user, token, expiresIn } = res.data.data

        // Simpan waktu kedaluwarsa dalam milidetik
        let expiresAt = Date.now()
        if (expiresIn === '24h') {
          expiresAt += 24 * 60 * 60 * 1000
        }

        login({ user, token })
        localStorage.setItem('expiresIn', expiresIn)
        localStorage.setItem('expiresAt', expiresAt.toString())

        navigate('/dashboard')
      } else {
        alert(res.data.message || 'Login gagal')
      }
    } catch (err) {
      console.error(err)
      alert('Login gagal, periksa kembali email/username dan password')
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>@</CInputGroupText>
                      <CFormInput
                        type="text"
                        name="emailOrUsername"
                        placeholder="Email Or Username"
                        autoComplete="username"
                        value={formData.emailOrUsername}
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

                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                    </CRow>
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
