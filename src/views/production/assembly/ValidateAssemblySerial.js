import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  CRow,
  CCard,
  CCol,
  CCardBody,
  CCardHeader,
  CFormLabel,
  CFormInput,
  CForm,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { backendLuhn } from '../../../api/axios'
import SuccessCard from '../../components/SuccessCard'
import ErrorCard from '../../components/ErrorCard'
import '../../../scss/style.scss'

const FormRow = ({ label, children }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={4}>
      <CFormLabel className="fw-semibold">{label}</CFormLabel>
    </CCol>
    <CCol md={8}>{children}</CCol>
  </CRow>
)

const ValidateAssemblySerial = () => {
  const location = useLocation()
  const [serialNumber, setSerialNumber] = useState('')
  const serialInputRef = useRef(null)
  const [validationState, setValidationState] = useState(null) // null, 'success', 'error'
  const [validatedSerialNumber, setValidatedSerialNumber] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [validationData, setValidationData] = useState(null)

  // fokus otomatis saat page load / nav pindah
  useEffect(() => {
    serialInputRef.current?.focus()
  }, [location.pathname])

  // Reset validation state ketika mulai scan baru
  const resetValidation = () => {
    setValidationState(null)
    setValidatedSerialNumber('')
    setValidationMessage('')
    setValidationData(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!serialNumber) {
      toast.error('Serial number cannot be empty')
      return
    }

    // Simpan serial number sebelum clear input
    const currentSerialNumber = serialNumber
    setSerialNumber('') // Clear input immediately

    // Reset validation state sebelum validate
    resetValidation()

    try {
      // Panggil API validasi
      const validateRes = await backendLuhn.post('/validate', {
        number: currentSerialNumber,
      })

      // Cek response
      if (validateRes.data.data?.isValid) {
        // Success
        setValidationState('success')
        setValidatedSerialNumber(currentSerialNumber)
        setValidationMessage(validateRes.data.data.message || 'Serial number is valid')
        setValidationData(validateRes.data.data)
        // toast.success('Serial number validated successfully!')
      } else {
        // Failed validation
        setValidationState('error')
        setValidatedSerialNumber(currentSerialNumber)
        setValidationMessage(validateRes.data.data.message || 'Invalid serial number')
      }
    } catch (error) {
      // Error dari API
      setValidationState('error')
      setValidatedSerialNumber(currentSerialNumber)
      setValidationMessage(
        error.response?.data?.message || error.message || 'Failed to validate serial number',
      )
      console.error('Validation error:', error)
    } finally {
      // Focus kembali ke input untuk scan berikutnya
      serialInputRef.current?.focus()
    }
  }

  // submit otomatis saat scan (enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CRow className="g-4 align-items-stretch">
          {/* Kolom Kiri - Form Scan Serial Number */}
          <CCol md={8} className="d-flex flex-column">
            <CCard className="mb-4 h-100">
              <CCardHeader>
                <strong>Validate Assembly Serial Number</strong>
              </CCardHeader>
              <CCardBody>
                <CForm onSubmit={handleSubmit}>
                  <FormRow label="Serial Number">
                    <CFormInput
                      name="serialNumber"
                      placeholder="Scan or input serial number"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      onKeyDown={handleKeyDown}
                      ref={serialInputRef}
                      autoComplete="off"
                    />
                  </FormRow>
                </CForm>

                {/* Informasi tambahan jika ada */}
                {/* {validationData && validationState === 'success' && (
                  <div className="mt-4">
                    <h6 className="text-muted mb-3">Validation Details:</h6>
                    <div className="border rounded p-3">
                      {validationData.productName && (
                        <FormRow label="Product Name">
                          <div className="fw-semibold">{validationData.productName}</div>
                        </FormRow>
                      )}
                      {validationData.batch && (
                        <FormRow label="Batch">
                          <div className="fw-semibold">{validationData.batch}</div>
                        </FormRow>
                      )}
                      {validationData.status && (
                        <FormRow label="Status">
                          <div className="fw-semibold">{validationData.status}</div>
                        </FormRow>
                      )}
                    </div>
                  </div>
                )} */}
              </CCardBody>
            </CCard>
          </CCol>

          {/* Kolom Kanan - Success/Error Card */}
          <CCol md={4} className="d-flex flex-column">
            {validationState === 'success' && (
              <SuccessCard
                serialNumber={validatedSerialNumber}
                message={validationMessage}
                additionalInfo={validationData?.additionalInfo}
              />
            )}

            {validationState === 'error' && (
              <ErrorCard serialNumber={validatedSerialNumber} message={validationMessage} />
            )}

            {/* Placeholder card jika belum ada scan */}
            {!validationState && (
              <CCard className="mb-4 h-100 d-flex flex-column">
                <CCardHeader>
                  <strong>Status</strong>
                </CCardHeader>
                <CCardBody className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
                  <div className="text-center text-muted">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <p>Scan serial for validation</p>
                  </div>
                </CCardBody>
              </CCard>
            )}
          </CCol>
        </CRow>
      </CCol>
    </CRow>
  )
}

export default ValidateAssemblySerial
