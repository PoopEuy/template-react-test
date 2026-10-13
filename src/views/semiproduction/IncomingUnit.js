/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
} from '@coreui/react'

const IncomingUnit = () => {
  const [formData, setFormData] = useState({ sapcode: '', barcode: '', batch: '' })
  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value, // Handle file input
    }))
  }
  const handleSubmit = (e) => {
    // e.preventDefault()
    console.log('Form Data:', formData)
    alert(`
      SAP Code: ${formData.sapcode}
      Barcode: ${formData.barcode}
      Incoming Batch: ${formData.batch}
    `)
  }
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Scan Incoming Semi Product</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
            {/* SAP Code */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="sapcode" className="col-sm-2 col-form-label">
                  SAP Code
                </CFormLabel>
                <CCol sm={10}>
                  <CFormSelect
                    id="sapcode"
                    name="sapcode"
                    aria-label="Select SAP Code"
                    value={formData.sapcode}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select SAP Code</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                  </CFormSelect>
                </CCol>
              </CRow>

              {/* Barcode */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="barcode" className="col-sm-2 col-form-label">
                  Barcode
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="barcode"
                    name="barcode"
                    placeholder="Scan Barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>

              {/* Incoming Batch */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="batch" className="col-sm-2 col-form-label">
                  Incoming Batch
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="number"
                    id="batch"
                    name="batch"
                    placeholder="Input Batch"
                    value={formData.batch}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>

              {/* Submit */}
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <CButton color="primary" type="submit">
                  Submit
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default IncomingUnit
