import React, { useState, useMemo } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CBadge,
  CFormLabel,
  CFormInput,
  CFormCheck,
  CButton,
  CForm,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CFormSwitch,
} from '@coreui/react'

const FormRow = ({ label, children }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={4}>
      <CFormLabel className="fw-semibold">{label}</CFormLabel>
    </CCol>
    <CCol md={8}>{children}</CCol>
  </CRow>
)

const CounterCard = ({ title, value }) => (
  <CCol md={6}>
    {' '}
    <CCard className="mb-3">
      <CCardBody>
        <h6 className="text-muted">{title}</h6>
        <h4>{value}</h4>
      </CCardBody>
    </CCard>
  </CCol>
)

const AqlUnits = () => {
  const [partner_barcode, setPartnerBarcode] = useState('')
  const [inspected_by, setInspectedBy] = useState('')
  const [answers, setAnswers] = useState({})

  // Dummy data untuk scanningItem
  const [scanningItem] = useState({
    itemName: 'Produk ABC',
    expectedQuantity: 50,
    remainingStage: 20,
    totalStaged: 12,
    serialNumbers: Array.from({ length: 12 }, (_, i) => ({
      serial_number: `SN-${i + 1}`,
      created_at: new Date().toISOString(),
    })),
  })

  const [formData, setFormData] = useState({ serialNumber: '' })
  const [isFormLocked] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSerial = () => {
    console.log('Serial Number di-scan:', formData.serialNumber)
    setFormData({ ...formData, serialNumber: '' })
  }

  const [questionData] = useState([
    {
      id: 1,
      title: 'Pemeriksaan Visual',
      questions: [
        { id: 101, question: 'Apakah ada goresan pada produk?' },
        { id: 102, question: 'Apakah warna sesuai spesifikasi?' },
      ],
    },
    {
      id: 2,
      title: 'Pemeriksaan Fungsional',
      questions: [
        { id: 201, question: 'Apakah semua tombol berfungsi?' },
        { id: 202, question: 'Apakah produk menyala dengan benar?' },
      ],
    },
  ])

  const data = {
    po_number: 'PO-2025-001',
    batch: 'BATCH-01',
    status: 'pending',
    inspection_level: 'Level II',
    aql_critical: 0.65,
    aql_major: 1.5,
    aql_minor: 2.5,
    total_quantity: 1200,
    used_defects: 5,
    sample_size: 80,
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <CBadge color="warning">Pending</CBadge>
      case 'complete':
        return <CBadge color="success">Complete</CBadge>
      case 'reject':
        return <CBadge color="danger">Reject</CBadge>
      default:
        return <CBadge color="secondary">{status}</CBadge>
    }
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target
    if (name === 'partner_barcode') setPartnerBarcode(value)
    else if (name === 'inspected_by') setInspectedBy(value)
    else if (type === 'radio') {
      setAnswers((prev) => ({
        ...prev,
        [name.split('-')[1]]: value === 'true',
      }))
    }
  }

  const paginatedSerialNumbers = useMemo(() => {
    if (!scanningItem?.serialNumbers) return []
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return scanningItem.serialNumbers.slice(startIndex, endIndex)
  }, [scanningItem, currentPage])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ partner_barcode, inspected_by, answers })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CRow className="g-4 mb-4">
          {/* Scan Serial Number */}
          <CCol md={6}>
            <CCard className="mb-4 h-100">
              <CCardHeader>
                <strong>Scan Serial Number : {scanningItem.itemName || '-'}</strong>
              </CCardHeader>
              <CCardBody>
                <FormRow label="Serial Number">
                  <CFormInput
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSerial()
                      }
                    }}
                    disabled={isFormLocked}
                  />
                </FormRow>
                <CCol md={6}>
                  <FormRow label="Serial Number">
                    <CFormInput
                      name="serialNumber213"
                      value={formData.serialNumber}
                      onChange={handleInput}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSerial()
                        }
                      }}
                      disabled={isFormLocked}
                    />
                  </FormRow>
                  <FormRow label="Serial Number123">
                    <CFormInput
                      name="serialNumber213"
                      value={formData.serialNumber}
                      onChange={handleInput}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSerial()
                        }
                      }}
                      disabled={isFormLocked}
                    />
                  </FormRow>
                </CCol>

                <FormRow label="Counter"></FormRow>
                <CRow className="mb-3">
                  <CounterCard title="Expected Quantity" value={scanningItem.expectedQuantity} />
                  <CounterCard title="Expected Quantity" value={scanningItem.expectedQuantity} />
                  <CounterCard title="Remaining Quantity" value={scanningItem.remainingStage} />
                  <CounterCard title="Remaining Quantity" value={scanningItem.remainingStage} />
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>

          {/* Detail */}
          <CCol md={6}>
            <CCard className="mb-4 h-100">
              <CCardHeader>
                <strong>Detail</strong>
              </CCardHeader>
              <CCardBody>
                <FormRow label="Product Detail :"></FormRow>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <div className="fw-semibold">PO Number</div>
                    <div>{data.po_number}</div>
                  </CCol>
                  <CCol md={6}>
                    <div className="fw-semibold">Batch</div>
                    <div>{data.batch}</div>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <div className="fw-semibold">Status</div>
                    <div>{getStatusBadge(data.status)}</div>
                  </CCol>
                </CRow>
                <FormRow label="AQL Setting :"></FormRow>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <div className="fw-semibold">Inspection Level</div>
                    <div>{data.inspection_level}</div>
                  </CCol>
                  <CCol md={6}>
                    <div className="fw-semibold">AQL Major</div>
                    <div>{data.aql_major}</div>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <div className="fw-semibold">Used Defects</div>
                    <div>{data.used_defects}</div>
                  </CCol>
                  <CCol md={6}>
                    <div className="fw-semibold">Sample Size</div>
                    <div>{data.sample_size}</div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CCol>

      {/* Details */}
      <CCol xs={12} hidden>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Details</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <div className="fw-semibold">PO Number</div>
                <div>{data.po_number}</div>
              </CCol>
              <CCol md={6}>
                <div className="fw-semibold">Batch</div>
                <div>{data.batch}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <div className="fw-semibold">Status</div>
                <div>{getStatusBadge(data.status)}</div>
              </CCol>
              <CCol md={6}>
                <div className="fw-semibold">Inspection Level</div>
                <div>{data.inspection_level}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <div className="fw-semibold">AQL Minor</div>
                <div>{data.aql_minor}</div>
              </CCol>
              <CCol md={6}>
                <div className="fw-semibold">Total Quantity</div>
                <div>{data.total_quantity}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <div className="fw-semibold">Used Defects</div>
                <div>{data.used_defects}</div>
              </CCol>
              <CCol md={6}>
                <div className="fw-semibold">Sample Size</div>
                <div>{data.sample_size}</div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Quality Control Assembly */}
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Quality Control</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              {questionData.length === 0 ? (
                <p className="text-muted">Pertanyaan belum tersedia...</p>
              ) : (
                questionData.map((section) => (
                  <div key={section.id}>
                    <CFormLabel className="col-form-label mt-3">
                      <strong>{section.title}</strong>
                    </CFormLabel>
                    {section.questions.map((q) => (
                      <div
                        key={q.id}
                        className="border rounded p-3 mb-3 d-flex align-items-center justify-content-between"
                      >
                        {/* Pertanyaan di kiri */}
                        <CFormLabel className="mb-0">{q.question}</CFormLabel>

                        {/* Switch di kanan */}
                        <CFormSwitch
                          name={`question-${q.id}`}
                          label={answers[q.id] ? 'Ya' : 'Tidak'}
                          checked={answers[q.id] === true}
                          onChange={(e) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [q.id]: e.target.checked,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                ))
              )}
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <CButton color="primary" type="submit">
                  Submit
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AqlUnits
