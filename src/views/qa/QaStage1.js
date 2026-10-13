import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CFormLabel,
  CFormInput,
  CButton,
  CForm,
  CFormTextarea,
  CFormSwitch,
} from '@coreui/react'

import { backendQc, backendTracking, backendRelay } from '../../api/axios'
import { CounterCard6 } from '../components/CounterCard'
import { toast } from 'react-toastify'
import ErrorCard from '../components/ErrorCard'
import SuccessCard from '../components/SuccessCard'
import '../../scss/style.scss'

const FormRow = ({ label, children }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={4}>
      <CFormLabel className="fw-semibold">{label}</CFormLabel>
    </CCol>
    <CCol md={8}>{children}</CCol>
  </CRow>
)

const QaStage1 = () => {
  const { qcPlaceParams } = useParams()
  const [productData, setProductData] = useState(null)
  const [trackingProduct, setTrackingProduct] = useState(null)
  const [answers, setAnswers] = useState({})
  const [questionData, setQuestionData] = useState([])
  const [isFormLocked, setIsFormLocked] = useState(false)
  const serialNumberInputRef = useRef(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [errorSerialNumber, setErrorSerialNumber] = useState(null)
  const [successValidation, setSuccessValidation] = useState(null) // untuk success card
  const [formData, setFormData] = useState({ serialNumber: '' })
  const [qcName, setQcName] = useState([])
  const [relayData, setRelayData] = useState(null)
  const [isRelayPageReady, setIsRelayPageReady] = useState(false)
  const [qcCodeSerial, setNextQcIdValue] = useState(null)
  const [qcIdNow, setQcIdNow] = useState(null)
  const [buttonStop, setButtonStop] = useState(true)

  useEffect(() => {
    resetStates()
    fetchRelayData("HOME")
    serialNumberInputRef.current.focus()
    console.clear()
  }, [])

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
  console.log('username : ', user.name)

  if (!user || !user.id || !user.name) {
    const errorMsg = 'User not found in localStorage!'
    setErrorMessage(errorMsg)
    // toast.error(errorMsg)
    return
  }

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
    setRelayData(null)
    setIsRelayPageReady(false)
  }

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSerial = () => {
    console.log('Serial Number scanned:', formData.serialNumber)

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

    fetchValidationSnumb(currentSerialNumber)
  }

  // Fetch validation serial number
  const fetchValidationSnumb = async (serialNumber) => {
    try {
      const response = await backendQc.get('/validation/last-qc', {
        params: {
          serial_number: serialNumber,
        },
      })
      const nextQcIdValue = response.data.next_qc_id
      setNextQcIdValue(nextQcIdValue)

      if (response.data.status === true || response.data.status === 'lanjut') {
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

        // // Ambil product
        fetchProduct(serialNumber, nextQcIdValue)
      } else {
        const errorMsg = response.data.message ?? 'Serial number already scan'
        setErrorMessage(errorMsg)
        // Simpan serial number untuk ditampilkan di error card (input field tetap kosong)
        setErrorSerialNumber(serialNumber)
        // toast.error(errorMsg)
      }
    } catch (error) {
      console.log(error)
      const errorMsg = error.response?.data?.message || 'Serial Number Validation Failed'
      setErrorMessage(errorMsg)
      // Simpan serial number untuk ditampilkan di error card (input field tetap kosong)
      setErrorSerialNumber(serialNumber)
      // toast.error(errorMsg)
    }
  }

  const fetchProduct = async (serialNumber, nextQcIdValue) => {
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

        // fetchTrackingProduct(assemblyId)
        setQcIdNow(nextQcIdValue)
        fetchRelayData(nextQcIdValue)
      } else {
        const errorMsg = response.data.message || 'Failed get product data'
        setErrorMessage(errorMsg)
        // Simpan serial number untuk ditampilkan di error card (input field tetap kosong)
        setErrorSerialNumber(serialNumber)
        // toast.error(errorMsg)
      }
    } catch (error) {
      console.log(error)
      const errorMsg = error.response?.data?.message || 'ERROR get data product'
      setErrorMessage(errorMsg)
      // Simpan serial number untuk ditampilkan di error card (input field tetap kosong)
      setErrorSerialNumber(serialNumber)
      // toast.error(errorMsg)
    }
  }

  const fetchRelayData = async (nextQcIdValue) => {
    try {
      const payload1 = {
        page: nextQcIdValue,
      }

      const response = await backendRelay.post('/page', payload1)
      console.log('Relay Response : ', response.data.status)
      setRelayData(response.data)
      setIsRelayPageReady(true)
    } catch (error) {
      console.log(error)
      const errorMsg = error.response?.data?.message || 'ERROR RELAY'
      setErrorMessage(errorMsg)
      setIsRelayPageReady(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasi field wajib
    if (!productData?.serial_number) {
      const errorMsg = 'Serial number is required!'
      setErrorMessage(errorMsg)
      // toast.error(errorMsg)
      return
    }
    if (!user || !user.id || !user.name) {
      const errorMsg = 'User not found in localStorage!'
      setErrorMessage(errorMsg)
      // toast.error(errorMsg)
      return
    }
    if (!qcName) {
      const errorMsg = 'QC Name is required!'
      setErrorMessage(errorMsg)
      // toast.error(errorMsg)
      return
    }
    console.log('qcCodeSerial : ', qcCodeSerial)
    if (!qcCodeSerial) {
      const errorMsg = 'QC ID is required!'
      setErrorMessage(errorMsg)
      // toast.error(errorMsg)
      return
    }
    // if (!formData.notes) {
    //   toast.error('Notes wajib diisi!')
    //   return
    // }
    if (Object.keys(answers).length === 0) {
      const errorMsg = 'QC question answers are required!'
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
      qc_place: qcPlaceParams || 'QA Station',
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
      setErrorMessage(null)

      // Bersihkan semua state hanya jika submit berhasil
      resetStates()

      console.log('Submitted QC : ', qcCodeSerial)

      if (qcCodeSerial !== 'QC-TT006') {
        console.log('Continue to next stage')
        fetchValidationSnumb(productData.serial_number)
      } else {
        console.log('Do not continue to next stage because QC-TT006 is the final stage')
        homeRelay()
      }

      // Set focus ke Production Serial Number setelah reset dan render selesai
      // setTimeout(() => {
      //   if (serialNumberInputRef.current) {
      //     serialNumberInputRef.current.focus()
      //   }
      // }, 0)
    } catch (error) {
      console.error('QC submit error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to submit QA'
      setErrorMessage(errorMsg)
      // Simpan serial number untuk ditampilkan di error card (input field tetap kosong)
      const currentSerialNumber = productData?.serial_number || formData.serialNumber
      if (currentSerialNumber) {
        setErrorSerialNumber(currentSerialNumber)
      }
      // toast.error(errorMsg)
      return // Jangan reset states jika ada error
    }
  }

  const homeRelay = async () => {
    try {
      const payload = {
        page: 'HOME',
      }

      const response = await backendRelay.post('/page', payload)
      console.log('Relay Response : ', response.data.status)
      setRelayData(response.data)
    } catch (error) {
      console.log(error)
      const errorMsg = error.response?.data?.message || 'ERROR RELAY'
      setErrorMessage(errorMsg)
    }
  }

  const stopRelay = async () => {
    try {
      const payload = {
        page: buttonStop ? 'STOP' : qcIdNow,
      }

      const response = await backendRelay.post('/page', payload)

      console.log('Relay Response : ', response.data.status)
      setRelayData(response.data)

      if (buttonStop) {
        console.log('Entered buttonStop=true condition, set to false and send RESUME command')
        setButtonStop(false)
      } else {
        setButtonStop(true)
        console.log('Entered buttonStop=false condition, set to true and send STOP command')
      }
    } catch (error) {
      console.log(error)
      const errorMsg = error.response?.data?.message || 'ERROR RELAY'
      setErrorMessage(errorMsg)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CRow className="g-4 align-items-stretch">
          {/* Kolom Kiri - Scan Serial + Quality Control */}
          <CCol md={8}>
            {/* Scan Serial Number */}
            <CCard className="mb-4">
              <CCardHeader>
                <strong>Product Name : {productData?.product?.name ?? '-'}</strong>
                <div className="small text-muted">{qcName}</div>
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
                  {questionData.length > 0 && !errorMessage && buttonStop && isRelayPageReady && (
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <CButton color="primary" type="submit" disabled={!isRelayPageReady}>
                        Submit
                      </CButton>
                    </div>
                  )}
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>

          {/* Kolom Kanan - Success Card + Counter atau Error */}
          <CCol md={4} className="d-flex flex-column">
            {errorMessage ? (
              <ErrorCard
                serialNumber={errorSerialNumber}
                message={errorMessage}
                fullHeight={true}
              />
            ) : (
              <div className="h-100 d-flex flex-column">
                {/* Relay Card */}
                <CCard className={`d-flex flex-column ${successValidation ? 'mb-4' : 'h-100'}`}>
                  <CCardHeader>
                    <strong>Relay</strong>
                  </CCardHeader>
                  <CCardBody
                    className={`${!successValidation ? 'd-flex flex-column justify-content-center flex-grow-1' : ''}`}
                  >
                    {relayData ? (
                      <CRow className="mb-3">
                        <CounterCard6 title="Page" value={relayData.halaman ?? `-`} />
                        <CounterCard6 title="Address" value={relayData.alamat ?? `-`} />
                        <CounterCard6 title="Test Type" value={relayData.tipe_test ?? `-`} />
                        <CounterCard6 title="Status" value={relayData.status ?? `-`} />
                      </CRow>
                    ) : (
                      <p className="text-muted text-center mb-0">Relay data not yet available...</p>
                    )}

                    {relayData && (
                      <CRow className="mb-3">
                        <CButton
                          color={buttonStop ? 'danger' : 'success'}
                          type="button"
                          onClick={stopRelay}
                          className="mx-auto text-white"
                        >
                          {buttonStop ? 'Emergency Stop' : 'Resume Process'}
                        </CButton>
                      </CRow>
                    )}
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

export default QaStage1
