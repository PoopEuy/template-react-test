import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CRow,
  CSpinner,
  CButton,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'
import { backendReceiving } from '../../api/axios'

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

const ReceivingList = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalRows, setTotalRows] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')

  const navigate = useNavigate()

  const handleDetailClick = useCallback(
    (id) => {
      navigate(`/receiving/receivingDetail/${id}`)
    },
    [navigate],
  )

  // Fetch receiving data
  const fetchReceiving = useCallback(async () => {
    setLoading(true)
    try {
      const res = await backendReceiving.get('/receiving-headers', {
        params: {
          page,
          limit,
          search: searchKeyword,
          status: '',
        },
      })

      setData(res.data.data || [])
      setTotalRows(res.data.pagination?.totalCount || 0)
    } catch (error) {
      toast.error('Failed to fetch receiving headers')
    } finally {
      setLoading(false)
    }
  }, [page, limit, searchKeyword])

  useEffect(() => {
    const debounceDelay = 400
    const delayDebounce = setTimeout(() => {
      fetchReceiving()
    }, debounceDelay)

    return () => clearTimeout(delayDebounce)
  }, [fetchReceiving])

  // DataTable columns
  const columns = useMemo(
    () => [
      {
        name: 'No',
        width: '60px',
        cell: (row, index) => <div className="text-center">{(page - 1) * limit + index + 1}</div>,
      },
      { name: 'GR Number', selector: (row) => row.gr_number, sortable: true },
      {
        name: 'PO Number',
        selector: (row) => row.purchase_order?.po_number || '-',
        sortable: true,
      },
      { name: 'Batch', selector: (row) => row.batch },
      {
        name: 'Received Date',
        selector: (row) =>
          row.received_date ? new Date(row.received_date).toLocaleDateString() : '-',
      },
      { name: 'Location', selector: (row) => row.location },
      { name: 'Status', selector: (row) => row.status || '-' },
      {
        name: 'Actions',
        cell: (row) => (
          <div className="d-flex gap-2">
            <CButton size="sm" color="info" onClick={() => handleDetailClick(row.id)}>
              Detail
            </CButton>
          </div>
        ),
        ignoreRowClick: true,
      },
    ],
    [page, limit, handleDetailClick],
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Receiving List</strong>
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
            ) : data.length === 0 ? (
              <div className="text-center text-muted my-3">No data found.</div>
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
    </CRow>
  )
}

export default ReceivingList
