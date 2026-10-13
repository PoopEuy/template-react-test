import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CBadge,
  CFormLabel,
  CFormInput,
  CButton,
  CForm,
  CFormTextarea,
  CFormSwitch,
} from '@coreui/react'

import { backendQc, backendTracking } from '../../../api/axios'
import { toast } from 'react-toastify'
import { CounterCard6 } from '../../components/CounterCard'

const FormRow = ({ label, children }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={4}>
      <CFormLabel className="fw-semibold">{label}</CFormLabel>
    </CCol>
    <CCol md={8}>{children}</CCol>
  </CRow>
)

const QcSerialNoAql = () => {
  const { qcIdParams } = useParams()
  const [productData, setProductData] = useState(null)
  const [trackingProduct, setTrackingProduct] = useState(null)
  const [answers, setAnswers] = useState({})
  const [questionData, setQuestionData] = useState([])
  const [qcName, setQcName] = useState([])
  const qcCodeSerial = qcIdParams
  const inspected_by = 'ADMIN_RECEIVING'
  const [formData, setFormData] = useState({ serialNumber: '' })
  const [isFormLocked] = useState(false)
  const serialNumberInputRef = useRef(null)
  const resetStates = () => {
    setProductData(null)
    setTrackingProduct(null)
    setQuestionData([])
    setAnswers({})
    setFormData({ serialNumber: '', notes: '' })
  }

  useEffect(() => {
    resetStates()
    serialNumberInputRef.current.focus()
    console.clear()
  }, [qcIdParams])

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSerial = () => {
    resetStates()

    // Panggil fetch validasi serial
    fetchValidationSnumb(formData.serialNumber)

    // Reset input serial number
    // setFormData({ serialNumber: '' })
  }

  // Fetch validation serial number
  const fetchValidationSnumb = async (serialNumber) => {
    try {
      const response = await backendQc.get('/validation', {
        params: {
          serial_number: serialNumber,
          qc_id: qcCodeSerial,
        },
      })

      if (response.data.valid === true) {
        // toast.success(response.data.message ?? 'Serial number valid')

        // Convert object questions → array
        const convertedQuestions = Object.entries(response.data.questions).map(([id, text]) => ({
          id: Number(id),
          question: text,
        }))

        // Simpan ke state
        setQcName(response.data.category)
        setQuestionData(convertedQuestions)

        // inisialisasi semua jawaban default ke true
        const initialAnswers = {}
        convertedQuestions.forEach((q) => {
          initialAnswers[q.id] = true
        })
        setAnswers(initialAnswers)

        // Ambil product
        fetchProduct(serialNumber)
      } else {
        toast.error(response.data.message ?? 'Serial number already scan')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Serial Number Validation Failed')
    }
  }

  const fetchProduct = async (serialNumber) => {
    try {
      const response = await backendTracking.get(`/serial/${serialNumber}`)

      if (response.data.success == true) {
        // toast.success(response.data.message || 'Serial number valid')
        setProductData(response.data.data)

        // isi kembali serial number di form
        setFormData((prev) => ({
          ...prev,
          serialNumber: serialNumber,
        }))

        const assemblyId = response.data.data.assembly_id

        fetchTrackingProduct(assemblyId)
      } else {
        toast.error(response.data.message || 'Failed get product data')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'ERROR get data product')
    }
  }

  const fetchTrackingProduct = async (assemblyId) => {
    try {
      const response = await backendTracking.get('/sample-inspections/quantity-summary', {
        params: {
          assembly_id: assemblyId,
          qc_id: qcCodeSerial, //cek kembali ini nanti
        },
      })
      const remainingSample = response.data.data.quantity_summary.remaining_quantity

      if (remainingSample <= 0) {
        toast.error(
          <span>
            <span style={{ color: 'red', fontWeight: 'bold' }}> SAMPLE SUDAH CUKUP !!</span>
          </span>,
        )
        //Besihkan page
        resetStates()
      } else {
        setTrackingProduct(response.data.data)
        const baseMessage = response.data?.message ?? ''

        toast.success(
          <span>
            {baseMessage || ''} -{' '}
            <span style={{ color: 'green', fontWeight: 'bold' }}> LANJUT QC</span>
          </span>,
        )
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Failed Validation')
    }
  }

  // const [questionData] = useState([
  //   {
  //     id: 1,
  //     title: 'Pemeriksaan Visual',
  //     questions: [
  //       { id: 101, question: 'Apakah ada goresan pada produk?' },
  //       { id: 102, question: 'Apakah warna sesuai spesifikasi?' },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     title: 'Pemeriksaan Fungsional',
  //     questions: [
  //       { id: 201, question: 'Apakah semua tombol berfungsi?' },
  //       { id: 202, question: 'Apakah produk menyala dengan benar?' },
  //     ],
  //   },
  // ])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasi field wajib
    if (!productData?.serial_number) {
      toast.error('Serial number wajib diisi!')
      return
    }
    if (!inspected_by) {
      toast.error('Inspector name wajib diisi!')
      return
    }
    if (!qcName) {
      toast.error('QC Name wajib diisi!')
      return
    }
    if (!qcCodeSerial) {
      toast.error('QC ID wajib diisi!')
      return
    }
    // if (!formData.notes) {
    //   toast.error('Notes wajib diisi!')
    //   return
    // }
    if (Object.keys(answers).length === 0) {
      toast.error('Jawaban pertanyaan QC wajib diisi!')
      return
    }

    const payload = {
      serial_number: productData.serial_number,
      inspector_by: 1,
      inspector_name: inspected_by,
      qc_name: qcName, // sementara hardcode
      qc_id: qcCodeSerial,
      qc_place: 'Workshop A', // sementara hardcode
      tracking_id: productData.id,
      batch: productData.batch,
      notes: formData.notes,
      answers,
    }

    // console.log('Submit payload:', payload)

    try {
      const res = await backendQc.post('/submit', payload)

      const qcStatus = res.data?.data?.qcStatus ?? ''
      const messageShow = (
        <span>
          {res.data?.message ?? ''}. QC Status :{' '}
          <span style={{ color: qcStatus.toUpperCase() === 'FAIL' ? 'red' : 'green' }}>
            {qcStatus}
          </span>
        </span>
      )

      toast.success(messageShow)

      serialNumberInputRef.current.focus()
    } catch (error) {
      console.error('QC submit error:', error)
      toast.error(error.response?.data?.message || error.message || 'Gagal submit QC')
    }

    // Bersihkan semua state
    resetStates()
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CRow className="g-4 mb-4">
          {/* Scan Serial Number */}
          <CCol md={6}>
            <CCard className="mb-4 h-100">
              <CCardHeader>
                <strong>Product Name : {productData?.product?.name ?? '-'}</strong>
              </CCardHeader>
              <CCardBody>
                <FormRow label="Production Serial Number">
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
                    ref={serialNumberInputRef}
                    disabled={isFormLocked}
                  />
                </FormRow>
                <FormRow label="Notes">
                  <CFormTextarea
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInput}
                  />
                </FormRow>
                <FormRow label="Counter"></FormRow>
                <CRow className="mb-3">
                  <CounterCard6
                    title="Required Quantity"
                    value={trackingProduct?.quantity_summary?.total_quantity ?? `-`}
                  />
                  <CounterCard6
                    title="Remaining Quantity"
                    value={trackingProduct?.quantity_summary?.remaining_quantity ?? `-`}
                  />
                  <CounterCard6
                    title="Pass Quantity"
                    value={trackingProduct?.quantity_summary?.pass_quantity ?? `-`}
                  />
                  <CounterCard6
                    title="Fail Quantity"
                    value={trackingProduct?.quantity_summary?.fail_quantity ?? `-`}
                  />
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
                  <CCol md={12}>
                    <div className="fw-semibold">Assembly Code</div>
                    <div> {productData?.assembly_id ?? '-'}</div>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol md={12}>
                    <div className="fw-semibold">Item Code</div>
                    <div> {productData?.code_item ?? '-'}</div>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <div className="fw-semibold">Tracking</div>
                    <div> {productData?.tracking_type ?? '-'}</div>
                  </CCol>
                  <CCol md={6}>
                    <div className="fw-semibold">Batch</div>
                    <div> {productData?.batch ?? '-'}</div>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <div className="fw-semibold">Type</div>
                    <div> {productData?.product?.type?.name ?? '-'}</div>
                  </CCol>
                  <CCol md={6}>
                    <div className="fw-semibold">Supplier</div>
                    <div> {productData?.product?.supplier?.name ?? '-'}</div>
                  </CCol>
                </CRow>

                {/* <CRow className="mb-3">
                  <CCol md={6}>
                    <div className="fw-semibold">Type</div>
                    <div>{productData?.product?.type?.name ?? '-'}</div>
                  </CCol>
                </CRow>
                <FormRow label="AQL Setting :"></FormRow>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <div className="fw-semibold">Inspection Level</div>
                    <div>{trackingProduct?.aql_configuration?.inspection_level ?? `-`}</div>
                  </CCol>
                  <CCol md={6}>
                    <div className="fw-semibold">AQL Critical</div>
                    <div>{trackingProduct?.aql_configuration?.aql_critical ?? `-`}</div>
                  </CCol>
                </CRow> */}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
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

export default QcSerialNoAql
