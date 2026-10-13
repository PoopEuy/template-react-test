import React, { useState, useEffect, useCallback } from 'react'
import { CCard, CCardBody, CFormCheck, CSpinner, CButton, CRow, CCol } from '@coreui/react'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import { backendTracking } from '../../api/axios'
import { useNavigate } from 'react-router-dom'

const TrackingList = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalRows, setTotalRows] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterSerialized, setFilterSerialized] = useState(true)
  const [filterNonSerialized, setFilterNonSerialized] = useState(true)

  const navigate = useNavigate()

  const fetchTracking = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit,
        sort_by: 'created_at',
        sort_order: 'desc',
      }

      if (searchKeyword.trim() !== '') {
        params.search = searchKeyword.trim()
      }

      // Handle serialize filter
      if (filterSerialized && !filterNonSerialized) {
        params.is_serialize = true
      } else if (!filterSerialized && filterNonSerialized) {
        params.is_serialize = false
      }

      const res = await backendTracking.get('/', { params })

      setData(res.data.data.records || [])
      setTotalRows(res.data.data.pagination?.total || 0)
    } catch (error) {
      toast.error('Failed to fetch tracking data')
    } finally {
      setLoading(false)
    }
  }, [page, limit, searchKeyword, filterSerialized, filterNonSerialized])

  useEffect(() => {
    fetchTracking()
  }, [fetchTracking])

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const handlePerRowsChange = (newLimit, newPage) => {
    setLimit(newLimit)
    setPage(newPage)
  }

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value)
    setPage(1)
  }

  const handleDetailClick = (id) => {
    const trackingId = id
    navigate(`/tracking/detail/${trackingId}`)
  }

  const columns = [
    { name: 'Serial Number', selector: (row) => row.serial_number, sortable: true },
    { name: 'Item Code', selector: (row) => row.code_item, sortable: true },
    { name: 'Batch', selector: (row) => row.batch, sortable: true },
    { name: 'Qty', selector: (row) => row.original_quantity, sortable: true },
    { name: 'Serialized', selector: (row) => (row.is_serialize ? 'Yes' : 'No'), sortable: true },
    { name: 'Tracking', selector: (row) => row.tracking_type, sortable: true },
    {
      name: 'Actions',
      cell: (row) => (
        <CButton size="sm" color="primary" onClick={() => handleDetailClick(row.id)}>
          Detail
        </CButton>
      ),
      ignoreRowClick: true,
    },
  ]

  return (
    <CCard>
      <CCardBody>
        <CRow className="mb-3 align-items-center">
          {/* Search */}
          <CCol md={4} sm={6}>
            <input
              type="text"
              placeholder="Search..."
              value={searchKeyword}
              onChange={handleSearchChange}
              className="form-control form-control-sm"
            />
          </CCol>

          {/* Checkbox Filter */}
          <CCol md={8} sm={6} className="d-flex justify-content-md-end gap-3 mt-2 mt-md-0">
            <CFormCheck
              label="Serialized"
              checked={filterSerialized}
              onChange={(e) => {
                setFilterSerialized(e.target.checked)
                setPage(1)
              }}
            />
            <CFormCheck
              label="Non-Serialized"
              checked={filterNonSerialized}
              onChange={(e) => {
                setFilterNonSerialized(e.target.checked)
                setPage(1)
              }}
            />
          </CCol>
        </CRow>

        <DataTable
          columns={columns}
          data={data}
          progressPending={loading}
          progressComponent={<CSpinner size="sm" />}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          highlightOnHover
          persistTableHead
        />
      </CCardBody>
    </CCard>
  )
}

export default TrackingList
