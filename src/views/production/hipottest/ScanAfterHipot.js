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

const ScanAfterHipot = () => {
  const [formData, setFormData] = useState({
    barcode: '',
    productionBatch: '10', // bisa diisi otomatis jika diperlukan
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
    console.log('Scan After Assemble:', formData)
    alert(`Barcode: ${formData.barcode}\nProduction Batch: ${formData.productionBatch}`)
    // Tambahkan logic kirim ke backend jika perlu
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Scan After Hipot Test</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CFormLabel htmlFor="FormBarcodeInput" className="col-sm-2 col-form-label">
                  Barcode
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="FormBarcodeInput"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CFormLabel htmlFor="FormBatchProductionInput" className="col-sm-2 col-form-label">
                  Production Batch
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="FormBatchProductionInput"
                    name="productionBatch"
                    value={formData.productionBatch}
                    readOnly
                  />
                </CCol>
              </CRow>

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

export default ScanAfterHipot
