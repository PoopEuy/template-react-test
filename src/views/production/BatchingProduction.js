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

const BatchingProduction = () => {
  const [formData, setFormData] = useState({
    productionBatch: '',
    totalUnit: '',
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
    console.log('Batching Production Submitted:', formData)
    alert(`Production Batch: ${formData.productionBatch}\nTotal Unit: ${formData.totalUnit}`)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Batch Product</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              {/* Production Batch */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="FormBatchProductionInput" className="col-sm-2 col-form-label">
                  Production Batch
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="number"
                    id="FormBatchProductionInput"
                    name="productionBatch"
                    value={formData.productionBatch}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>

              {/* Total Unit */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="FormTotalUnitInput" className="col-sm-2 col-form-label">
                  Total Unit
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="number"
                    id="FormTotalUnitInput"
                    name="totalUnit"
                    value={formData.totalUnit}
                    onChange={handleChange}
                    required
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

export default BatchingProduction
