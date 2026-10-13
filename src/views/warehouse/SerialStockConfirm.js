import React, { useState, useRef, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
  CButton,
  CButtonGroup,
} from '@coreui/react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { backendWhNew } from '../../api/axios'
import { CounterCard6 } from '../components/CounterCard'

const FormRow = ({ label, children }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={4}>
      <CFormLabel className="fw-semibold">{label}</CFormLabel>
    </CCol>
    <CCol md={8}>{children}</CCol>
  </CRow>
)

const WarehouseScanUI = () => {
  const [serialNumber, setSerialNumber] = useState('')
  const [processedTransaction, setProcessed] = useState(null)
  const [serials, setSerials] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [mode, setMode] = useState('incoming') // default: incoming
  const itemsPerPage = 5
  const scanPrev = useRef('')
  const inputRef = useRef(null) // ref untuk input serial

  // fokus otomatis waktu pertama kali load page
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // scan serial
  const handleSerial = async () => {
    if (!serialNumber.trim()) return

    if (scanPrev.current !== serialNumber) {
      scanPrev.current = serialNumber
      try {
        const endpoint =
          mode === 'incoming'
            ? '/stock-transactions/update-from-pending'
            : '/stock-transactions/scan-out-reserved'

        const scanRes = await backendWhNew.post(endpoint, {
          serial_number: serialNumber,
          performed_by: 1,
        })

        if (scanRes.data.success) {
          toast.success(scanRes.data.message ?? 'Serial scanned successfully')

          const summaryData =
            mode === 'incoming'
              ? scanRes.data.data.processed_transaction
              : scanRes.data.data.out_transaction

          setProcessed(summaryData)
          setSerials(scanRes.data.data.latest_transactions || [])
        } else {
          toast.error(scanRes.data.message ?? 'Scan failed')
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Scan failed')
      } finally {
        setSerialNumber('')
        inputRef.current?.focus()
      }
    } else {
      toast.error('Serial Number Has Been Scanned')
    }
  }

  const paginatedSerials = serials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  return (
    <CRow>
      {/* Pilihan Mode */}
      <CCol md={12} className="mb-4">
        <CButtonGroup>
          <CButton
            color={mode === 'incoming' ? 'primary' : 'secondary'}
            onClick={() => {
              setMode('incoming')
              setSerials([])
              setProcessed(null)
              setSerialNumber('')
              scanPrev.current = ''
              inputRef.current?.focus()
            }}
          >
            Incoming
          </CButton>
          <CButton
            color={mode === 'outgoing' ? 'primary' : 'secondary'}
            onClick={() => {
              setMode('outgoing')
              setSerials([])
              setProcessed(null)
              setSerialNumber('')
              scanPrev.current = ''
              inputRef.current?.focus()
            }}
          >
            Outgoing
          </CButton>
        </CButtonGroup>
      </CCol>

      {/* Scan */}
      <CCol md={12} className="mb-4">
        <CCard className="h-100">
          <CCardHeader>
            <strong>Warehouse Scan ({mode})</strong>
          </CCardHeader>
          <CCardBody>
            <FormRow label="Serial Number">
              <CFormInput
                ref={inputRef}
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSerial()
                  }
                }}
                placeholder={`Scan Serial Number (${mode})`}
              />
            </FormRow>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Summary */}
      <CCol md={12} className="mb-4">
        <CCard className="h-100">
          <CCardHeader>
            <strong>Scan Summary</strong>
          </CCardHeader>
          <CCardBody>
            <div className="mt-3">
              {mode === 'incoming' ? (
                <>
                  <FormRow label="Counter (Incoming)" />
                  {processedTransaction ? (
                    <CRow className="mb-3">
                      <CounterCard6
                        title="Processed Quantity"
                        value={processedTransaction.quantity_processed}
                      />
                      <CounterCard6
                        title="Remaining Quantity"
                        value={processedTransaction.remaining_pending_quantity}
                      />
                    </CRow>
                  ) : (
                    <CRow className="mb-3">
                      <CounterCard6 title="Processed Quantity" value={'No Data'} />
                      <CounterCard6 title="Remaining Quantity" value={'No Data'} />
                    </CRow>
                  )}
                </>
              ) : (
                <>
                  <FormRow label="Counter (Outgoing)" />
                  {processedTransaction ? (
                    <CRow className="mb-3">
                      <CounterCard6
                        title="Current Quantity"
                        value={processedTransaction.current_quantity}
                      />
                      <CounterCard6
                        title="Current Reserved"
                        value={processedTransaction.current_reserved}
                      />
                    </CRow>
                  ) : (
                    <CRow className="mb-3">
                      <CounterCard6 title="Current Quantity" value={'No Data'} />
                      <CounterCard6 title="Current Reserved" value={'No Data'} />
                    </CRow>
                  )}
                </>
              )}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Tabel Transactions */}
      <CCol md={12}>
        <CCard className="h-100">
          <CCardHeader>
            <strong>
              Latest Transactions {serials.length > 0 ? `|| Total: ${serials.length}` : ''}
            </strong>
          </CCardHeader>
          <CCardBody className="d-flex flex-column">
            <div className="flex-grow-1 overflow-auto">
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>No</CTableHeaderCell>
                    <CTableHeaderCell>Serial Number</CTableHeaderCell>
                    <CTableHeaderCell>Movement Type</CTableHeaderCell>
                    <CTableHeaderCell>Quantity</CTableHeaderCell>
                    <CTableHeaderCell>Movement Date</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {paginatedSerials.length > 0 ? (
                    paginatedSerials.map((txn, idx) => (
                      <CTableRow key={txn.id}>
                        <CTableDataCell>
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </CTableDataCell>
                        <CTableDataCell>{txn.serial_number}</CTableDataCell>
                        <CTableDataCell>{txn.movement_type}</CTableDataCell>
                        <CTableDataCell>{txn.quantity}</CTableDataCell>
                        <CTableDataCell>
                          {new Date(txn.movement_date).toLocaleString()}
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={5} className="text-center text-muted">
                        No transactions yet...
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>
            <div className="d-flex justify-content-end mt-3">
              <CPagination>
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Previous
                </CPaginationItem>
                {Array.from({ length: Math.ceil(serials.length / itemsPerPage) }).map((_, i) => (
                  <CPaginationItem
                    key={i}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}
                <CPaginationItem
                  disabled={currentPage === Math.ceil(serials.length / itemsPerPage)}
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

export default WarehouseScanUI
