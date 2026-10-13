import React, { useState, useMemo, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CFormSelect,
  CFormInput,
  CRow,
  CCol,
  CButton,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { backendTracking } from '../../api/axios'

const TrackingFinalProduct = () => {
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('') // input sementara sebelum submit
  const [data, setData] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)

  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const navigate = useNavigate()

  const handleDetail = (row) => {
    navigate(`/tracking/detail/${row.tracking_id}`)
  }

  // Daftar kolom QC sesuai tabel (Unut download CSV dan Filter)
  const qcColumns = [
    { code: 'QC-SA002', label: 'Sub Assembly' },
    { code: 'QC-AT003', label: 'Assembly' },
    { code: 'QC-OT004', label: 'ON Test' },
    { code: 'QC-HT005', label: 'Hippot' },
    { code: 'QC-U015', label: 'Ultrasonic' },
    { code: 'QC-RM013', label: 'Ref. Meter' },
    { code: 'QC-TB1006', label: 'Test Bench 1' },
    { code: 'QC-TB2014', label: 'Test Bench 2' },
    // { code: 'QC-AT007', label: 'Aging' }, // temporarily hidden
    { code: 'QC-LE016', label: 'Laser Engraving' },
    { code: 'QC-C001', label: 'Cover & Finishing' },
  ]

  // === FILTER STATE PER KOLOM ===
  const [filters, setFilters] = useState(
    qcColumns.reduce((acc, qc) => ({ ...acc, [qc.code]: '' }), {}),
  )

  // === FETCH DATA ===
  const fetchData = async (page = 1, limit = 20, serialNumber = '') => {
    setLoading(true)
    try {
      const payload = {
        page,
        limit,
        is_serial: true,
        is_pln_code: true,
        tracking_type: 'assembly',
      }

      // Jika ada serial number, tambahkan ke payload
      if (serialNumber.trim()) {
        payload.serial_number = serialNumber.trim()
      }

      const res = await backendTracking.post('/qc-results/history', payload)

      const result = res.data?.data?.records ?? []
      const total = res.data?.data?.pagination?.total ?? 0

      setData(result)
      setTotalRecords(total)
    } catch (err) {
      console.error('Gagal fetch data:', err)
      setData([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when page, rowsPerPage, or searchKeyword changes
  useEffect(() => {
    fetchData(currentPage, rowsPerPage, searchKeyword)
  }, [currentPage, rowsPerPage, searchKeyword])

  // Handle search submit
  const handleSearch = () => {
    setCurrentPage(1) // Reset ke halaman 1 saat search
    setSearchKeyword(searchInput) // useEffect akan trigger fetchData
  }

  // Handle enter key pada input search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput('')
    setCurrentPage(1)
    setSearchKeyword('') // useEffect akan trigger fetchData
  }

  // untuk event double-click resize
  useEffect(() => {
    const table = document.querySelector('.rdt_Table')
    if (!table) return

    const expandedCols = new Map()

    const handleDoubleClick = (e) => {
      const cell = e.target.closest('.rdt_TableCell, .rdt_TableCol')
      if (!cell) return
      if (cell.querySelector('button') || cell.querySelector('span[role="button"]')) return

      const columnIndex = Array.from(cell.parentNode.children).indexOf(cell)
      if (columnIndex !== 0) return // hanya kolom pertama (PLN Serial)

      const rows = document.querySelectorAll('.rdt_TableRow')
      const headers = document.querySelectorAll('.rdt_TableCol')
      const allCells = [
        ...Array.from(rows).map((r) => r.children[columnIndex]),
        headers[columnIndex],
      ].filter(Boolean)

      const isExpanded = expandedCols.get(columnIndex) || false

      if (isExpanded) {
        // kembali ke ukuran default
        allCells.forEach((c) => {
          c.style.width = '150px'
          c.style.minWidth = '150px'
          c.style.maxWidth = '800px'
        })
        expandedCols.set(columnIndex, false)
        return
      }

      // expand sesuai konten
      allCells.forEach((c) => void c.offsetWidth)
      let maxWidth = 0
      allCells.forEach((c) => {
        const range = document.createRange()
        range.selectNodeContents(c)
        const rect = range.getBoundingClientRect()
        const contentWidth = rect.width + 48 // padding buffer
        if (contentWidth > maxWidth) maxWidth = contentWidth
      })

      const targetWidth = Math.min(maxWidth, 800)
      allCells.forEach((c) => {
        c.style.width = `${targetWidth}px`
        c.style.minWidth = `${targetWidth}px`
        c.style.maxWidth = `${targetWidth}px`
      })

      expandedCols.set(columnIndex, true)
    }

    table.addEventListener('dblclick', handleDoubleClick)
    return () => table.removeEventListener('dblclick', handleDoubleClick)
  }, [])

  // === FILTER LOGIC (hanya untuk filter QC status, search sudah via API) ===
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesFilters = Object.entries(filters).every(([qcKey, qcValue]) => {
        if (qcValue === '') return true
        return row.qc_history?.[qcKey]?.status === qcValue
      })

      return matchesFilters
    })
  }, [data, filters])

  // === GET DATA YANG SEDANG TAMPIL DI PAGE (untuk download) ===
  const currentPageData = useMemo(() => {
    return filteredData
  }, [filteredData])

  // === DOWNLOAD CSV ===
  const exportToCSV = (exportData, filenameSuffix) => {
    if (!exportData || exportData.length === 0) {
      toast.error('No data to export!')
      return
    }

    // Header CSV
    const headers = ['No', 'Assembly Serial', 'PLN Serial', ...qcColumns.map((qc) => qc.label)]

    // Isi baris CSV
    const rows = exportData.map((row, index) => [
      index + 1,
      row.serial_number || '-',
      row.pln_code || '-',
      ...qcColumns.map((qc) => {
        const status = row.qc_history?.[qc.code]?.status || '-'
        const date = row.qc_history?.[qc.code]?.inspection_date
        let formattedDate = '-'

        if (date) {
          const d = new Date(date)
          const yyyy = d.getUTCFullYear()
          const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
          const dd = String(d.getUTCDate()).padStart(2, '0')
          const hh = String(d.getUTCHours()).padStart(2, '0')
          const min = String(d.getUTCMinutes()).padStart(2, '0')
          const ss = String(d.getUTCSeconds()).padStart(2, '0')
          formattedDate = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
        }

        return formattedDate !== '-' ? `${status} (${formattedDate})` : status
      }),
    ])

    // Gabung jadi string CSV
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n')

    // Download otomatis
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `tracking_${filenameSuffix}_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Exported ${exportData.length} rows successfully!`)
  }

  const handleDownloadPage = () => {
    exportToCSV(currentPageData, 'page')
  }

  const handleDownloadAll = () => {
    exportToCSV(filteredData, 'all')
  }

  const renderStatusBadge = (status, date) => {
    if (!status) return '-'

    const badgeStyle = {
      PASS: { color: 'white', backgroundColor: '#28a745' },
      FAIL: { color: 'white', backgroundColor: '#dc3545' },
      PENDING: { color: 'black', backgroundColor: '#ffc107' },
      on_progress: { color: 'white', backgroundColor: '#17a2b8' },
    }

    const style = badgeStyle[status] || { backgroundColor: '#6c757d', color: 'white' }

    // Format tanggal sesuai nilai dari API (tanpa konversi timezone, agar tidak +7)
    const formattedDate = date
      ? (() => {
          const d = new Date(date)
          const day = String(d.getUTCDate()).padStart(2, '0')
          const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
          const year = d.getUTCFullYear()
          const hh = String(d.getUTCHours()).padStart(2, '0')
          const min = String(d.getUTCMinutes()).padStart(2, '0')
          return `${day} ${month} ${year}, ${hh}:${min}`
        })()
      : null


    return (
      <div style={{ textAlign: 'center', lineHeight: '1.3' }}>
        <span
          style={{
            ...style,
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: 600,
            display: 'inline-block',
          }}
        >
          {status}
        </span>
        {formattedDate && (
          <div
            style={{
              fontSize: '0.7rem',
              color: '#555',
              marginTop: '3px',
            }}
          >
            {formattedDate}
          </div>
        )}
      </div>
    )
  }

  const columns = [
    {
      name: <span title="PLN Serial">PLN Serial</span>,
      selector: (row) => row.pln_code || '-',
      sortable: true,
    },
    ...qcColumns.map((qc) => ({
      name: <span title={qc.label}>{qc.label}</span>,
      selector: (row) => row.qc_history?.[qc.code]?.status,
      cell: (row) =>
        renderStatusBadge(
          row.qc_history?.[qc.code]?.status,
          row.qc_history?.[qc.code]?.inspection_date, // gunakan field waktu di sini
        ),
      sortable: true,
    })),
    {
      name: <span title="Actions">Actions</span>,
      cell: (row) => (
        <CButton size="sm" color="primary" onClick={() => handleDetail(row)}>
          Detail
        </CButton>
      ),
      ignoreRowClick: true,
    },
  ]

  const renderFilterSelect = (colKey, label) => (
    <div>
      <small>{label}</small>
      <CFormSelect
        size="sm"
        value={filters[colKey]}
        onChange={(e) => setFilters({ ...filters, [colKey]: e.target.value })}
      >
        <option value="">All</option>
        <option value="PASS">PASS</option>
        <option value="FAIL">FAIL</option>
        <option value="PENDING">PENDING</option>
        <option value="on_progress">on_progress</option>
      </CFormSelect>
    </div>
  )

  return (
    <CCard>
      <CCardHeader>
        <strong>Tracking QC Final Product</strong>
      </CCardHeader>
      <CCardBody>
        {/* Search + Download */}
        <CRow className="mb-3 align-items-center">
          <CCol md={5} sm={6}>
            <div className="d-flex gap-2">
              <CFormInput
                type="text"
                placeholder="Search serial number..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                size="sm"
                style={{ flex: 1 }}
              />
              <CButton color="primary" size="sm" onClick={handleSearch} disabled={loading}>
                Search
              </CButton>
              {searchKeyword && (
                <CButton color="secondary" size="sm" onClick={handleClearSearch} disabled={loading}>
                  Clear
                </CButton>
              )}
            </div>
          </CCol>
          <CCol md={7} sm={6} className="text-end">
            <CButton
              color="primary"
              size="sm"
              className="me-2"
              onClick={handleDownloadPage}
              disabled={loading || currentPageData.length === 0}
            >
              Download Page
            </CButton>
            <CButton
              color="primary"
              size="sm"
              onClick={handleDownloadAll}
              disabled={loading || filteredData.length === 0}
            >
              Download All
            </CButton>
          </CCol>
        </CRow>

        {/* Filter Dropdowns */}
        <CRow className="mb-3">
          {qcColumns.map((qc) => (
            <CCol key={qc.code} xs={6} md={3} className="mb-2">
              <small>{qc.label}</small>
              <CFormSelect
                size="sm"
                value={filters[qc.code]}
                onChange={(e) => setFilters({ ...filters, [qc.code]: e.target.value })}
              >
                <option value="">All</option>
                <option value="PASS">PASS</option>
                <option value="FAIL">FAIL</option>
                <option value="PENDING">PENDING</option>
                <option value="on_progress">on_progress</option>
              </CFormSelect>
            </CCol>
          ))}
        </CRow>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredData}
          progressPending={loading}
          progressComponent={<CSpinner size="sm" />}
          pagination
          paginationServer
          paginationTotalRows={totalRecords}
          paginationPerPage={rowsPerPage}
          paginationRowsPerPageOptions={[10, 20, 50, 100]}
          onChangePage={(page) => setCurrentPage(page)}
          onChangeRowsPerPage={(newPerPage) => {
            setRowsPerPage(newPerPage)
            setCurrentPage(1)
          }}
          highlightOnHover
          persistTableHead
          noDataComponent="No data available"
          fixedHeader
          fixedHeaderScrollHeight="500px"
        />
      </CCardBody>
    </CCard>
  )
}

export default TrackingFinalProduct
