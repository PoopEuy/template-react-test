import React, { useEffect, useState, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CRow,
  CSpinner,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormSelect,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'
import { backendTracking, backendReceiving, backendWhNew } from '../../api/axios'

// Search bar
const SearchBar = ({ value, onChange }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={6}>
      <CFormInput
        type="text"
        placeholder="Search by GR Number or PO Number..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </CCol>
  </CRow>
)

const ReceivingWhReq = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalRows, setTotalRows] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')

  // modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [warehouses, setWarehouses] = useState([])
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [chunkSize, setChunkSize] = useState(50)
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  // Fetch receiving data
  const fetchReceiving = useCallback(async () => {
    setLoading(true)
    try {
      const res = await backendTracking.get('/sample-inspections/receiving-items-summary', {
        params: {
          qc_id: 'QC-SPNS-PCBA-001',
          tracking_type: 'receiving',
          status: 'pass',
          page,
          limit,
          search: searchKeyword || undefined,
        },
      })

      const items = res.data.data?.receiving_items || []
      setTotalRows(res.data.data?.pagination?.total || 0)

      // fetch detail per item
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          try {
            const detailRes = await backendReceiving.get(
              `/receiving-items/${item.receiving_item_id}`,
            )
            const detailData = detailRes.data.data

            return {
              ...item,
              product_name: detailData?.product?.data?.name || '-',
              gr_number: detailData?.receiving_header?.gr_number || '-',
              po_number: detailData?.receiving_header?.purchase_order?.po_number || '-',
            }
          } catch (err) {
            console.error('Failed fetching detail for item:', item.receiving_item_id)
            return {
              ...item,
              product_name: '-',
              gr_number: '-',
              po_number: '-',
            }
          }
        }),
      )

      setData(itemsWithDetails)
    } catch (error) {
      console.error(error)
      toast.error('Failed to fetch receiving items summary')
    } finally {
      setLoading(false)
    }
  }, [page, limit, searchKeyword])

  useEffect(() => {
    const debounceDelay = 300
    const delayDebounce = setTimeout(() => {
      fetchReceiving()
    }, debounceDelay)

    return () => clearTimeout(delayDebounce)
  }, [fetchReceiving])

  // fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const res = await backendWhNew.get('/', { params: { page: 1, limit: 10 } })
      setWarehouses(res.data.data || [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to fetch warehouses')
    }
  }

  // open modal + fetch warehouse
  const handleRequestClick = (row) => {
    setSelectedItem(row) // simpan seluruh row
    setShowModal(true)
    fetchWarehouses()
  }

  // submit request
  const handleSubmitRequest = async () => {
    if (!selectedWarehouse) {
      toast.warn('Please select a warehouse')
      return
    }
    setSubmitting(true)
    try {
      const res = await backendTracking.post('/generate-batch', {
        warehouse_id: Number(selectedWarehouse),
        receiving_item_id: selectedItem?.receiving_item_id, // ambil dari row
        chunk_size: Number(chunkSize),
      })

      toast.success(res.data.message || 'Batch generated successfully')
      setShowModal(false)
      setSelectedWarehouse('')
      setChunkSize(50)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to generate batch')
    } finally {
      setSubmitting(false)
    }
  }

  //DataTable columns
  const columns = [
    {
      name: 'No',
      width: '60px',
      cell: (row, index) => <div className="text-center">{(page - 1) * limit + index + 1}</div>,
    },
    { name: 'Product Name', selector: (row) => row.product_name, sortable: true },
    { name: 'GR Number', selector: (row) => row.gr_number, sortable: true },
    { name: 'PO Number', selector: (row) => row.po_number, sortable: true },
    {
      name: 'Total Items',
      selector: (row) => row.overview?.total_items,
    },
    {
      name: 'Total Sample',
      selector: (row) => row.aql_status_by_qc_id[0]?.required_sample,
    },
    {
      name: 'Inspected Sample',
      selector: (row) => row.aql_status_by_qc_id[0]?.current_inspected,
    },
    {
      name: 'Status',
      selector: (row) => row.aql_status_by_qc_id[0]?.status,
    },

    {
      name: 'Actions',
      cell: (row) => (
        <CButton size="sm" color="info" onClick={() => handleRequestClick(row)}>
          Request
        </CButton>
      ),
      ignoreRowClick: true,
    },
  ]

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Receiving-WH : Request List</strong>
          </CCardHeader>
          <CCardBody>
            <SearchBar
              value={searchKeyword}
              onChange={(value) => {
                setSearchKeyword(value)
                setPage(1)
              }}
            />
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: '300px' }}
              >
                <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={data}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationDefaultPage={page}
                onChangePage={(p) => setPage(p)}
                onChangeRowsPerPage={(newLimit) => {
                  setLimit(newLimit)
                  setPage(1)
                }}
                responsive
                highlightOnHover
                striped
              />
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Modal request */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>Send Request</CModalHeader>
        <CModalBody>
          <CFormSelect
            label="Select Warehouse"
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

          <CFormInput
            type="text"
            label="Product Name"
            value={selectedItem?.product_name || ''}
            className="mt-3"
            disabled
          />

          <CFormInput
            type="text"
            label="GR Number"
            value={selectedItem?.gr_number || ''}
            className="mt-3"
            disabled
          />

          <CFormInput
            type="text"
            label="PO Number"
            value={selectedItem?.po_number || ''}
            className="mt-3"
            disabled
          />

          <CFormInput
            type="number"
            label="Chunk Size"
            min={1}
            value={chunkSize}
            className="mt-3"
            disabled
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSubmitRequest} disabled={submitting}>
            {submitting ? <CSpinner size="sm" /> : 'Submit'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default ReceivingWhReq
