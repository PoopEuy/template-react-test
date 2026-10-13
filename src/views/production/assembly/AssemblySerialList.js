import React, { useState, useEffect, useCallback } from 'react'
import DataTable from 'react-data-table-component'
import { CCard, CCardBody, CSpinner, CFormInput, CRow, CCol, CButton } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { backendGenerate } from '../../../api/axios'
import { toast } from 'react-toastify'

const AssemblySerialList = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalRows, setTotalRows] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isPrinting, setIsPrinting] = useState(false)
  const navigate = useNavigate()

  // Ambil user dari localStorage
  const getUserFromStorage = () => {
    try {
      const userString = localStorage.getItem('user')
      if (userString) {
        return JSON.parse(userString)
      }
      return null
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
      return null
    }
  }

  const user = getUserFromStorage()

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const response = await backendGenerate.get('/pln-codes/partial', {
        params: { page, limit, search: searchKeyword || undefined },
      })

      if (response.data.success) {
        // Response structure: data.data.data (array of records)
        setRecords(response.data.data?.data || [])
        // Pagination: data.data.pagination.total
        setTotalRows(response.data.data?.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching records:', error)
      toast.error('Failed to fetch records')
    } finally {
      setLoading(false)
    }
  }, [page, limit, searchKeyword])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  //Print Serial
  const PrintSerial = async () => {
    console.log('Print')
    const payload = {
      limit: 10,
      printedBy: user?.name || 'Unknown User',
      printNotes: 'Print',
    }

    setIsPrinting(true)
    try {
      await backendGenerate.post('/pln-codes/send-to-printer', payload)
      toast.success('Print status updated successfully!')
      fetchRecords()
    } catch (error) {
      console.error('Error update print status:', error)
      toast.error(error.response?.data?.message || 'Failed to update print status')
    } finally {
      setIsPrinting(false)
    }
  }
  // Download CSV + update ke API
  const downloadCSV = async () => {
    if (records.length === 0) {
      toast.error('No data to export!')
      return
    }

    const headers = ['No', 'Assembly Serial Code']

    const rows = records.map((row, index) => [(page - 1) * limit + index + 1, row.partialCode])

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `assembly_serials_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Ambil semua id dari records sebagai plnCodeIds
    const plnCodeIds = records.map((row) => row.id)

    // Payload baru sesuai dengan API
    const payload = {
      plnCodeIds: plnCodeIds,
      printedBy: user?.name || 'Unknown User',
      printNotes: `Bulk download CSV at ${new Date().toLocaleString()}`,
    }

    try {
      await backendGenerate.post('/pln-codes/bulk-mark-printed', payload)
      toast.success('Print status updated successfully!')

      fetchRecords()
    } catch (error) {
      console.error('Error update print status:', error)
      toast.error(error.response?.data?.message || 'Failed to update print status')
    }
  }

  const columns = [
    {
      name: 'No',
      selector: (row, index) => (page - 1) * limit + index + 1,
      sortable: false,
      width: '70px',
    },
    {
      name: 'Assembly Serial Code',
      selector: (row) => row.partialCode,
      sortable: true,
      grow: 2,
    },
    {
      name: 'Factory',
      selector: (row) => row.factory?.name || '-',
      sortable: true,
      width: '150px',
    },
    {
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      width: '100px',
    },
    {
      name: 'Printed',
      selector: (row) => (row.isPrinted ? '✓' : '✗'),
      sortable: true,
      width: '80px',
      center: true,
    },
    {
      name: 'Generated At',
      selector: (row) => new Date(row.generatedAt).toLocaleString(),
      sortable: true,
      grow: 1,
    },
  ]

  return (
    <CCard>
      <CCardBody>
        <CRow className="mb-3">
          <CCol md={4}>
            <CFormInput
              placeholder="Search serial number..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value)
                setPage(1)
              }}
            />
          </CCol>
          <CCol className="d-flex justify-content-end">
            <CButton
              color="success"
              className="text-white"
              onClick={PrintSerial}
              disabled={records.length === 0 || isPrinting}
            >
              {isPrinting ? 'Printing...' : 'Print Serial'}
            </CButton>
          </CCol>

          {/* <CCol className="d-flex justify-content-end">
            <CButton
              color="success"
              className="text-white"
              onClick={downloadCSV}
              disabled={records.length === 0}
            >
              Download CSV
            </CButton>
          </CCol> */}
        </CRow>

        <DataTable
          columns={columns}
          data={records}
          progressPending={loading}
          progressComponent={<CSpinner />}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationPerPage={limit}
          onChangePage={(p) => setPage(p)}
          onChangeRowsPerPage={(newLimit) => {
            setLimit(newLimit)
            setPage(1)
          }}
          highlightOnHover
          striped
        />
      </CCardBody>
    </CCard>
  )
}

export default AssemblySerialList
