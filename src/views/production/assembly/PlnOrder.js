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
  CSpinner,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { backendAssembly } from '../../../api/axios'

const FormRow = ({ label, children }) => (
  <CRow className="mb-3">
    <CFormLabel className="col-sm-3 col-form-label">{label}</CFormLabel>
    <CCol sm={9}>{children}</CCol>
  </CRow>
)

const PlnOrderForm = () => {
  const [formData, setFormData] = useState({
    order_number: '',
    order_date: '',
    deadline: '',
    quantity: 1,
  })
  const [loadingSubmit, setLoadingSubmit] = useState(false)

  const handleInput = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.order_number || !formData.order_date || !formData.deadline) {
      toast.warn('Please fill all fields correctly.')
      return
    }

    setLoadingSubmit(true)
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
      }

      // console.log(' payload :', payload)
      const res = await backendAssembly.post('/pln-orders', payload)
      toast.success(res.data?.message || 'PLN Order created successfully!')

      // reset form (opsional)
      setFormData({
        order_number: '',
        order_date: '',
        deadline: '',
        quantity: 1,
      })
    } catch (err) {
      console.error('Submit error:', err)
      toast.error(err.response?.data?.message || 'Failed to create PLN order.')
    } finally {
      setLoadingSubmit(false)
    }
  }

  return (
    <CRow>
      <CCol md={8} className="mx-auto">
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Create PLN Order</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <FormRow label="Order Number">
                <CFormInput
                  type="text"
                  name="order_number"
                  value={formData.order_number}
                  onChange={handleInput}
                  placeholder="PLN-2024-001"
                  required
                />
              </FormRow>

              <FormRow label="Order Date">
                <CFormInput
                  type="date"
                  name="order_date"
                  value={formData.order_date}
                  onChange={handleInput}
                  required
                />
              </FormRow>

              <FormRow label="Deadline">
                <CFormInput
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInput}
                  required
                />
              </FormRow>

              <FormRow label="Quantity">
                <CFormInput
                  type="number"
                  min={1}
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInput}
                  required
                />
              </FormRow>

              <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
                <CButton color="primary" type="submit" disabled={loadingSubmit}>
                  {loadingSubmit ? (
                    <>
                      <CSpinner size="sm" /> Saving…
                    </>
                  ) : (
                    'Save'
                  )}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default PlnOrderForm
