import React from 'react'
import { CButton, CCard, CCardBody, CContainer, CRow, CCol } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

const Unauthorized = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="text-center p-4">
              <CCardBody>
                <h1>403</h1>
                <h2>Unauthorized</h2>
                <p>You do not have permission to access this page.</p>
                <CButton color="primary" onClick={() => navigate('/dashboard')}>
                  Go Back to Dashboard
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Unauthorized
