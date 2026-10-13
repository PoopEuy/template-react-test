import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  CRow,
  CCard,
  CCol,
  CCardBody,
  CCardHeader,
  CFormLabel,
  CFormInput,
  CButton,
  CForm,
  CFormTextarea,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBarcode,
  cilSettings,
  cilCheckCircle,
  cilNotes,
  cilInfo,
  cilWarning,
  cilTask,
} from '@coreui/icons'

import { backendQc, backendTracking } from '../../../api/axios'
import { toast } from 'react-toastify'
import StatusCard from '../../components/StatusCard'
import { useAuth } from '../../../context/AuthContext'
import '../../../scss/style.scss'

// Custom styles for RepairQc
const styles = {
  infoItem: {
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa',
    marginBottom: '12px',
    border: '1px solid #e9ecef',
    transition: 'all 0.2s ease',
  },
  infoLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6c757d',
    marginBottom: '4px',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#212529',
  },
}

const QcAqlSerial = () => {
  const { user } = useAuth()
  const { qcIdParams, qcPlaceParams } = useParams()
  const [productData, setProductData] = useState(null)
  const [qcName, setQcName] = useState([])
  const qcCodeSerial = qcIdParams
  const [formData, setFormData] = useState({ serialNumber: '', repairNotes: '' })
  const [isFormLocked, setIsFormLocked] = useState(false)
  const serialNumberInputRef = useRef(null)
  const repairNotesRef = useRef(null)
  const [repairInfo, setRepairInfo] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [errorSerialNumber, setErrorSerialNumber] = useState(null)
  const [successValidation, setSuccessValidation] = useState(null)
  const [existingNotes, setExistingNotes] = useState('') // Notes from database

  const resetStates = () => {
    setProductData(null)
    setRepairInfo(null)
    setFormData({ serialNumber: '', repairNotes: '' })
    setErrorMessage(null)
    setErrorSerialNumber(null)
    setSuccessValidation(null)
    setIsFormLocked(false)
    setExistingNotes('')
  }

  useEffect(() => {
    resetStates()
    serialNumberInputRef.current.focus()
    console.clear()
  }, [qcIdParams, qcPlaceParams])

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSerial = () => {
    console.log('Serial Number scanned:', formData.serialNumber)

    // Save serial number before reset
    const currentSerialNumber = formData.serialNumber

    // Clear all states and input field
    setProductData(null)
    setRepairInfo(null)
    setErrorMessage(null)
    setErrorSerialNumber(null)
    setSuccessValidation(null)
    setFormData({ serialNumber: '', repairNotes: '' })
    setExistingNotes('')

    // Call fetch validation serial
    fetchValidationSnumb(currentSerialNumber)
  }

  // Fetch validation serial number
  const fetchValidationSnumb = async (serialNumber) => {
    console.log('qcCodeSerial :', qcCodeSerial)
    try {
      const response = await backendQc.get('/validation', {
        params: {
          serial_number: serialNumber,
          qc_id: qcCodeSerial,
        },
      })

      if (response.data.valid === true) {
        setErrorMessage(null)
        setErrorSerialNumber(null)

        // Set success validation for success card
        setSuccessValidation({
          serialNumber: serialNumber,
          message: response.data.message ?? 'Serial number valid for repair',
        })

        setQcName(response.data.fail_qc_name)

        // Save repair mode info
        setRepairInfo({
          mode: response.data.mode,
          message: response.data.message,
          fail_qc_id: response.data.fail_qc_id,
          fail_qc_name: response.data.fail_qc_name,
        })

        // Save notes from database if available
        setExistingNotes(response.data.notes ?? '')

        fetchProduct(serialNumber)
      } else {
        const errorMsg = response.data.message ?? 'Serial number already scan'
        setErrorMessage(errorMsg)
        setErrorSerialNumber(serialNumber)
      }
    } catch (error) {
      console.log('ERROR')
      const errorMsg = error.response?.data?.message || 'Serial Number Validation Failed'
      setErrorMessage(errorMsg)
      setErrorSerialNumber(serialNumber)
    }
  }

  const fetchProduct = async (serialNumber) => {
    console.log('Fetching product data')
    try {
      const response = await backendTracking.get(`/serial/${serialNumber}`)

      if (response.data.success == true) {
        // toast.success(response.data.message || 'Serial number valid')
        setProductData(response.data.data)

        // Refill serial number in form
        setFormData((prev) => ({
          ...prev,
          serialNumber: serialNumber,
        }))

        // Lock serial number field after successful fetch
        setIsFormLocked(true)

        // Focus to repair notes after successful fetch
        setTimeout(() => {
          repairNotesRef.current?.focus()
        }, 100)

        const assemblyId = response.data.data.assembly_id
        console.log('assemblyId :', assemblyId)
      } else {
        const errorMsg = response.data.message || 'Failed to get product data'
        setErrorMessage(errorMsg)
        // Save serial number for error card display (input field remains empty)
        setErrorSerialNumber(serialNumber)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error getting product data'
      setErrorMessage(errorMsg)
      // Save serial number for error card display (input field remains empty)
      setErrorSerialNumber(serialNumber)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!productData?.serial_number) {
      const errorMsg = 'Serial number is required!'
      setErrorMessage(errorMsg)
      return
    }
    if (!user || !user.id || !user.username) {
      const errorMsg = 'User not found, please login again!'
      setErrorMessage(errorMsg)
      return
    }
    if (!qcName) {
      const errorMsg = 'QC Name is required!'
      setErrorMessage(errorMsg)
      return
    }
    if (!qcCodeSerial) {
      const errorMsg = 'QC ID is required!'
      setErrorMessage(errorMsg)
      return
    }

    if (!formData.repairNotes || formData.repairNotes.trim() === '') {
      const errorMsg = 'Repair notes is required!'
      setErrorMessage(errorMsg)
      return
    }

    const payload = {
      serial_number: productData.serial_number,
      inspector_by: user?.id,
      inspector_name: user?.username,
      qc_name: 'qc-repair-mode',
      qc_id: qcCodeSerial,
      qc_place: qcPlaceParams || 'Workshop Repair',
      tracking_id: productData.id,
      batch: productData.batch,
      notes: formData.repairNotes,
      fail_qc_id: repairInfo.fail_qc_id,
      fail_qc_name: repairInfo.fail_qc_name,
      result: "REPAIRED",
    }

    try {
      const res = await backendQc.post('/submit', payload)

      const qcStatus = res.data?.data?.qcStatus ?? ''
      const messageShow = (
        <span>
          {res.data?.message ?? ''}. QC Status :{' '}
          <span style={{ color: qcStatus.toUpperCase() === 'FAIL' ? 'red' : 'green' }}>
            {qcStatus}
          </span>
        </span>
      )

      toast.success(messageShow)
      setErrorMessage(null)
      serialNumberInputRef.current.focus()
    } catch (error) {
      console.error('QC submit error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to submit QC'
      setErrorMessage(errorMsg)
      const currentSerialNumber = productData?.serial_number || formData.serialNumber
      if (currentSerialNumber) {
        setErrorSerialNumber(currentSerialNumber)
      }
      return
    }

    // Clear all states only if submit is successful
    resetStates()
  }

  return (
    <CRow className="g-4">
      {/* Scan Serial Number Card */}
      <CCol lg={4} md={6}>
        <CCard className="h-100">
          <CCardHeader className="d-flex align-items-center gap-2">
            <CIcon icon={cilBarcode} />
            <strong>Scan & Input</strong>
              </CCardHeader>
              <CCardBody>
            {/* Product Name Badge */}
            <div className="text-center mb-4">
              <CBadge
                color={productData ? 'success' : 'secondary'}
                className="px-3 py-2"
                style={{ fontSize: '0.9rem' }}
              >
                {productData?.product?.name ?? 'No Product Selected'}
              </CBadge>
            </div>

            {/* Serial Number Input */}
            <div className="mb-4">
              <CFormLabel className="fw-semibold small text-uppercase">
                <CIcon icon={cilBarcode} size="sm" className="me-1" />
                Production Serial Number
              </CFormLabel>
                  <CFormInput
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSerial()
                      }
                    }}
                    ref={serialNumberInputRef}
                    disabled={isFormLocked}
                placeholder="Scan or enter serial number..."
                className="form-control-lg"
                style={{
                  border: isFormLocked ? '2px solid #2eb85c' : '1px solid #ced4da',
                }}
              />
            </div>

            {/* Notes from DB */}
            <div className="mb-4">
              <CFormLabel className="fw-semibold small text-uppercase">
                <CIcon icon={cilNotes} size="sm" className="me-1" />
                Previous Notes
              </CFormLabel>
              <CFormTextarea
                rows={3}
                value={existingNotes}
                readOnly
                disabled
                placeholder="Notes from database will appear here..."
                style={{
                  backgroundColor: '#ebedef',
                  resize: 'none',
                }}
              />
            </div>

            {/* Repair Notes */}
            <div>
              <CFormLabel className="fw-semibold small text-uppercase">
                <CIcon icon={cilTask} size="sm" className="me-1" />
                Repair Notes <span className="text-danger">*</span>
              </CFormLabel>
                  <CFormTextarea
                    rows={3}
                name="repairNotes"
                value={formData.repairNotes}
                    onChange={handleInput}
                placeholder="Describe the repair action taken..."
                ref={repairNotesRef}
                style={{
                  resize: 'none',
                }}
                  />
            </div>
              </CCardBody>
            </CCard>
          </CCol>

      {/* Detail Card */}
      <CCol lg={4} md={6}>
        <CCard className="h-100">
          <CCardHeader className="d-flex align-items-center gap-2">
            <CIcon icon={cilInfo} />
            <strong>Repair Details</strong>
              </CCardHeader>
              <CCardBody>
            {/* Item Code */}
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Item Code</div>
              <div style={styles.infoValue}>{productData?.code_item ?? '-'}</div>
            </div>

            {/* Mode, Fail QC ID, Fail QC Name in grid */}
            <CRow className="g-3 mb-3">
              <CCol xs={12}>
                <div style={styles.infoItem} className="mb-0">
                  <div style={styles.infoLabel}>Mode</div>
                  <div style={styles.infoValue}>
                    {repairInfo?.mode ? (
                      <CBadge color="warning" className="px-2 py-1">
                        {repairInfo.mode}
                      </CBadge>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
                  </CCol>
              <CCol xs={6}>
                <div style={styles.infoItem} className="mb-0">
                  <div style={styles.infoLabel}>Fail QC ID</div>
                  <div style={styles.infoValue}>{repairInfo?.fail_qc_id ?? '-'}</div>
                </div>
                  </CCol>
              <CCol xs={6}>
                <div style={styles.infoItem} className="mb-0">
                  <div style={styles.infoLabel}>Fail QC Name</div>
                  <div style={styles.infoValue}>{repairInfo?.fail_qc_name ?? '-'}</div>
                </div>
                  </CCol>
                </CRow>

            {/* Message Status */}
            {/* <div
              style={{
                ...styles.infoItem,
                backgroundColor: repairInfo?.message ? '#fff3cd' : '#f8f9fa',
                borderColor: repairInfo?.message ? '#f9b115' : '#e9ecef',
              }}
            >
              <div style={styles.infoLabel}>
                <CIcon icon={cilWarning} size="sm" className="me-1" />
                Message Status
              </div>
              <div style={{ ...styles.infoValue, fontSize: '0.9rem' }}>
                {repairInfo?.message ?? 'No message available'}
              </div>
            </div> */}
              </CCardBody>
            </CCard>
          </CCol>

      {/* Status Card */}
      <CCol lg={4} md={12}>
        <StatusCard
          errorMessage={errorMessage}
          errorSerialNumber={errorSerialNumber}
          successValidation={successValidation}
          waitingMessage="Scan serial number to start QC Repair"
          waitingTitle="Status"
        />
      </CCol>

      {/* Submit Repair Card */}
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex align-items-center gap-2">
            <CIcon icon={cilSettings} />
            <strong>Submit Repair</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              {productData && !errorMessage && formData.repairNotes?.trim() ? (
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted">Ready to submit repair for serial number : </span>
                    <strong>{productData?.serial_number}</strong>
                    </div>
                  <CButton type="submit" color="primary">
                    <CIcon icon={cilCheckCircle} className="me-2" />
                    Submit Repair
                  </CButton>
                </div>
              ) : productData && !errorMessage ? (
                <div className="text-center py-3">
                  <CIcon icon={cilTask} size="xl" className="text-warning mb-2" />
                  <p className="text-muted mb-0">Please fill in the repair notes to submit...</p>
                </div>
              ) : (
                <div className="text-center py-3">
                  <CIcon icon={cilBarcode} size="xl" className="text-muted mb-2" />
                  <p className="text-muted mb-0">Scan serial number to start repair...</p>
                </div>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default QcAqlSerial
