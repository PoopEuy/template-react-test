import React, { useState, useEffect, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormSelect,
  CButton,
  CSpinner,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import { backendTracking, backendWhNew } from '../../api/axios'
import { toast } from 'react-toastify'

// helper row agar form rapi
const FormRow = ({ label, children }) => (
  <CRow className="mb-3">
    <CCol md={3} className="d-flex align-items-center fw-bold">
      {label}
    </CCol>
    <CCol md={9}>{children}</CCol>
  </CRow>
)

const ReceivingWhRequest = () => {
  const [warehouses, setWarehouses] = useState([])
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

  // fetch warehouse list
  const fetchWarehouses = async () => {
    try {
      const res = await backendWhNew.get('/', { params: { page: 1, limit: 10 } })
      setWarehouses(res.data.data || [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to fetch warehouses')
    }
  }

  // fetch completed summary
  const fetchData = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        const res = await backendTracking.get(`/status/completed/summary/receiving_item_id`, {
          params: { page, limit: pagination.limit },
        })
        if (res.data.success) {
          setData(res.data.data.grouped_data || [])
          setPagination({
            page: res.data.data.pagination.current_page,
            limit: res.data.data.pagination.per_page,
            total: res.data.data.pagination.total_groups,
          })
          setSelectedRows([])
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to fetch summary')
      } finally {
        setLoading(false)
      }
    },
    [pagination.limit],
  )

  useEffect(() => {
    fetchWarehouses()
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedWarehouse) {
      toast.error('Please select a warehouse first')
      return
    }
    if (selectedRows.length === 0) {
      toast.error('Please select at least one item')
      return
    }

    const payload = {
      items: selectedRows.map((id) => ({ receiving_item_id: id })),
      warehouse_id: Number(selectedWarehouse),
    }

    // console.log('payload : ', payload)

    try {
      const res = await backendTracking.put('/update-status-to-stored', payload)
      if (res.data.success) {
        toast.success('Items updated successfully!')
        // refresh data
        fetchData(pagination.page)
        setSelectedRows([])
      } else {
        toast.error(res.data.message || 'Failed to update status')
      }
    } catch (err) {
      console.error(err)
      toast.error('API request failed')
    }
  }

  const isAllSelected = data.length > 0 && selectedRows.length === data.length

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(data.map((row) => row.receiving_item_id))
    } else {
      setSelectedRows([])
    }
  }

  const handleRowSelect = (id, checked) => {
    if (checked) {
      setSelectedRows((prev) => [...new Set([...prev, id])])
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id))
    }
  }

  const columns = [
    {
      name: (
        <div className="d-flex align-items-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            style={{ marginRight: '5px' }}
          />
          <small>All</small>
        </div>
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.receiving_item_id)}
          onChange={(e) => handleRowSelect(row.receiving_item_id, e.target.checked)}
        />
      ),
      width: '120px',
    },
    { name: 'Product Name', selector: (row) => row.receiving_item_details?.name },
    { name: 'Product SAP', selector: (row) => row.receiving_item_details?.sap_code },
    { name: 'GR Number', selector: (row) => row.receiving_item_details?.gr_number },
    { name: 'PO Number', selector: (row) => row.receiving_item_details?.po_number },
    {
      name: 'Serialize',
      cell: (row) =>
        row.receiving_item_details?.is_serialize ? (
          <span className="badge bg-success">Yes</span>
        ) : (
          <span className="badge bg-secondary">No</span>
        ),
    },
    { name: 'Original Qty', selector: (row) => row.total_original_quantity },
  ]

  return (
    <CRow>
      <CCol md={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Receiving WH Request</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <FormRow label="Select Warehouse">
                <CFormSelect
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                >
                  <option value="">-- Select Warehouse --</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </CFormSelect>
              </FormRow>

              <h6 className="mt-4 mb-2">Receiving Item List</h6>
              {loading ? (
                <div className="text-center p-4">
                  <CSpinner />
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={data}
                  pagination
                  paginationServer
                  paginationTotalRows={pagination.total}
                  paginationDefaultPage={pagination.page}
                  onChangePage={(p) => fetchData(p)}
                  highlightOnHover
                  striped
                  dense
                />
              )}

              <div className="mt-3">
                <CButton type="submit" color="primary">
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

export default ReceivingWhRequest
