import React, { useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CFormLabel,
  CFormInput,
  CButton,
  CForm,
  CFormTextarea,
  CFormSwitch,
} from '@coreui/react'

import { CounterCard6 } from '../components/CounterCard'
import ErrorCard from '../components/ErrorCard'
import SuccessCard from '../components/SuccessCard'
import '../../scss/style.scss'

const FormRow = ({ label, children }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={4}>
      <CFormLabel className="fw-semibold">{label}</CFormLabel>
    </CCol>
    <CCol md={8}>{children}</CCol>
  </CRow>
)

const QcSerialNoAql = () => {
  const { qcPlaceParams } = useParams()
  const productData = null
  const trackingProduct = null
  const answers = {}
  const questionData = []
  const formData = { serialNumber: '', notes: '' }
  const isFormLocked = false
  const serialNumberInputRef = useRef(null)
  const errorMessage = null
  const errorSerialNumber = null
  const successValidation = null

  // Ambil user dari localStorage
  const getUserFromStorage = () => {
    try {
      const userString = localStorage.getItem('user')
      if (userString) {
        return JSON.parse(userString)
      }
      return null
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
      return null
    }
  }

  const user = getUserFromStorage()
  console.log('username : ', user.name)

  if (!user || !user.id || !user.name) {
    const errorMsg = 'User tidak ditemukan di localStorage!'
    setErrorMessage(errorMsg)
    // toast.error(errorMsg)
    return
  }

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CRow className="g-4 align-items-stretch">
          {/* Kolom Kiri - Scan Serial + Quality Control */}
          <CCol md={8}>
            {/* Scan Serial Number */}
            <CCard className="mb-4">
              <CCardHeader>
                <strong>Product Name : {productData?.product?.name ?? '-'}</strong>
                <div className="small text-muted">{qcPlaceParams}</div>
              </CCardHeader>
              <CCardBody>
                <FormRow label="Production Serial Number">
                  <CFormInput
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInput}
                    ref={serialNumberInputRef}
                    disabled={isFormLocked}
                  />
                </FormRow>
                <FormRow label="Notes">
                  <CFormTextarea
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInput}
                  />
                </FormRow>
              </CCardBody>
            </CCard>

            {/* Quality Control */}
            <CCard>
              <CCardHeader>
                <strong>Quality Control</strong>
              </CCardHeader>
              <CCardBody>
                <CForm>
                  {questionData.length === 0 ? (
                    <p className="text-muted">Questions not yet available...</p>
                  ) : (
                    questionData.map((q) => (
                      <div
                        key={q.id}
                        className="border rounded p-3 mb-3 d-flex align-items-center justify-content-between"
                      >
                        <CFormLabel className="mb-0">{q.question}</CFormLabel>
                        <CFormSwitch
                          name={`question-${q.id}`}
                          label={answers[q.id] ? 'Ya' : 'Tidak'}
                          checked={!!answers[q.id]}
                          onChange={() => {}}
                        />
                      </div>
                    ))
                  )}
                  {questionData.length > 0 && !errorMessage && (
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <CButton color="primary" type="submit">
                        Submit
                      </CButton>
                    </div>
                  )}
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>

          {/* Kolom Kanan - Success Card + Counter atau Error */}
          <CCol md={4} className="d-flex flex-column">
            {errorMessage ? (
              <ErrorCard
                serialNumber={errorSerialNumber}
                message={errorMessage}
                fullHeight={true}
              />
            ) : (
              <div className="h-100 d-flex flex-column">
                {/* Counter Card */}
                <CCard className={`d-flex flex-column ${successValidation ? 'mb-4' : 'h-100'}`}>
                  <CCardHeader>
                    <strong>Counter</strong>
                  </CCardHeader>
                  <CCardBody
                    className={`${!successValidation ? 'd-flex flex-column justify-content-center flex-grow-1' : ''}`}
                  >
                    <CRow className="mb-3">
                      <CounterCard6
                        title="Required Quantity"
                        value={trackingProduct?.quantity_summary?.total_quantity ?? `-`}
                      />
                      <CounterCard6
                        title="Remaining Quantity"
                        value={trackingProduct?.quantity_summary?.remaining_quantity ?? `-`}
                      />
                      <CounterCard6
                        title="Pass Quantity"
                        value={trackingProduct?.quantity_summary?.pass_quantity ?? `-`}
                      />
                      <CounterCard6
                        title="Fail Quantity"
                        value={trackingProduct?.quantity_summary?.fail_quantity ?? `-`}
                      />
                    </CRow>
                  </CCardBody>
                </CCard>

                {/* Success Card */}
                {successValidation && (
                  <div className="flex-grow-1">
                    <SuccessCard
                      serialNumber={successValidation.serialNumber}
                      message={successValidation.message}
                      fullHeight={true}
                    />
                  </div>
                )}
              </div>
            )}
          </CCol>
        </CRow>
      </CCol>
    </CRow>
  )
}

export default QcSerialNoAql
