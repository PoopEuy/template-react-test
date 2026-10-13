import React from 'react'
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
  CModal,
  CModalBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX } from '@coreui/icons'
import Select from 'react-select'

const ShippingHeaderBase = () => {
  return (
    <CRow>
      <CCol md={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Request Shipping Order</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <FormRow label="Reference Delivery Order">
                <CFormInput name="reference_do" placeholder="Delivery Order" />
              </FormRow>

              <FormRow label="Reference Purchase Order">
                <CFormInput name="reference_po" placeholder="Purchase Order" />
              </FormRow>

              <FormRow label="Delivery Date">
                <CFormInput type="date" name="delivery_date" required />
              </FormRow>

              <FormRow label="Delivery Batch">
                <CFormInput type="text" name="delivery_batch" required />
              </FormRow>

              <FormRow label="Note">
                <CFormTextarea rows={3} name="notes" placeholder="Enter notes" />
              </FormRow>

              <CFormLabel className="fw-bold mt-3">List of Product</CFormLabel>
              <br />
              <div className="d-flex gap-2 mb-2">
                <CButton color="primary" type="button">
                  + Add Product
                </CButton>
                <CButton color="success" type="button" className="text-white">
                  + Add All Products
                </CButton>
              </div>

              {/* TABLE VIEW (desktop/tablet) */}
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>SAP Code</th>
                    <th>Product Type</th>
                    <th>Serialize</th>
                    <th>Order Qty</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {/* contoh dummy 1 baris */}
                  <tr>
                    <td>1</td>
                    <td style={{ minWidth: '180px' }}>
                      <Select placeholder="Select Product" isClearable />
                    </td>
                    <td>
                      <CFormInput value="-" readOnly />
                    </td>
                    <td>
                      <CFormInput value="False" readOnly />
                    </td>
                    <td>
                      <CFormInput type="number" min={0} placeholder="Qty" />
                    </td>
                    <td className="text-center align-middle">
                      <div className="d-flex justify-content-center align-items-center">
                        <CButton
                          color="danger"
                          size="sm"
                          className="d-flex align-items-center justify-content-center p-0"
                          style={{ width: '28px', height: '28px' }}
                        >
                          <CIcon
                            icon={cilX}
                            size="sm"
                            className="text-white"
                            style={{ strokeWidth: 5 }}
                          />
                        </CButton>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* MODAL TEMPLATE */}
              <CModal visible={false} alignment="center">
                <CModalBody>
                  <Select placeholder="Select Product" isClearable />
                </CModalBody>
              </CModal>

              <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
                <CButton color="primary" type="submit">
                  Save
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

const FormRow = ({ label, children }) => (
  <CRow className="mb-3">
    <CFormLabel className="col-sm-3 col-form-label">{label}</CFormLabel>
    <CCol sm={9}>{children}</CCol>
  </CRow>
)

export default ShippingHeaderBase
