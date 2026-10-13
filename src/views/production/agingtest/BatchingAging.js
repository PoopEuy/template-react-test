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

const BatchingAging = () => {
  const [formData, setFormData] = useState({
    productionBatch: '10',
    agingBatch: '',
    totalQuantity: '',
    sampleQuantity: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const sampleQty = formData.totalQuantity ? Math.ceil(Number(formData.totalQuantity) * 0.1) : ''

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Scan After Assemble:', formData)
    alert(
      `Production Batch: ${formData.productionBatch}\nAging Batch: ${formData.agingBatch}\nTotal Quantity: ${formData.totalQuantity}\nSample Quantity: ${sampleQty}`,
    )
    // Tambahkan logic kirim ke backend jika perlu
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Batching Aging Test</strong>
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
                    readOnly
                  />
                </CCol>
              </CRow>

              {/* Aging Batch */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="FormBatchAgingInput" className="col-sm-2 col-form-label">
                  Aging Batch
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="number"
                    id="FormBatchAgingInput"
                    name="agingBatch"
                    value={formData.agingBatch}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>

              {/* Total Quantity */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="totalQuantity" className="col-sm-2 col-form-label">
                  Total Quantity
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="number"
                    id="totalQuantity"
                    name="totalQuantity"
                    value={formData.totalQuantity}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>

              {/* Sample Quantity */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="sampleQty" className="col-sm-2 col-form-label">
                  Sample Quantity
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="number"
                    id="sampleQty"
                    name="sampleQty"
                    value={sampleQty}
                    readOnly
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

export default BatchingAging
