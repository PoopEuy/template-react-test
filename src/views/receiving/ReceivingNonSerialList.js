import React, { useState, useEffect, useCallback } from 'react'
import { CCard, CCardBody, CSpinner, CButton } from '@coreui/react'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import { backendTracking } from '../../api/axios'
import { useNavigate } from 'react-router-dom'

const ReceivingNonSerialQc = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalRows, setTotalRows] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')

  const navigate = useNavigate()

  const fetchTracking = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        is_serialize: false,
        // page,
        // limit,
        status: 'in_progress',
      }

      if (searchKeyword.trim() !== '') {
        params.search = searchKeyword.trim()
      }

      const res = await backendTracking.get('/sample-inspections/receiving-items-aql-summary', {
        params,
      })

      const items = res.data.data.receiving_items || []
      const total =
        res.data.data.pagination?.total ||
        res.data.data.summary?.total_receiving_items ||
        items.length

      setData(items)
      setTotalRows(total)
    } catch (error) {
      console.error(error)
      toast.error('Failed to fetch tracking data')
    } finally {
      setLoading(false)
    }
  }, [searchKeyword])

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

  const handleSelectDetail = (tracking_id) => {
    navigate(`/receiving/detailnonserialqc/${tracking_id}`)
  }

  const columns = [
    {
      name: 'No.',
      cell: (row, index) => (page - 1) * limit + (index + 1),
      width: '70px',
    },
    { name: 'Product', selector: (row) => row.product_name, sortable: true },
    { name: 'Batch', selector: (row) => row.batch, sortable: true },
    { name: 'QC Code', selector: (row) => row.qc_standard, sortable: true },
    { name: 'Status', selector: (row) => row.status, sortable: true },
    {
      name: 'Progress',
      selector: (row) => row.aql_info?.progress ?? '0%',
    },
    {
      name: 'Samples (Pass/Fail)',
      selector: (row) =>
        row.items_summary
          ? `${row.items_summary.samples_passed}/${row.items_summary.samples_failed}`
          : '0/0',
    },
    { name: 'Next Action', selector: (row) => row.next_action },
    {
      name: 'Action',
      cell: (row) => (
        <CButton
          size="sm"
          color="primary"
          onClick={() => handleSelectDetail(row.tracking_items?.[0]?.tracking_id)}
        >
          Inspect
        </CButton>
      ),
    },
  ]

  return (
    <CCard>
      <CCardBody>
        <div className="d-flex justify-content-between mb-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchKeyword}
            onChange={handleSearchChange}
            className="form-control w-25"
          />
        </div>
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '300px' }}
          >
            <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
          </div>
        ) : (
          <DataTable columns={columns} data={data} pagination highlightOnHover persistTableHead />
        )}
      </CCardBody>
    </CCard>
  )
}

export default ReceivingNonSerialQc
