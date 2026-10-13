import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CButton,
  CFormTextarea,
  CFormCheck,
} from '@coreui/react'
import { backendAssembly } from '../../api/axios'
import { toast } from 'react-toastify'
import Select from 'react-select'

const FormRow = ({ label, children }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={4}>
      <CFormLabel className="fw-semibold">{label}</CFormLabel>
    </CCol>
    <CCol md={8}>{children}</CCol>
  </CRow>
)

const AssemblyOrders = () => {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState({})
  const [formData, setFormData] = useState({
    notes: '',
    status: '',
  })
  const [showSubmit, setShowSubmit] = useState(true)
  const TOAST_ID = 'stock-warning'

  useEffect(() => {
    fetchOrders()
  }, [])

  // setiap kali order berubah, cek stock vs remaining
  useEffect(() => {
    if (!selectedOrder) return

    const statusOrder = selectedOrder?.status?.toLowerCase()
    if (statusOrder === 'completed') {
      setShowSubmit(false)
      toast.dismiss(TOAST_ID)
      return
    }

    const init = {}
    const insufficient = []

    selectedOrder.assembly_order_items?.forEach((item) => {
      const remaining = Number(item.qty_remaining ?? 0)
      const stock = Number(item.quantity_stok ?? 0)

      if (item.required) {
        if (remaining > 0 && stock < remaining) {
          init[item.id] = { checked: true, qty: stock }
          insufficient.push(`${item.product_name} (Available: ${stock} < Remaining: ${remaining})`)
        } else {
          init[item.id] = { checked: true, qty: remaining }
        }
      } else {
        init[item.id] = { checked: false, qty: 0 }
      }
    })

    setSelectedItems(init)

    if (insufficient.length > 0) {
      if (toast.isActive(TOAST_ID)) {
        toast.update(TOAST_ID, {
          render: `INSUFFICIENT STOCK:\n- ${insufficient.join('\n- ')}`,
          autoClose: 10000,
        })
      } else {
        toast.error(`INSUFFICIENT STOCK:\n- ${insufficient.join('\n- ')}`, {
          toastId: TOAST_ID,
          autoClose: 10000,
        })
      }
      setShowSubmit(false)
    } else {
      toast.dismiss(TOAST_ID)
      setShowSubmit(true)
    }
  }, [selectedOrder])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await backendAssembly.get('/assembly-orders')
      setOrders(response.data.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderData = (orderId) => {
    const order = orders.find((o) => o.id === Number(orderId))
    setSelectedOrder(order || null)
    setSelectedItems({})
    setFormData((prev) => ({
      ...prev,
      status: order?.status || '',
      notes: '',
    }))
  }

  const handleInput = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleOrderConfirmation = async () => {
    try {
      if (!selectedOrder) return

      const payload = {
        assembly_order_id: selectedOrder.id,
        status: formData.status,
        confirmed_by: 1,
        note: formData.notes || '',
      }

      const response = await backendAssembly.post('/assembly-order-confirmations', payload)
      if (response.data.success === true) {
        setSelectedOrder((prev) => ({
          ...prev,
          status: 'in_progress',
        }))
        toast.success(response.data?.message || 'SUCCESS')
      } else {
        toast.error('FAILED CONFIRM ORDER!!')
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'FAILED TO ORDER CONFIRMATION')
    }
  }

  const handleSubmit = async () => {
    try {
      if (!selectedOrder) return

      const confirmations = Object.entries(selectedItems)
        .filter(([_, item]) => item.checked && item.qty > 0)
        .map(([id, item]) => {
          const orderItem = selectedOrder.assembly_order_items.find((i) => i.id === Number(id))
          return {
            request_order_item_id: orderItem.id,
            product_id: orderItem.product_id,
            qty_confirmed: item.qty,
            note: formData.notes || '',
          }
        })

      const payload = {
        assembly_order_id: selectedOrder.id,
        confirmed_by: 1,
        confirmations,
      }

      const response = await backendAssembly.post(
        '/assembly-order-items-confirmations/batch',
        payload,
      )

      if (response.data.success) {
        toast.success(response.data?.message || 'SUCCESS CONFIRM ORDER')
        // refresh order detail
        const res = await backendAssembly.get(`/assembly-orders/${selectedOrder.id}`)
        if (res.data.success) {
          setSelectedOrder(res.data.data)
          setSelectedItems({})
        }
      } else {
        toast.error('FAILED CONFIRM ORDER!!')
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'FAILED TO CONFIRM ORDER')
    }
  }

  return (
    <CCard>
      <CCardHeader>Assembly Order Confirmation</CCardHeader>
      <CCardBody>
        {loading ? (
          <CSpinner />
        ) : (
          <>
            <FormRow label="Assembly Order">
              <Select
                options={orders.map((o) => ({ value: o.id, label: o.order_number }))}
                onChange={(selected) => fetchOrderData(selected.value)}
                isClearable
                placeholder="-- Select Order --"
              />
            </FormRow>

            <FormRow label="Product Name">
              <CFormInput value={selectedOrder?.product_name || ''} disabled />
            </FormRow>

            <FormRow label="Quantity">
              <CFormInput value={selectedOrder?.quantity || ''} disabled />
            </FormRow>

            <FormRow label="Status">
              <CFormSelect
                name="status"
                value={formData.status}
                onChange={handleInput}
                disabled={!selectedOrder || selectedOrder.status !== 'pending'}
              >
                <option value="">-- Select Status --</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="failed">Reject</option>
                <option value="partial">Partial</option>
                <option value="completed">Completed</option>
              </CFormSelect>
            </FormRow>

            <FormRow label="Notes">
              <CFormTextarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInput}
                disabled={!selectedOrder || formData.status !== 'pending'}
              />
            </FormRow>

            {selectedOrder?.status === 'pending' && (
              <div className="d-flex justify-content-end mt-3">
                <CButton
                  color="success"
                  className="me-2 text-white"
                  onClick={handleOrderConfirmation}
                >
                  Order Confirmation
                </CButton>
              </div>
            )}

            <div className="mt-4">
              <h6 className="fw-bold mb-3">Order Details</h6>
              <CTable
                bordered
                striped
                hover
                responsive
                small
                align="middle"
                className="text-center"
              >
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell className="text-start ps-3">Select</CTableHeaderCell>
                    <CTableHeaderCell className="text-start ps-3">Product Name</CTableHeaderCell>
                    <CTableHeaderCell>Qty Request</CTableHeaderCell>
                    <CTableHeaderCell>Confirmed</CTableHeaderCell>
                    <CTableHeaderCell>Remaining Req</CTableHeaderCell>
                    <CTableHeaderCell>Stock</CTableHeaderCell>
                    <CTableHeaderCell>Confirm Qty</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {!selectedOrder ? (
                    <CTableRow>
                      <CTableDataCell colSpan={7} className="text-center text-muted">
                        Order not selected
                      </CTableDataCell>
                    </CTableRow>
                  ) : selectedOrder.assembly_order_items?.length > 0 ? (
                    [...selectedOrder.assembly_order_items]
                      .sort((a, b) => a.product_name.localeCompare(b.product_name))
                      .map((item) => {
                        const remaining = Number(item.qty_remaining ?? 0)
                        const stock = Number(item.quantity_stok ?? 0)
                        const maxAllowed = Math.min(remaining, stock)

                        return (
                          <CTableRow key={item.id}>
                            <CTableDataCell>
                              <CFormCheck
                                checked={item.required ? true : !!selectedItems[item.id]?.checked}
                                disabled={
                                  item.required ||
                                  selectedOrder.status === 'pending' ||
                                  selectedOrder.status === 'failed' ||
                                  remaining === 0 ||
                                  stock === 0
                                }
                                onChange={(e) =>
                                  setSelectedItems((prev) => ({
                                    ...prev,
                                    [item.id]: {
                                      ...prev[item.id],
                                      checked: item.required ? true : e.target.checked,
                                      qty: e.target.checked ? prev[item.id]?.qty || 0 : 0,
                                    },
                                  }))
                                }
                              />
                            </CTableDataCell>

                            <CTableDataCell className="fw-medium text-start ps-3">
                              {item.product_name}
                            </CTableDataCell>

                            <CTableDataCell>{item.qty_request}</CTableDataCell>
                            <CTableDataCell className="text-success fw-semibold">
                              {item.qty_fulfilled}
                            </CTableDataCell>
                            <CTableDataCell className="text-danger fw-semibold">
                              {remaining}
                            </CTableDataCell>
                            <CTableDataCell className="fw-semibold">{stock}</CTableDataCell>

                            <CTableDataCell>
                              <input
                                type="number"
                                className="form-control text-center"
                                min={0}
                                max={String(maxAllowed)}
                                value={selectedItems[item.id]?.qty || ''}
                                disabled={
                                  item.required ||
                                  !selectedItems[item.id]?.checked ||
                                  selectedOrder.status === 'pending' ||
                                  selectedOrder.status === 'failed' ||
                                  remaining === 0 ||
                                  stock <= 0
                                }
                                onChange={(e) => {
                                  let value = Number(e.target.value.replace(/\D/g, '')) || 0
                                  if (value > remaining) value = remaining
                                  if (value > stock) value = stock
                                  setSelectedItems((prev) => ({
                                    ...prev,
                                    [item.id]: {
                                      ...prev[item.id],
                                      checked: true,
                                      qty: value,
                                    },
                                  }))
                                }}
                              />
                            </CTableDataCell>
                          </CTableRow>
                        )
                      })
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={7} className="text-center text-muted">
                        No data available
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>

              {selectedOrder &&
                selectedOrder.status !== 'pending' &&
                selectedOrder.status !== 'failed' &&
                showSubmit && (
                  <div className="d-flex justify-content-end mt-3">
                    <CButton color="primary" onClick={handleSubmit}>
                      Submit Product Confirmation
                    </CButton>
                  </div>
                )}
            </div>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default AssemblyOrders
