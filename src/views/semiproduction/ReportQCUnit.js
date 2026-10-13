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

const ReportQCUnit = () => {
  const [formData, setFormData] = useState({
    sapCode: 'SAP-123456',
    partName: 'PCB Controller',
    sampleQty: 20,
    totalAccept: 18,
    totalReject: 2,
    uploadForm: null,
    rejectImage1: null,
    rejectImage2: null,
  })

  const handleChange = (e) => {
    const { name, type, files, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Report QC Submitted:', formData)
    alert('Form submitted! Check console for data.')
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Report QC Semi Product</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              {/* SAP Code */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="sapCode" className="col-sm-2 col-form-label">
                  SAP Code
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput type="text" id="sapCode" value={formData.sapCode} readOnly />
                </CCol>
              </CRow>

              {/* Part Name */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="partName" className="col-sm-2 col-form-label">
                  Part Name
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput type="text" id="partName" value={formData.partName} readOnly />
                </CCol>
              </CRow>

              {/* Sample Quantity */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="sampleQty" className="col-sm-2 col-form-label">
                  Sample Quantity
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput type="number" id="sampleQty" value={formData.sampleQty} readOnly />
                </CCol>
              </CRow>

              {/* Upload Form */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="uploadForm" className="col-sm-2 col-form-label">
                  Upload Form
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="file"
                    id="uploadForm"
                    name="uploadForm"
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>

              {/* Total Accept */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="totalAccept" className="col-sm-2 col-form-label">
                  Total Accept
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="number"
                    id="totalAccept"
                    value={formData.totalAccept}
                    readOnly
                  />
                </CCol>
              </CRow>

              {/* Total Reject */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="totalReject" className="col-sm-2 col-form-label">
                  Total Reject
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="number"
                    id="totalReject"
                    value={formData.totalReject}
                    readOnly
                  />
                </CCol>
              </CRow>

              {/* Reject Picture Section */}
              <CFormLabel className="col-form-label">
                <strong>Reject Picture</strong>
              </CFormLabel>

              {/* Reject Image 1 */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="rejectImage1" className="col-sm-2 col-form-label">
                  Upload Image 1
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="file"
                    id="rejectImage1"
                    name="rejectImage1"
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>

              {/* Reject Image 2 */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="rejectImage2" className="col-sm-2 col-form-label">
                  Upload Image 2
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="file"
                    id="rejectImage2"
                    name="rejectImage2"
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>

              {/* Submit Button */}
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

export default ReportQCUnit
