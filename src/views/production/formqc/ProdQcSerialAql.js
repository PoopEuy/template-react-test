import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  CRow,
  CCard,
  CCol,
  CCardBody,
  CCardHeader,
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
import ErrorCard from '../../components/ErrorCard'
import SuccessCard from '../../components/SuccessCard'
import '../../../scss/style.scss'

const FormRow = ({ label, children }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={4}>
      <CFormLabel className="fw-semibold">{label}</CFormLabel>
    </CCol>
    <CCol md={8}>{children}</CCol>
  </CRow>
)

const QcAqlSerial = () => {
  const { qcIdParams, qcPlaceParams } = useParams()
  const [productData, setProductData] = useState(null)
  const [trackingProduct, setTrackingProduct] = useState(null)
  const [answers, setAnswers] = useState({})
  const [questionData, setQuestionData] = useState([])
  const [qcName, setQcName] = useState([])
  const qcCodeSerial = qcIdParams
  const [formData, setFormData] = useState({ serialNumber: '' })
  const [isFormLocked, setIsFormLocked] = useState(false)
  const serialNumberInputRef = useRef(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [errorSerialNumber, setErrorSerialNumber] = useState(null)
  const [successValidation, setSuccessValidation] = useState(null) // untuk success card

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

  const resetStates = () => {
    setProductData(null)
    // setTrackingProduct(null)
    setQuestionData([])
    setAnswers({})
    setFormData({ serialNumber: '', notes: '' })
    setErrorMessage(null)
    setErrorSerialNumber(null)
    setSuccessValidation(null)
    setIsFormLocked(false)
  }

  useEffect(() => {
    resetStates()
    serialNumberInputRef.current.focus()
    console.clear()
  }, [qcIdParams, qcPlaceParams])

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSerial = () => {
    console.log('Serial Number di-scan:', formData.serialNumber)

    // Simpan serial number sebelum reset
    const currentSerialNumber = formData.serialNumber

    // Bersihkan semua state dan clear input field
    setProductData(null)
    setTrackingProduct(null)
    setQuestionData([])
    setAnswers({})
    setErrorMessage(null)
    setErrorSerialNumber(null)
    setSuccessValidation(null)
    setFormData({ serialNumber: '', notes: '' })

    // Panggil fetch validasi serial
    fetchValidationSnumb(currentSerialNumber)
  }
  // Fetch validation serial number
  const fetchValidationSnumb = async (serialNumber) => {
    console.log('qcCodeSerial :', qcCodeSerial)
    try {
      const response = await backendQc.get('/validation', {
        params: {
          serial_number: serialNumber,
          qc_id: qcCodeSerial,
        },
      })

      if (response.data.valid === true) {
        // toast.success(response.data.message ?? 'Serial number valid')
        setErrorMessage(null)
        setErrorSerialNumber(null)

        // Set success validation untuk success card
        setSuccessValidation({
          serialNumber: serialNumber,
          message: response.data.message ?? 'Serial number valid',
        })

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
        const errorMsg = response.data.message ?? 'Serial number already scan'
        setErrorMessage(errorMsg)
        // Simpan serial number untuk ditampilkan di error card (input field tetap kosong)
        setErrorSerialNumber(serialNumber)
        // toast.error(errorMsg)
      }
    } catch (error) {
      console.log('ERROR')
      const errorMsg = error.response?.data?.message || 'Serial Number Validation Failed'
      setErrorMessage(errorMsg)
      // Simpan serial number untuk ditampilkan di error card (input field tetap kosong)
      setErrorSerialNumber(serialNumber)
      // toast.error(errorMsg)
    }
  }

  const fetchProduct = async (serialNumber) => {
    console.log('masuk fetch product')
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

        // Lock serial number field setelah berhasil fetch data
        setIsFormLocked(true)

        const assemblyId = response.data.data.assembly_id
        console.log('assemblyId :', assemblyId)

        fetchTrackingProduct(assemblyId)
      } else {
        const errorMsg = response.data.message || 'Failed get product data'
        setErrorMessage(errorMsg)
        // Simpan serial number untuk ditampilkan di error card (input field tetap kosong)
        setErrorSerialNumber(serialNumber)
        // toast.error(errorMsg)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'ERROR get data product'
      setErrorMessage(errorMsg)
      // Simpan serial number untuk ditampilkan di error card (input field tetap kosong)
      setErrorSerialNumber(serialNumber)
      // toast.error(errorMsg)
    }
  }

  const fetchTrackingProduct = async (assemblyId) => {
    try {
      const response = await backendTracking.get('/sample-inspections/aql-summary', {
        params: {
          assembly_id: assemblyId,
          qc_id: qcCodeSerial, //cek kembali ini nanti
        },
      })
      const remainingSample = response.data.data.inspection_summary.remaining_samples
      console.log('remaining Sample : ', remainingSample)
      if (remainingSample <= 0) {
        const errorMsg = 'SAMPLE SUDAH CUKUP !!'
        setErrorMessage(errorMsg)
        // toast.error(
        //   <span>
        //     <span style={{ color: 'red', fontWeight: 'bold' }}> {errorMsg}</span>
        //   </span>,
        // )
        // Simpan serial number sebelum reset states
        const currentSerialNumber = productData?.serial_number || formData.serialNumber
        // Bersihkan page
        resetStates()
        // Set serial number untuk error card (input field tetap kosong)
        setErrorSerialNumber(currentSerialNumber)
      } else {
        console.log('LANJUT')
        setTrackingProduct(response.data.data)
        setErrorMessage(null)
        const baseMessage = response.data?.message ?? ''

        toast.success(
          <span>
            {baseMessage || ''} -{' '}
            <span style={{ color: 'green', fontWeight: 'bold' }}> LANJUT QC</span>
          </span>,
        )
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed Validation'
      setErrorMessage(errorMsg)
      // Simpan serial number untuk ditampilkan di error card (input field tetap kosong)
      const currentSerialNumber = productData?.serial_number || formData.serialNumber
      if (currentSerialNumber) {
        setErrorSerialNumber(currentSerialNumber)
      }
      // toast.error(errorMsg)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasi field wajib
    if (!productData?.serial_number) {
      const errorMsg = 'Serial number wajib diisi!'
      setErrorMessage(errorMsg)
      // toast.error(errorMsg)
      return
    }
    if (!user || !user.id || !user.name) {
      const errorMsg = 'User tidak ditemukan di localStorage!'
      setErrorMessage(errorMsg)
      // toast.error(errorMsg)
      return
    }
    if (!qcName) {
      const errorMsg = 'QC Name wajib diisi!'
      setErrorMessage(errorMsg)
      // toast.error(errorMsg)
      return
    }
    if (!qcCodeSerial) {
      const errorMsg = 'QC ID wajib diisi!'
      setErrorMessage(errorMsg)
      // toast.error(errorMsg)
      return
    }

    // if (!formData.notes) {
    //   toast.error('Notes wajib diisi!')
    //   return
    // }

    if (Object.keys(answers).length === 0) {
      const errorMsg = 'Jawaban pertanyaan QC wajib diisi!'
      setErrorMessage(errorMsg)
      // toast.error(errorMsg)
      return
    }

    const payload = {
      serial_number: productData.serial_number,
      inspector_by: user.id,
      inspector_name: user.name,
      qc_name: qcName, // sementara hardcode
      qc_id: qcCodeSerial,
      qc_place: qcPlaceParams || 'Workshop A',
      tracking_id: productData.id,
      batch: productData.batch,
      notes: formData.notes,
      answers,
    }

    console.log('Submit payload:', payload)

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
      setErrorMessage(null)

      // Fetch counter terbaru setelah submit berhasil
      const assemblyId = productData.assembly_id
      if (assemblyId) {
        try {
          const counterResponse = await backendTracking.get('/sample-inspections/aql-summary', {
            params: {
              assembly_id: assemblyId,
              qc_id: qcCodeSerial,
            },
          })
          // Update counter dengan data terbaru
          setTrackingProduct(counterResponse.data.data)
        } catch (counterError) {
          console.error('Error fetching updated counter:', counterError)
          // Tidak perlu error handling, karena submit sudah berhasil
        }
      }

      serialNumberInputRef.current.focus()
    } catch (error) {
      console.error('QC submit error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Gagal submit QC'
      setErrorMessage(errorMsg)
      // Simpan serial number untuk ditampilkan di error card (input field tetap kosong)
      const currentSerialNumber = productData?.serial_number || formData.serialNumber
      if (currentSerialNumber) {
        setErrorSerialNumber(currentSerialNumber)
      }
      // toast.error(errorMsg)
      return // Jangan reset states jika ada error
    }

    // Bersihkan semua state hanya jika submit berhasil
    resetStates()
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CRow className="g-4 align-items-stretch">
          {/* Kolom Kiri - Scan Serial + Quality Control */}
          <CCol md={8} className="d-flex flex-column">
            {/* Scan Serial Number */}
            <CCard className="mb-4">
              <CCardHeader>
                <strong>Product Name : {productData?.product?.name ?? '-'}</strong>
                <div className="small text-muted">{qcPlaceParams}</div>
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
              </CCardBody>
            </CCard>

            {/* Quality Control */}
            <CCard>
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
                  {/* Tombol Submit hanya muncul jika ada questions dan tidak ada error */}
                  {questionData.length > 0 && !errorMessage && (
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

          {/* Kolom Kanan - Counter + Success Card atau Error */}
          <CCol md={4} className="d-flex flex-column">
            {errorMessage ? (
              /* Error Card */
              <ErrorCard
                serialNumber={errorSerialNumber}
                message={errorMessage}
                fullHeight={true}
              />
            ) : (
              <div className="h-100 d-flex flex-column">
                {/* Counter Card */}
                <CCard className={`d-flex flex-column ${successValidation ? 'mb-4' : 'h-100'}`}>
                  <CCardHeader>
                    <strong>Counter</strong>
                  </CCardHeader>
                  <CCardBody className={`${!successValidation ? 'd-flex flex-column justify-content-center flex-grow-1' : ''}`}>
                    <CRow className="mb-3">
                      <CounterCard6
                        title="Required Sample"
                        value={trackingProduct?.inspection_summary?.required_sample ?? `-`}
                      />
                      <CounterCard6
                        title="Remaining Samples"
                        value={trackingProduct?.inspection_summary?.remaining_samples ?? `-`}
                      />
                      <CounterCard6
                        title="Max Fail"
                        value={trackingProduct?.aql_configuration?.aql_accept ?? `-`}
                      />
                      <CounterCard6
                        title="Fail Count"
                        value={trackingProduct?.inspection_summary?.fail_count ?? `-`}
                      />
                    </CRow>
                  </CCardBody>
                </CCard>

                {/* Success Card */}
                {successValidation && (
                  <div className="flex-grow-1">
                    <SuccessCard
                      serialNumber={successValidation.serialNumber}
                      message={successValidation.message}
                      fullHeight={true}
                    />
                  </div>
                )}
              </div>
            )}
          </CCol>
        </CRow>
      </CCol>
    </CRow>
  )
}

export default QcAqlSerial
