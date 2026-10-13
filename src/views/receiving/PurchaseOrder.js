import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { backendReceiving } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

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
  CSpinner,
} from '@coreui/react'

const getTodayJakarta = () => {
  const now = new Date()
  const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  return jakartaTime.toISOString().split('T')[0]
}

const ReceivingHeader = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    po_number: '',
    order_date: getTodayJakarta(),
    notes: '',
  })

  const [loading, setLoading] = useState(false)

  const handleInput = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    //login validation
    if (!user?.id || !user?.username) {
      toast.error('You must be logged in to submit a Purchase Order.')
      setTimeout(() => navigate('/login'), 1500)
      return
    }

    setLoading(true)

    const payload = {
      po_number: formData.po_number,
      order_date: formData.order_date,
      notes: formData.notes,
      user_id: user?.id,
    }

    // console.log('payload :', payload)

    try {
      const response = await backendReceiving.post('/purchase-orders', payload)
      console.log('Success:', response.data)
      toast.success('Purchase Order submitted successfully!')
      setFormData({
        po_number: '',
        order_date: getTodayJakarta(),
        notes: '',
      })
    } catch (error) {
      console.error('Error submitting PO:', error)
      const errorMessage =
        error.response?.data?.message || 'Failed to submit PO. See console for details.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow>
      <CCol md={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Create Purchase Order</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <FormRow label="PO Number">
                <CFormInput
                  name="po_number"
                  value={formData.po_number}
                  onChange={handleInput}
                  placeholder="Enter PO Number"
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

              <FormRow label="Notes">
                <CFormTextarea
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInput}
                  placeholder="Write any additional notes"
                />
              </FormRow>

              <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
                <CButton color="primary" type="submit" disabled={loading}>
                  {loading ? (
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

const FormRow = ({ label, children }) => (
  <CRow className="mb-3">
    <CFormLabel className="col-sm-3 col-form-label">{label}</CFormLabel>
    <CCol sm={9}>{children}</CCol>
  </CRow>
)

export default ReceivingHeader
