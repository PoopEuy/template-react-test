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
  CFormTextarea,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

const ScanDelivery = () => {
  const [formData, setFormData] = useState({
    doCode: '',
    customer: '',
    packBarcode: '',
    totalProduct: 100,
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
      `DO Code: ${formData.doCode}\nCustomer: ${formData.customer}\npackBarcode: ${formData.packBarcode}\ntotalProduct: ${formData.totalProduct}`,
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Scan Delivery</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              {/*Box Barcode */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="doCode" className="col-sm-2 col-form-label">
                  DO Code
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="text"
                    id="doCode"
                    name="doCode"
                    value={formData.doCode}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>

              {/* Customer */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="customer" className="col-sm-2 col-form-label">
                  Customer
                </CFormLabel>
                <CCol sm={10}>
                  <CFormSelect
                    id="customer"
                    name="customer"
                    value={formData.customer}
                    onChange={handleChange}
                    required
                  >
                    <option value="test">Select Customer</option>
                  </CFormSelect>
                </CCol>
              </CRow>

              {/* Packing Barcode */}
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

              {/* Total Product */}
              <CRow className="mb-3">
                <CFormLabel htmlFor="totalProduct" className="col-sm-2 col-form-label">
                  Total Product
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput
                    type="number"
                    id="totalProduct"
                    name="totalProduct"
                    value={formData.totalProduct}
                    onChange={handleChange}
                    required
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

export default ScanDelivery
