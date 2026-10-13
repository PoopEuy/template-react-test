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
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { backendAssembly, backendWhNew } from '../../api/axios'
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
  const [stockData, setStockData] = useState({})
  const [formData, setFormData] = useState({
    notes: '',
  })
  const [showSubmit, setShowSubmit] = useState(true)

  const [scanningItem, setScanningItem] = useState(null)
  const [serialForm, setSerialForm] = useState({ serialNumber: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const TOAST_ID = 'stock-warning'

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    if (!selectedOrder) return

    const statusOrder = selectedOrder?.status?.toLowerCase()

    // completed selalu prioritas
    if (statusOrder === 'completed') {
      setShowSubmit(false)
      toast.dismiss(TOAST_ID)
      return
    }

    if (!stockData || Object.keys(stockData).length === 0) return

    const init = {}
    const insufficient = []

    selectedOrder.assembly_order_items?.forEach((item) => {
      const remaining = Number(item.qty_remaining ?? 0)
      const stock = Number(stockData[item.product_id] ?? 0)

      if (item.required) {
        if (remaining > 0 && stock < remaining) {
          init[item.id] = { checked: true, qty: stock }
          insufficient.push(
            `${item.product_name} (Available Stock: ${stock} < Remaining Qty: ${remaining})`,
          )
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
          render: `INSUFFICIENT STOCK FOR ${insufficient.length} item(s):\n- ${insufficient.join(
            '\n- ',
          )}`,
          autoClose: 10000,
          closeOnClick: true,
          pauseOnHover: true,
        })
      } else {
        toast.error(
          `INSUFFICIENT STOCK FOR ${insufficient.length} item(s):\n- ${insufficient.join('\n- ')}`,
          { toastId: TOAST_ID, autoClose: 10000, closeOnClick: true, pauseOnHover: true },
        )
      }
      setShowSubmit(false)
    } else {
      toast.dismiss(TOAST_ID)
      setShowSubmit(true)
    }
  }, [selectedOrder, stockData])

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

  // Fungsi reusable untuk fetch order & stock
  const fetchOrderData = async (orderId) => {
    const order = orders.find((o) => o.id === Number(orderId))
    setSelectedOrder(order || null)
    setSelectedItems({})

    const statusOrder = order?.status?.toLowerCase()
    if (statusOrder === 'completed') {
      setShowSubmit(false)
      return // stop biar tidak ditimpa logic stock
    } else {
      setFormData((prev) => ({
        ...prev,
        status: order?.status || '',
        notes: '',
      }))

      if (order && order.assembly_order_items?.length > 0) {
        const productIds = order.assembly_order_items.map((i) => i.product_id)

        try {
          const res = await backendWhNew.post('/stock-units/stock-by-multiple-products', {
            product_ids: productIds,
            warehouse_id: 1, // sesuaikan warehouse
            include_zero_stock: true,
          })

          if (res.data.success) {
            const map = {}
            res.data.data.stock_by_product.forEach((s) => {
              map[s.product_id] = s.total_quantity
            })
            setStockData(map)
          }
        } catch (err) {
          console.error('Failed fetch stock', err)
        }
      } else {
        setStockData({})
      }
    }
  }

  // Untuk dipanggil di onChange select
  const handleOrderChange = (e) => {
    fetchOrderData(e.target.value)
  }

  const handleInput = (e) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) || 0 : value,
    }))

    //jika ingin checklist aktif berdasarkan select status
    // setSelectedOrder((prev) => ({
    //   ...prev,
    //   [name]: type === 'number' ? Number(value) || 0 : value,
    // }))
  }

  const handleOrderConfirmation = async () => {
    try {
      if (!selectedOrder) return

      const payload = {
        assembly_order_id: selectedOrder.id,
        status: formData.status, // ambil dari formData
        confirmed_by: 1, // bisa diganti user login
        note: formData.notes || '', // ambil dari formData
      }

      const response = await backendAssembly.post('/assembly-order-confirmations', payload)
      if (response.data.success === true) {
        // Update state biar UI langsung ikut berubah
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
      toast.error(error.response?.data?.message || 'FAILED TO ORDER CONFRIMATION')
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
        confirmed_by: 1, // ganti id user login
        confirmations,
      }

      const response = await backendAssembly.post(
        '/assembly-order-items-confirmations/batch',
        payload,
      )

      if (response.data.success) {
        toast.success(response.data?.message || 'SUCCESS CONFIRM ORDER')

        if (selectedOrder?.id) {
          try {
            const res = await backendAssembly.get(`/assembly-orders/${selectedOrder.id}`)
            if (res.data.success) {
              const updatedOrder = res.data.data
              setSelectedOrder(updatedOrder) // update full order
              setSelectedItems({}) // reset selection
              // update stock
              const productIds = updatedOrder.assembly_order_items.map((i) => i.product_id)
              const stockRes = await backendWhNew.post('/stock-units/stock-by-multiple-products', {
                product_ids: productIds,
                warehouse_id: 1,
                include_zero_stock: true,
              })
              const map = {}
              stockRes.data.data.stock_by_product.forEach((s) => {
                map[s.product_id] = s.total_quantity
              })
              setStockData(map)
            }
          } catch (err) {
            console.error('Failed to refresh order', err)
          }
        }
      } else {
        toast.error('FAILED CONFIRM ORDER!!')
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'FAILED TO CONFIRM ORDER')
    }
  }

  const handleSerialInput = (item) => {
    // buka UI scanner dengan data item
    setScanningItem({
      id: item.id,
      itemName: item.product_name,
      expectedQuantity: item.qty_request,
      remainingStage: item.qty_remaining,
      totalStaged: item.staged_serials?.length || 0,
      serialNumbers: item.staged_serials || [],
    })
    setSerialForm({ serialNumber: '' })
    setCurrentPage(1)
  }

  const handleSerialChange = (e) => {
    setSerialForm({ ...serialForm, [e.target.name]: e.target.value })
  }

  const handleSerialSubmit = () => {
    console.log('Submit serial:', serialForm.serialNumber)
    // sementara dummy, nanti bisa post ke API
    setSerialForm({ serialNumber: '' })
  }

  return (
    <CRow>
      <CCol xs={12}>
        {' '}
        <CCard>
          <CCardHeader>Assembly Order Confirmation</CCardHeader>
          <CCardBody>
            {loading ? (
              <CSpinner />
            ) : (
              <>
                {/* Dropdown pilih order */}
                <FormRow label="Assembly Order">
                  <Select
                    options={orders.map((o) => ({ value: o.id, label: o.order_number }))}
                    onChange={(selected) =>
                      handleOrderChange({ target: { value: selected.value } })
                    }
                    isClearable
                    placeholder="-- Select Order --"
                  />
                </FormRow>

                <FormRow label="Product Name">
                  <CFormInput
                    type="text"
                    placeholder=""
                    name="product_name"
                    min={1}
                    value={selectedOrder?.product_name || ''}
                    onChange={handleInput}
                    disabled
                  />
                </FormRow>

                <FormRow label="Quantity">
                  <CFormInput
                    type="number"
                    placeholder=""
                    name="quantity"
                    min={1}
                    value={selectedOrder?.quantity || ''}
                    onChange={handleInput}
                    disabled
                  />
                </FormRow>

                <FormRow label="Status">
                  <CFormSelect
                    name="status"
                    value={formData.status}
                    onChange={handleInput}
                    disabled={!selectedOrder || selectedOrder.status !== 'pending'}
                  >
                    <option value="">-- Select Status --</option>
                    {(selectedOrder?.status === 'pending' || !formData.status) && (
                      <>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="failed">Reject</option>
                      </>
                    )}
                    {formData.status === 'in_progress' && (
                      <option value="in_progress">In Progress</option>
                    )}
                    {formData.status === 'partial' && <option value="partial">Partial</option>}
                    {formData.status === 'completed' && (
                      <option value="completed">Completed</option>
                    )}
                  </CFormSelect>
                </FormRow>

                <FormRow label="Notes">
                  <CFormTextarea
                    type="text"
                    name="notes"
                    rows={3}
                    placeholder="Enter notes here"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notes: e.target.value,
                      })
                    }
                    disabled={!selectedOrder || formData.status !== 'pending'}
                  />
                </FormRow>

                {/* Tombol tambahan sebelum Order Details */}
                <div className="d-flex justify-content-end mt-3">
                  {selectedOrder?.status === 'pending' && (
                    <div>
                      <CButton
                        color="success"
                        className="me-2 text-white"
                        onClick={handleOrderConfirmation}
                      >
                        Order Confirmation
                      </CButton>
                    </div>
                  )}
                </div>

                {/* Detail order */}
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
                        <CTableHeaderCell className="text-start ps-3">
                          Product Name
                        </CTableHeaderCell>
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
                            const stock = Number(stockData[item.product_id] ?? 0)

                            const safeRemaining = isNaN(remaining) ? 0 : remaining
                            const safeStock = isNaN(stock) ? 0 : stock

                            const maxAllowed = Math.min(safeRemaining, safeStock)
                            return (
                              <CTableRow key={item.id}>
                                {/* Checkbox */}
                                <CTableDataCell>
                                  <CFormCheck
                                    id={`check-${item.id}`}
                                    checked={
                                      item.required ? true : !!selectedItems[item.id]?.checked
                                    }
                                    disabled={
                                      item.required ||
                                      selectedOrder.status === 'pending' ||
                                      selectedOrder.status === 'failed' ||
                                      safeRemaining === 0 ||
                                      safeStock === 0
                                    }
                                    onChange={(e) =>
                                      setSelectedItems((prev) => ({
                                        ...prev,
                                        [item.id]: {
                                          ...prev[item.id],
                                          checked: item.required ? true : e.target.checked,
                                          qty:
                                            item.required || e.target.checked
                                              ? prev[item.id]?.qty || 0
                                              : 0,
                                        },
                                      }))
                                    }
                                    color="primary" // <== ini yang bikin checkbox pakai warna theme
                                  />
                                </CTableDataCell>

                                {/* Product Name */}
                                <CTableDataCell className="fw-medium text-start ps-3">
                                  {item.product_name}
                                </CTableDataCell>

                                {/* Qty Request */}
                                <CTableDataCell>{item.qty_request}</CTableDataCell>

                                {/* Qty Confirmed */}
                                <CTableDataCell className="text-success fw-semibold">
                                  {item.qty_fulfilled}
                                </CTableDataCell>

                                {/* Remaining */}
                                <CTableDataCell className="text-danger fw-semibold">
                                  {remaining}
                                </CTableDataCell>

                                {/* Stock */}
                                <CTableDataCell className="fw-semibold">{stock}</CTableDataCell>

                                {/* Input Confirm Qty */}
                                <CTableDataCell>
                                  {item.is_serialized ? (
                                    <CButton
                                      size="sm"
                                      color="primary"
                                      // disabled={
                                      //   item.required || // 🔥 jika required maka otomatis disable
                                      //   !selectedItems[item.id]?.checked ||
                                      //   selectedOrder.status === 'pending' ||
                                      //   selectedOrder.status === 'failed' ||
                                      //   remaining === 0 ||
                                      //   stock <= 0
                                      // }
                                      onClick={() => handleSerialInput(item)}
                                    >
                                      Input Serial
                                    </CButton>
                                  ) : (
                                    <input
                                      type="number"
                                      className="form-control text-center"
                                      min={0}
                                      max={String(maxAllowed)}
                                      value={selectedItems[item.id]?.qty || ''}
                                      disabled={
                                        item.required || // 🔥 jika required maka otomatis disable
                                        !selectedItems[item.id]?.checked ||
                                        selectedOrder.status === 'pending' ||
                                        selectedOrder.status === 'failed' ||
                                        remaining === 0 ||
                                        stock <= 0
                                      }
                                      onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, '')
                                        value = Number(value)

                                        if (value > remaining && value > stock) value = stock
                                        if (value > remaining && value < stock) value = remaining
                                        if (value > stock) value = stock
                                        if (value < 0) value = 0

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
                                  )}
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

                  {/* Tombol submit */}
                  <div className="d-flex justify-content-end mt-3">
                    {selectedOrder &&
                      selectedOrder.status !== 'pending' &&
                      selectedOrder.status !== 'failed' &&
                      showSubmit && (
                        <CButton color="primary" onClick={handleSubmit}>
                          Submit Confirmation
                        </CButton>
                      )}
                  </div>
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {scanningItem && (
        <CCol xs={12} className="mt-4">
          <CRow>
            {/* Kiri: Input Serial */}
            <CCol md={6}>
              <CCard className="mb-4 h-100">
                <CCardHeader>
                  <strong>Scan Serial Number : {scanningItem.itemName}</strong>
                </CCardHeader>
                <CCardBody>
                  <FormRow label="Serial Number">
                    <CFormInput
                      name="serialNumber"
                      value={serialForm.serialNumber}
                      onChange={handleSerialChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSerialSubmit()
                        }
                      }}
                    />
                  </FormRow>
                  <div>
                    <strong>Expected Quantity:</strong> {scanningItem.expectedQuantity}
                  </div>
                  <div>
                    <strong>Remaining Quantity:</strong> {scanningItem.remainingStage}
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            {/* Kanan: Tabel staged serial */}
            <CCol md={6}>
              <CCard className="mb-4 h-100">
                <CCardHeader>
                  <strong>Staged Serial Numbers || Total: {scanningItem.totalStaged}</strong>
                </CCardHeader>
                <CCardBody className="d-flex flex-column">
                  <div className="flex-grow-1 overflow-auto">
                    <CTable striped hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>No</CTableHeaderCell>
                          <CTableHeaderCell>Serial Number</CTableHeaderCell>
                          <CTableHeaderCell>Staged At</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {scanningItem.serialNumbers
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((sn, idx) => (
                            <CTableRow key={idx}>
                              <CTableDataCell>
                                {(currentPage - 1) * itemsPerPage + idx + 1}
                              </CTableDataCell>
                              <CTableDataCell>{sn.serial_number}</CTableDataCell>
                              <CTableDataCell>
                                {new Date(sn.created_at).toLocaleString()}
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                      </CTableBody>
                    </CTable>
                  </div>

                  {/* Pagination */}
                  <div className="d-flex justify-content-end mt-3">
                    <CPagination>
                      <CPaginationItem
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                      >
                        Previous
                      </CPaginationItem>
                      {Array.from({
                        length: Math.ceil(scanningItem.serialNumbers.length / itemsPerPage),
                      }).map((_, i) => (
                        <CPaginationItem
                          key={i}
                          active={i + 1 === currentPage}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </CPaginationItem>
                      ))}
                      <CPaginationItem
                        disabled={
                          currentPage ===
                          Math.ceil(scanningItem.serialNumbers.length / itemsPerPage)
                        }
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CCol>
      )}
    </CRow>
  )
}

export default AssemblyOrders
