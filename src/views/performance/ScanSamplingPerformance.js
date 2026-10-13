import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CButton,
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
} from '@coreui/react'

import { CounterCard6 } from '../components/CounterCard'
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

const ScanBeforePerformance = () => {
  // Mengambil qc_id dari URL parameter yang dikirim dari _nav.js dan routes.js
  const { qcIdParams, qcNameParams, qcPlaceParams } = useParams()
  
  const [serialNumber, setSerialNumber] = useState('')

  const [inspectionSummary, setInspectionSummary] = useState({
    total_items: '-',
    required_sample: '-',
    total_inspected: '-',
    remaining_samples: '-',
    pass_count: '-',
    fail_count: '-',
    completion_percentage: '-',
    defect_rate: '-',
  })
  const [inspectionDetails, setInspectionDetails] = useState([])

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handleSerial = async () => {
    if (!serialNumber.trim()) return

    try {
      const payload = {
        inspector_by: 4,
        serial_number: serialNumber,
        qc_id: qcIdParams, // qc_id diambil dari URL parameter
      }

      const response = await backendQc.post('/validation', payload)
      const data = response.data

      if (data.valid === true) {
        toast.success(data?.message || 'Scan berhasil!')

        setInspectionSummary(data.inspection_summary)
        setInspectionDetails((prev) => {
          const newDetails = data.inspection_details || []

          // buat map lama
          const map = new Map(prev.map((item) => [item.serial_number, item]))

          // update/replace dengan data baru
          newDetails.forEach((item) => {
            map.set(item.serial_number, item)
          })

          return Array.from(map.values())
        })
      } else if (data.valid === false) {
        toast.error(data?.message || 'Scan gagal!')
      }
      // reset input serial number
      setSerialNumber('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal validasi serial number!')
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
            <strong>{qcNameParams || 'QC Performance Test Sample'}</strong>
            <div className="small text-muted">{qcPlaceParams} - Sampling Unit</div>
          </CCardHeader>
          <CCardBody>
            <FormRow label="Product Serial Number">
              <CFormInput
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

            {/* Counter dari inspection_summary */}
            {inspectionSummary && (
              <div className="mt-3">
                <FormRow label="Inspection Summary" />
                <CRow className="mb-3">
                  <CounterCard6 title="Total Items" value={inspectionSummary.total_items} />
                  <CounterCard6 title="Required Sample" value={inspectionSummary.required_sample} />
                  <CounterCard6 title="Scanned Sample" value={inspectionSummary.total_inspected} />
                  <CounterCard6 title="Remaining" value={inspectionSummary.remaining_samples} />
                  {/* <CounterCard6 title="Pass Count" value={inspectionSummary.pass_count} />
                  <CounterCard6 title="Fail Count" value={inspectionSummary.fail_count} />
                  <CounterCard6
                    title="Completion %"
                    value={inspectionSummary.completion_percentage + '%'}
                  />
                  <CounterCard6 title="Defect Rate" value={inspectionSummary.defect_rate + '%'} /> */}
                </CRow>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Tabel Inspection Details */}
      <CCol md={6}>
        <CCard className="mb-4 h-100">
          <CCardHeader>
            <strong>Inspection Details || Total: {inspectionDetails.length}</strong>
          </CCardHeader>
          <CCardBody className="d-flex flex-column">
            <div className="flex-grow-1 overflow-auto">
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>No</CTableHeaderCell>
                    <CTableHeaderCell>Serial Number</CTableHeaderCell>
                    <CTableHeaderCell>Code Item</CTableHeaderCell>
                    <CTableHeaderCell>Inspection Count</CTableHeaderCell>
                    {/* <CTableHeaderCell>Result</CTableHeaderCell> */}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {paginatedDetails.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </CTableDataCell>
                      <CTableDataCell>{item.serial_number}</CTableDataCell>
                      <CTableDataCell>{item.code_item}</CTableDataCell>
                      <CTableDataCell>{item.inspection_count}</CTableDataCell>
                      <CTableDataCell>{item.qc_results?.[0]?.result || '-'}</CTableDataCell>
                    </CTableRow>
                  ))}
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
                {Array.from({
                  length: Math.ceil(inspectionDetails.length / itemsPerPage),
                }).map((_, i) => (
                  <CPaginationItem
                    key={i}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}
                <CPaginationItem
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

export default ScanBeforePerformance
