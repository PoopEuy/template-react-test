import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { backendTracking, backendUploadFile } from '../../api/axios'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CRow,
  CCol,
  CBadge,
  CPagination,
  CPaginationItem,
  CFormSelect,
} from '@coreui/react'
import { toast } from 'react-toastify'
const VITE_SERVER_DATA = import.meta.env.VITE_SERVER_DATA

const TrackingDetail = () => {
  const { trackingId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  
  // Pagination state untuk QC Results
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const fetchDetail = useCallback(async () => {
    setLoading(true)
    try {
      const res = await backendTracking.get(`/${trackingId}`)
      setDetail(res.data.data)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch tracking detail')
    } finally {
      setLoading(false)
    }
  }, [trackingId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  // Pagination logic untuk QC Results - harus dipanggil sebelum early return
  const qcResults = detail?.qc_results || []
  const totalItems = qcResults.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  
  const paginatedQcResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return qcResults.slice(startIndex, endIndex)
  }, [qcResults, currentPage, itemsPerPage])

  // Early returns setelah semua hooks
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  if (!detail) {
    return <p>No data found.</p>
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const ss = String(date.getSeconds()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
  }

  // Format tanggal UTC agar inspection_date tidak bergeser +7 jam (backend UTC, browser UTC+7)
  const formatDateTimeUTC = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const yyyy = date.getUTCFullYear()
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(date.getUTCDate()).padStart(2, '0')
    const hh = String(date.getUTCHours()).padStart(2, '0')
    const min = String(date.getUTCMinutes()).padStart(2, '0')
    const ss = String(date.getUTCSeconds()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
  }

  // const handleReport = async (qc) => {
  //   try {
  //     const res = await backendUploadFile.get(`/qc-test-report/stream`, {
  //       params: { path: qc.file_path },
  //       responseType: 'blob',
  //     })

  //     // buat URL blob
  //     const fileURL = window.URL.createObjectURL(new Blob([res.data]))
  //     // buka di tab baru
  //     window.open(fileURL, '_blank')
  //   } catch (err) {
  //     console.error(err)
  //     toast.error('Failed to download file')
  //   }
  // }

  const handleReport = (qc) => {
    if (!qc?.file_path) {
      toast.error('Path file tidak tersedia')
      return
    }

    const fileUrl = `${VITE_SERVER_DATA}/api/v1/upload-service/qc-test-report/stream?path=${encodeURIComponent(
      qc.file_path,
    )}`

    try {
      const newTab = window.open(fileUrl, '_blank')

      if (newTab) {
        toast.success('File berhasil dibuka di tab baru')
      } else {
        toast.error('Tidak dapat membuka tab baru — periksa popup blocker browser kamu')
      }
    } catch (err) {
      console.error('Error membuka file:', err)
      toast.error('Terjadi kesalahan saat membuka file')
    }
  }

  const handleProductDetail = () => {
    if (detail?.product?.sap_code) {
      navigate(`/masterdata/product/detail/${detail.product.sap_code}`)
    } else {
      toast.error('SAP Code tidak tersedia')
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset ke halaman pertama
  }

  // Generate page numbers untuk pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  return (
    <>
      {/* Card Detail */}
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Tracking Detail</strong>
          <CButton color="secondary" size="sm" onClick={() => navigate(-1)}>
            Back
          </CButton>
        </CCardHeader>
        <CCardBody>
          <div className="mb-4 space-y-2">
            <CRow className="mb-3">
              <CCol md={6}>
                <div className="fw-semibold">Tracking ID / SAP Code</div>
                <div>{detail.id} / {detail.product?.sap_code}</div>
              </CCol>
              <CCol md={6}>
                <div className="fw-semibold">PCB Serial Number</div>
                <div>{detail.parentOf?.[0]?.component?.serial_number || '-'}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <div className="fw-semibold">Production Serial Number</div>
                <div>{detail.serial_number || '-'}</div>
              </CCol>
              <CCol md={6}>
                <div className="fw-semibold">PLN Serial Number</div>
                <div>{detail.pln_code || '-'}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <div className="fw-semibold">Item Code</div>
                <div>{detail.code_item || '-'}</div>
              </CCol>
              <CCol md={6}>
                <div className="fw-semibold">Batch</div>
                <div>{detail.batch || '-'}</div>
              </CCol>
            </CRow>

            {/* <CRow className="mb-3">
              <CCol md={6}>
                <div className="fw-semibold">Quantity</div>
                <div>{detail.original_quantity}</div>
              </CCol>
              <CCol md={6}>
                <div className="fw-semibold">Serialized</div>
                <div>{detail.is_serialize ? 'Yes' : 'No'}</div>
              </CCol>
            </CRow> */}

            <CRow className="mb-3">
              <CCol md={6}>
                <div className="fw-semibold">Tracking Type</div>
                <div>{detail.tracking_type || '-'}</div>
              </CCol>
              <CCol md={6}>
                <div className="fw-semibold">Vendor</div>
                <div>{detail.parentOf?.[0]?.component?.product?.supplier?.name || '-'}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <div className="fw-semibold">Created At</div>
                <div>{formatDateTime(detail.created_at)}</div>
              </CCol>
              <CCol md={6}>
                <div className="fw-semibold">Status</div>
                <CBadge color={detail.status === 'delivered' ? 'success' : 'warning'}>
                  {detail.status}
                </CBadge>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <div className="fw-semibold">Detail Product</div>
                <div> <CButton size="sm" color="primary" onClick={handleProductDetail}>Detail</CButton></div>
              </CCol>
              
            </CRow>
          </div>
        </CCardBody>
      </CCard>

      {/* Card QC Results */}
      {detail.qc_results?.length > 0 && (
        <CCard className="mt-4 mb-4">
          <CCardHeader>
            <strong>QC Results <div className="text-muted small">Serial Number : {detail.serial_number || '-'}</div></strong>
          </CCardHeader>
          <CCardBody>
            <CTable bordered className="mb-0">
              <CTableHead>
                <CTableRow>
                  {/* <CTableHeaderCell>Stage</CTableHeaderCell> */}
                  <CTableHeaderCell>Checked At</CTableHeaderCell>
                  <CTableHeaderCell>PIC</CTableHeaderCell>
                  <CTableHeaderCell>Result</CTableHeaderCell>
                  <CTableHeaderCell>Location</CTableHeaderCell>
                  <CTableHeaderCell>Notes</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">View Report</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {paginatedQcResults.map((qc, index) => (
                  <CTableRow key={index}>
                    {/* <CTableDataCell>{qc.qc_name}</CTableDataCell> */}
                    <CTableDataCell>{formatDateTimeUTC(qc.inspection_date)}</CTableDataCell>
                    <CTableDataCell>{qc.inspector_name || '-'}</CTableDataCell>
                    <CTableDataCell
                      className={
                        qc.result === 'PASS'
                          ? 'text-success fw-bold'
                          : qc.result === 'PENDING'
                            ? 'text-warning fw-bold'
                            : 'text-danger fw-bold'
                      }
                    >
                      {qc.result}
                    </CTableDataCell>
                    <CTableDataCell>{qc.qc_place || '-'}</CTableDataCell>
                    <CTableDataCell>{qc.notes || '-'}</CTableDataCell>
                    <CTableDataCell className="text-center">
                      {qc.file_path ? (
                        <CButton
                          color="primary"
                          size="sm"
                          onClick={() => {
                            if (!qc?.file_path) {
                              toast.error('File path not available')
                              return
                            }
                            handleReport(qc)
                          }}
                        >
                          Report
                        </CButton>
                      ) : (
                        '-'
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>

            {/* Pagination Controls - selalu tampil */}
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Rows per page:</span>
                <CFormSelect
                  size="sm"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  style={{ width: 'auto' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </CFormSelect>
                <span className="text-muted small ms-2">
                  Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                </span>
              </div>
              
              <CPagination aria-label="QC Results pagination" size="sm" className="mb-0">
                <CPaginationItem
                  aria-label="First"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(1)}
                >
                  «
                </CPaginationItem>
                <CPaginationItem
                  aria-label="Previous"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ‹
                </CPaginationItem>
                
                {getPageNumbers().map((page, idx) => (
                  <CPaginationItem
                    key={idx}
                    active={page === currentPage}
                    disabled={page === '...'}
                    onClick={() => page !== '...' && handlePageChange(page)}
                  >
                    {page}
                  </CPaginationItem>
                ))}
                
                <CPaginationItem
                  aria-label="Next"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  ›
                </CPaginationItem>
                <CPaginationItem
                  aria-label="Last"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(totalPages)}
                >
                  »
                </CPaginationItem>
              </CPagination>
            </div>
          </CCardBody>
        </CCard>
      )}
    </>
  )
}

export default TrackingDetail
