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
  CRow,
} from '@coreui/react'

const ScanBeforePacking = () => {
  const [formData, setFormData] = useState({
    barcode: '',
    boxBarcode: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Scan Submitted:', formData)
    alert(`Barcode: ${formData.barcode}\nBox Barcode: ${formData.boxBarcode}`)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Scan Packing 1</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
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
                    value={formData.barcode}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>

              {/* Box Barcode */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="boxBarcode" className="col-sm-2 col-form-label">
                  Box Barcode
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="boxBarcode"
                    name="boxBarcode"
                    value={formData.boxBarcode}
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

export default ScanBeforePacking
