import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { backendTracking, backendQc } from '../../api/axios'
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
  CFormLabel,
  CForm,
  CFormSwitch,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { CounterCard6 } from '../components/CounterCard'

const FormRow = ({ label, children }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={4}>
      <CFormLabel className="fw-semibold">{label}</CFormLabel>
    </CCol>
    <CCol md={8}>{children}</CCol>
  </CRow>
)

const DetailNonSerialQc = () => {
  const { trackingId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  const [inspectionSummary, setInspectionSummary] = useState(null)
  const [aqlConfiguration, setAqlConfig] = useState(null)
  const [answers, setAnswers] = useState({})
  const [qcName, setQcName] = useState([])
  const [questionData, setQuestionData] = useState([])
  const [isQcValid, setIsQcValid] = useState(false)

  //tambahan
  const [formData, setFormData] = useState({ notes: '' })
  const [qcIdReceivingSerial, setQcIdReceivingSerial] = useState(null)

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

  const fetchTrackingSumary = useCallback(
    async (receivingItemId, qcProduct) => {
      try {
        const response = await backendTracking.get('/sample-inspections/aql-summary', {
          params: {
            receiving_item_id: receivingItemId,
            qc_id: qcProduct,
          },
        })

        const summary = response.data.data.inspection_summary
        const aql_config = response.data.data.aql_configuration
        const qcId = response.data.data.qc_id
        setInspectionSummary(summary)
        setAqlConfig(aql_config)
        setQcIdReceivingSerial(qcId)

        if (summary.remaining_samples <= 0) {
          toast.error(
            <span>
              <span style={{ color: 'red', fontWeight: 'bold' }}>NO MORE SAMPLES REQUIRED !</span>
            </span>,
          )
          setQuestionData([])
          setIsQcValid(false)
        } else {
          fetchValidationQc(trackingId, qcId)
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed Validation')
      }
    },
    [trackingId],
  )

  const fetchValidationQc = async (trackingId, qcId) => {
    try {
      const response = await backendQc.get('/validation-noserial', {
        params: {
          tracking_id: trackingId,
          qc_id: qcId,
        },
      })

      if (response.data.valid === true) {
        setIsQcValid(true) // QC valid → tombol Submit bisa muncul

        // Convert object questions → array
        const convertedQuestions = Object.entries(response.data.questions).map(([id, text]) => ({
          id: Number(id),
          question: text,
        }))

        setQcName(response.data.category)
        setQuestionData(convertedQuestions)

        const initialAnswers = {}
        convertedQuestions.forEach((q) => {
          initialAnswers[q.id] = true
        })
        setAnswers(initialAnswers)
      } else {
        setIsQcValid(false) // QC invalid → sembunyikan tombol
        toast.error(response.data.message ?? 'QC CANT CONTINUE')
      }
    } catch (error) {
      setIsQcValid(false) // Error → sembunyikan tombol juga
      console.log('ERROR')
      toast.error(error.response?.data?.message || 'QCValidation Failed')
    }
  }
  const fetchDetail = useCallback(async () => {
    setLoading(true)
    try {
      const response = await backendTracking.get(`/${trackingId}`)
      setDetail(response.data.data)

      const receivingItemId = response.data.data.receiving_item_id
      const qcProduct = response.data.data.product.qc_product

      fetchTrackingSumary(receivingItemId, qcProduct)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch QC Non Serial Detail')
    } finally {
      setLoading(false)
    }
  }, [trackingId, fetchTrackingSumary]) // dependensi ditambah

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <CCard className="text-center p-4 shadow-sm">
          <CCardBody>
            <div className="mb-3">
              <i
                className="bi bi-exclamation-triangle text-warning"
                style={{ fontSize: '2rem' }}
              ></i>
            </div>
            <h5 className="fw-bold">Data Not Found</h5>
            <p className="text-muted">The requested tracking detail could not be loaded.</p>
            <CButton color="secondary" onClick={() => navigate(-1)}>
              Back
            </CButton>
          </CCardBody>
        </CCard>
      </div>
    )
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const ss = String(date.getSeconds()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
  }

  // const handleSubmit = async (e) => {
  //   e.preventDefault()
  // }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!detail) {
      toast.error('Product data not found')
      return
    }

    // Validasi user
    if (!user || !user.id || !user.name) {
      toast.error('User tidak ditemukan di localStorage, silakan login kembali!')
      return
    }

    const payload = {
      inspector_by: user.id,
      inspector_name: user.name,
      qc_name: qcName,
      qc_id: qcIdReceivingSerial,
      receiving_item_id: detail.receiving_item_id,
      qc_place: 'Receiving',
      tracking_id: detail.id,
      batch: detail.batch,
      notes: formData.notes,
      answers,
    }

    // console.log('payload : ', payload)
    try {
      const res = await backendQc.post('/submit/noserial', payload)
      const qcStatus = res.data?.data?.qcStatus ?? ''

      toast.success(
        <span>
          {res.data?.message ?? ''}. QC Status :{' '}
          <span style={{ color: qcStatus === 'FAIL' ? 'red' : 'green' }}>{qcStatus}</span>
        </span>,
      )

      // Reset jawaban & catatan
      const resetAnswers = {}
      questionData.forEach((q) => {
        resetAnswers[q.id] = false
      })
      setAnswers(resetAnswers)
      setFormData({ notes: '' })

      // Fetch ulang summary agar data remaining sample selalu up to date
      fetchTrackingSumary(detail.receiving_item_id, detail?.product?.qc_product)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to submit QC')
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CRow className="g-4 mb-4">
          {/* Left card - Product & Counter */}
          <CCol md={6}>
            <CCard className="mb-4 h-100">
              <CCardHeader>
                <strong>Product Name : {detail?.product?.name || '-'}</strong>
              </CCardHeader>
              <CCardBody>
                <FormRow label="Counter"></FormRow>
                <CRow className="mb-3">
                  <CounterCard6
                    title="Required Sample"
                    value={inspectionSummary?.required_sample ?? '-'}
                  />
                  <CounterCard6
                    title="Remaining Samples"
                    value={inspectionSummary?.remaining_samples ?? '-'}
                  />
                  <CounterCard6 title="Max Fail" value={aqlConfiguration?.aql_accept ?? '-'} />
                  <CounterCard6 title="Fail Count" value={inspectionSummary?.fail_count ?? '-'} />
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>

          {/* Right card - QC detail */}
          <CCol md={6}>
            <CCard className="mb-4 h-100">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <strong>Receiving QC : {detail?.product?.name || 'Non Serial'} Detail</strong>
                <CButton color="secondary" size="sm" onClick={() => navigate(-1)}>
                  Back
                </CButton>
              </CCardHeader>
              <CCardBody>
                <div className="mb-4 space-y-2">
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <div className="fw-semibold">ID</div>
                      <div>{detail.id}</div>
                    </CCol>
                    <CCol md={6}>
                      <div className="fw-semibold">QC Product</div>
                      <div>{detail?.product?.qc_product || '-'}</div>
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

                  <CRow className="mb-3">
                    <CCol md={6}>
                      <div className="fw-semibold">Quantity</div>
                      <div>{detail.original_quantity}</div>
                    </CCol>
                    <CCol md={6}>
                      <div className="fw-semibold">Serialized</div>
                      <div>{detail.is_serialize ? 'Yes' : 'No'}</div>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={6}>
                      <div className="fw-semibold">Tracking Type</div>
                      <div>{detail.tracking_type || '-'}</div>
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
                      <div className="fw-semibold">Created At</div>
                      <div>{formatDateTime(detail.created_at)}</div>
                    </CCol>
                  </CRow>
                </div>

                {/* QC Results */}
                {/* {detail.qc_results?.length > 0 && (
                  <>
                    <h5 className="mb-3">
                      <b>QC Results</b>
                    </h5>
                    <CTable bordered>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Stage</CTableHeaderCell>
                          <CTableHeaderCell>Checked At</CTableHeaderCell>
                          <CTableHeaderCell>PIC</CTableHeaderCell>
                          <CTableHeaderCell>Result</CTableHeaderCell>
                          <CTableHeaderCell>Location</CTableHeaderCell>
                          <CTableHeaderCell>Notes</CTableHeaderCell>
                          <CTableHeaderCell>Download Report</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {detail.qc_results.map((qc, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell>{qc.qc_name}</CTableDataCell>
                            <CTableDataCell>
                              {new Date(qc.created_at).toLocaleString()}
                            </CTableDataCell>
                            <CTableDataCell>{qc.pic || '-'}</CTableDataCell>
                            <CTableDataCell
                              className={
                                qc.result === 'PASS'
                                  ? 'text-success fw-bold'
                                  : 'text-danger fw-bold'
                              }
                            >
                              {qc.result}
                            </CTableDataCell>
                            <CTableDataCell>{qc.qc_place}</CTableDataCell>
                            <CTableDataCell>{qc.notes}</CTableDataCell>
                            <CTableDataCell>{'-'}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </>
                )} */}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CCol>

      {/* Quality Control Question */}
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Quality Control</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              {questionData.length === 0 ? (
                <p className="text-muted">Questions not yet available...</p>
              ) : (
                questionData.map((q) => {
                  const isYes = answers[q.id] === true // memastikan boolean

                  return (
                    <div
                      key={q.id}
                      className="border rounded p-3 mb-3 d-flex align-items-center justify-content-between"
                    >
                      <CFormLabel className="mb-0">{q.question}</CFormLabel>
                      <CFormSwitch
                        name={`question-${q.id}`}
                        label={answers[q.id] ? 'Ya' : 'Tidak'}
                        checked={!!answers[q.id]}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [q.id]: e.target.checked, // true kalau on, false kalau off
                          }))
                        }
                      />
                    </div>
                  )
                })
              )}
              {isQcValid && (
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <CButton color="primary" type="submit">
                    Submit
                  </CButton>
                </div>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default DetailNonSerialQc
