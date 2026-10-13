import React, { useState, useRef, useEffect } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { backendQc } from '../../api/axios'
import { toast } from 'react-toastify'

const FormRow = ({ label, children }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={4}>
      <CFormLabel className="fw-semibold">{label}</CFormLabel>
    </CCol>
    <CCol md={8}>{children}</CCol>
  </CRow>
)

const formatDateTimeId = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'medium',
  })
}

const QcAdmin = () => {
  const serialInputRef = useRef(null)
  const [serialNumber, setSerialNumber] = useState('')
  const [qcPlacement, setQcPlacement] = useState('')
  const [notes, setNotes] = useState('')
  const [inspectionDetails, setInspectionDetails] = useState([])
  const [placementOptions, setPlacementOptions] = useState([])

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    serialInputRef.current?.focus()
    const fetchPlacementList = async () => {
      try {
        const { data } = await backendQc.get('/qc-placement/list')
        const items = data?.data || data || []
        if (Array.isArray(items)) {
          setPlacementOptions(items)
        }
      } catch (err) {
        console.error('Failed to fetch placement list:', err)
      }
    }
    fetchPlacementList()
  }, [])

  const clearSerialNumber = () => {
    setInspectionDetails([])
    setCurrentPage(1)
    toast.info('The Serial Number data has been reset..')
    setTimeout(() => serialInputRef.current?.focus(), 0)
  }

  const handleSubmitProcess = async () => {
    const serials = inspectionDetails.map((d) => d.serial_number).filter(Boolean)
    if (serials.length === 0) {
      toast.warning('Belum ada serial yang di-scan.')
      return
    }
    if (!qcPlacement) {
      toast.warning('Pilih QC Placement terlebih dahulu.')
      return
    }
    try {
      const { data: body } = await backendQc.post('/qc-placement/remove1', {
        serial_numbers: serials,
        qc_id: qcPlacement,
        note: notes || '',
      })
      toast.success(body?.message || 'Submit process berhasil.')
      setInspectionDetails([])
      setCurrentPage(1)
      setQcPlacement('')
      setNotes('')
      setSerialNumber('')
      setTimeout(() => serialInputRef.current?.focus(), 0)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal submit process.')
    }
  }

  const getPlacementSerial = async (serial) => {
    try {
      const response = await backendQc.get('/qc-placement/preview', {
        params: { serial_numbers: serial },
      })
      return response.data
    } catch (err) {
      console.error('getPlacementSerial error:', err)
      return null
    }
  }

  const handleSerial = async () => {
    const serial = serialNumber.trim()
    if (!serial) return

    try {
      const placementData = await getPlacementSerial(serial)
      const placementItems = placementData?.data || []

      if (Array.isArray(placementItems) && placementItems.length > 0) {
        setInspectionDetails((prev) => {
          const existingSerials = new Set(prev.map((d) => d.serial_number))
          const newItems = placementItems
            .filter((item) => !existingSerials.has(item.serial_number))
            .map((item) => ({
              serial_number: item.serial_number,
              last_qc: item.last_qc || null,
            }))
          return [...prev, ...newItems]
        })
        toast.success('Data placement berhasil dimuat.')
      } else {
        toast.warning('Data placement tidak ditemukan untuk serial ini.')
      }

      setSerialNumber('')
    } catch (err) {
      setSerialNumber('')
      toast.error(err.response?.data?.message || 'Gagal mengambil data placement.')
      setTimeout(() => serialInputRef.current?.focus(), 0)
    }
  }

  const paginatedDetails = inspectionDetails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  return (
    <CRow>
      {/* Scan Product Serial Number */}
      <CCol md={6}>
        <CCard className="mb-4 h-100">
          <CCardHeader>
            <strong>QC Placement Admin</strong>
          </CCardHeader>
          <CCardBody className="d-flex flex-column h-100">
            
            <FormRow label="Product Serial Number">
              <CFormInput
                ref={serialInputRef}
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSerial()
                  }
                }}
              />
            </FormRow>

            <FormRow label="QC Placement">
              <CFormSelect
                value={qcPlacement}
                onChange={(e) => setQcPlacement(e.target.value)}
              >
                <option value="">Pilih placement</option>
                {placementOptions.map((opt) => (
                  <option key={opt.qc_id} value={opt.qc_id}>
                    {opt.qc_name}
                  </option>
                ))}
              </CFormSelect>
            </FormRow>
            <FormRow label="Notes">
              <CFormInput
                type="text"
                value={notes}
                placeholder="Masukkan catatan"
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormRow>

            <div className="mt-auto d-flex justify-content-end pt-3">
              <CButton
                color="success"
                className="text-white"
                onClick={handleSubmitProcess}
                disabled={inspectionDetails.length === 0 || !qcPlacement}
              >
                Submit Process
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Tabel Inspection Details */}
      <CCol md={6}>
        <CCard className="mb-4 h-100">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>
              Total Items 
            </strong>
            <div className="d-flex gap-2">
              <CButton
                color="warning"
                size="sm"
                className="text-white"
                onClick={clearSerialNumber}
                disabled={inspectionDetails.length === 0}
              >
                Clear Serial Number
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody className="d-flex flex-column">
            <div className="flex-grow-1 overflow-auto">
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>No</CTableHeaderCell>
                    <CTableHeaderCell>Serial Number</CTableHeaderCell>
                    <CTableHeaderCell>Last QC</CTableHeaderCell>
                    <CTableHeaderCell>Result</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {paginatedDetails.map((item, index) => (
                    <CTableRow key={(currentPage - 1) * itemsPerPage + index}>
                      <CTableDataCell>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </CTableDataCell>
                      <CTableDataCell>{item.serial_number}</CTableDataCell>
                      <CTableDataCell>
                        {item.last_qc ? (
                          <div>
                            <div className="fw-semibold">{item.last_qc.qc_name || '-'}</div>
                            <small className="text-muted">
                              {formatDateTimeId(item.last_qc.inspection_date)}
                            </small>
                          </div>
                        ) : (
                          '-'
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        {item.last_qc?.result ? (
                          <CBadge
                            color={item.last_qc.result === 'PASS' ? 'success' : 'danger'}
                          >
                            {item.last_qc.result}
                          </CBadge>
                        ) : (
                          '-'
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
            <div className="d-flex justify-content-end mt-3">
              <CPagination>
                <CPaginationItem
                  className="cursor-pointer"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Previous
                </CPaginationItem>
                {Array.from({
                  length: Math.ceil(inspectionDetails.length / itemsPerPage),
                }).map((_, i) => (
                  <CPaginationItem
                    key={i}
                    className="cursor-pointer"
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}
                <CPaginationItem
                  className="cursor-pointer"
                  disabled={currentPage === Math.ceil(inspectionDetails.length / itemsPerPage)}
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
  )
}

export default QcAdmin
