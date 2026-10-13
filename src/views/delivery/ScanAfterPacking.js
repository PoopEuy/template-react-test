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
  CFormTextarea,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

const ScanAfterPacking = () => {
  const [formData, setFormData] = useState({
    boxBarcode: '',
    packBarcode: '',
    desc: 'this is desciption',
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
    alert(
      `Box Barcode: ${formData.boxBarcode}\nPack Barcode: ${formData.packBarcode}\nDescription: ${formData.desc}`,
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Scan Packing 2</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              {/* Barcode */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="barcode" className="col-sm-2 col-form-label">
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

              {/* Production Batch */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="packBarcode" className="col-sm-2 col-form-label">
                  Packing Barcode
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="packBarcode"
                    name="packBarcode"
                    value={formData.packBarcode}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>

              {/* Aging Batch */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="desc" className="col-sm-2 col-form-label">
                  Box Description
                </CFormLabel>
                <CCol sm={10}>
                  <CFormTextarea
                    id="desc"
                    name="desc"
                    value={formData.desc}
                    onChange={handleChange}
                    readOnly
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
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Heading</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow>
                    <CTableHeaderCell scope="row">1</CTableHeaderCell>
                    <CTableDataCell>Mark</CTableDataCell>
                    <CTableDataCell>Otto</CTableDataCell>
                    <CTableDataCell>@mdo</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell scope="row">2</CTableHeaderCell>
                    <CTableDataCell>Jacob</CTableDataCell>
                    <CTableDataCell>Thornton</CTableDataCell>
                    <CTableDataCell>@fat</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell scope="row">3</CTableHeaderCell>
                    <CTableDataCell colSpan={2}>Larry the Bird</CTableDataCell>
                    <CTableDataCell>@twitter</CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ScanAfterPacking
