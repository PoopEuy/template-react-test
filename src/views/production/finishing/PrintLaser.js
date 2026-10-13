import React, { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  CRow,
  CCard,
  CCol,
  CCardBody,
  CCardHeader,
  CFormLabel,
  CFormInput,
  CForm,
  CButton,
  CFormTextarea,
  CFormSwitch,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { backendGenerate, backendQc, backendTracking } from '../../../api/axios'
import PlnSerialCard from '../../components/PlnSerialCard'
import ErrorCard from '../../components/ErrorCard'
import SuccessCard from '../../components/SuccessCard'
import { CounterCard6 } from '../../components/CounterCard'
import '../../../scss/style.scss'

const FormRow = ({ label, children }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={4}>
      <CFormLabel className="fw-semibold">{label}</CFormLabel>
    </CCol>
    <CCol md={8}>{children}</CCol>
  </CRow>
)

const PrintLaser = () => {
  const { qcIdParams, postNameParams, qcPlaceParams } = useParams()

  // States untuk flow control
  const [currentStep, setCurrentStep] = useState('SCAN_SERIAL') // SCAN_SERIAL, QC_QUESTIONS, PRINT_READY, PRINTING, SCAN_RESULT, COMPLETED

  // States untuk data
  const [serialNumber, setSerialNumber] = useState('')
  const [generatedPlnSerial, setGeneratedPlnSerial] = useState('')
  const [scannedBarcode, setScannedBarcode] = useState('')
  const [scannedQrCode, setScannedQrCode] = useState('')
  const [productData, setProductData] = useState(null)
  const [trackingProduct, setTrackingProduct] = useState(null)

  // States untuk QC
  const [questionData, setQuestionData] = useState([])
  const [answers, setAnswers] = useState({})
  const [qcName, setQcName] = useState('')
  const [notes, setNotes] = useState('')

  // States untuk UI
  const [errorMessage, setErrorMessage] = useState(null)
  const [errorSerialNumber, setErrorSerialNumber] = useState(null)
  const [isSerialLocked, setIsSerialLocked] = useState(false)
  const [showPrintButton, setShowPrintButton] = useState(false)
  const [isBarcodeLocked, setIsBarcodeLocked] = useState(false)
  const [isQrCodeLocked, setIsQrCodeLocked] = useState(false)
  const [showPrintConfirmModal, setShowPrintConfirmModal] = useState(false)

  // Refs
  const serialInputRef = useRef(null)
  const barcodeInputRef = useRef(null)
  const qrCodeInputRef = useRef(null)
  const qcQuestionsRef = useRef(null)

  // Tentukan post dari params
  // Cara 1: Dari postNameParams (contoh: "Post 1" atau "Post 2")
  // Cara 2: Dari qcIdParams (contoh: "QC-LE016-1" atau "QC-LE016-2")
  let lasserNo = 0
  let postName = 'Post ?'

  if (postNameParams) {
    // Extract angka dari "Post 1" atau "Post 2"
    const postMatch = postNameParams.match(/(\d+)/)
    if (postMatch) {
      lasserNo = parseInt(postMatch[1]) || 0
      postName = postNameParams
    }
  }

  // Jika belum dapat dari postNameParams, coba dari qcIdParams
  if (lasserNo === 0 && qcIdParams) {
    // Extract angka dari "QC-LE016-1" atau "QC-LE016-2"
    const qcMatch = qcIdParams.match(/-(\d+)$/)
    if (qcMatch) {
      lasserNo = parseInt(qcMatch[1]) || 0
      postName = `Post ${lasserNo}`
    }
  }

  // QC ID untuk print laser dari params
  const qcIdPrintLaser =
    (qcIdParams || `QC-LE016-${lasserNo || 1}`).replace(/-\d+$/, '') || 'QC-LE016'

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

  // Reset semua states
  const resetStates = ({ preserveTracking = false } = {}) => {
    setCurrentStep('SCAN_SERIAL')
    setSerialNumber('')
    setGeneratedPlnSerial('')
    setScannedBarcode('')
    setScannedQrCode('')
    setProductData(null)
    if (!preserveTracking) {
      setTrackingProduct(null)
    }
    setQuestionData([])
    setAnswers({})
    setQcName('')
    setNotes('')
    setErrorMessage(null)
    setErrorSerialNumber(null)
    setIsSerialLocked(false)
    setShowPrintButton(false)
    setIsBarcodeLocked(false)
    setIsQrCodeLocked(false)
    setShowPrintConfirmModal(false)
    serialInputRef.current?.focus()
  }

  // fokus otomatis saat page load / nav pindah
  useEffect(() => {
    resetStates()
  }, [qcIdParams, postNameParams, qcPlaceParams])

  // ============ STEP 1: Scan Serial, Validasi QC (ambil pertanyaan tapi jangan tampilkan) ============
  const handleSerialScan = async (e) => {
    e.preventDefault()
    if (!serialNumber) {
      toast.error('Serial number cannot be empty')
      return
    }

    const currentSerialNumber = serialNumber

    try {
      // STEP 1: Validasi QC dan ambil pertanyaan (tapi jangan tampilkan dulu)
      await fetchQcValidation(currentSerialNumber)
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Validation error occurred'
      setErrorMessage(errorMsg)
      setErrorSerialNumber(currentSerialNumber)
      setSerialNumber('')
    }
  }

  // STEP 1: Fetch QC Validation dan Questions (simpan tapi jangan tampilkan)
  const fetchQcValidation = async (serialNumber) => {
    try {
      const response = await backendQc.get('/validation', {
        params: {
          serial_number: serialNumber,
          qc_id: qcIdPrintLaser,
          pln_code_id: serialNumber, // pakai serial assembly
        },
      })

      if (response.data.valid === true) {
        setErrorMessage(null)
        setErrorSerialNumber(null)

        // Convert object questions → array dan SIMPAN (jangan tampilkan dulu)
        const convertedQuestions = Object.entries(response.data.questions).map(([id, text]) => ({
          id: Number(id),
          question: text,
        }))

        setQcName(response.data.category)
        setQuestionData(convertedQuestions)

        // Inisialisasi semua jawaban default ke true
        const initialAnswers = {}
        convertedQuestions.forEach((q) => {
          initialAnswers[q.id] = true
        })
        setAnswers(initialAnswers)

        // Lock serial input
        setIsSerialLocked(true)

        // STEP 2: Generate PLN Code
        await generatePlnCode(serialNumber)
      } else {
        const errorMsg = response.data.message ?? 'Serial cannot proceed to print laser stage'
        setErrorMessage(errorMsg)
        setErrorSerialNumber(serialNumber)
        setSerialNumber('')
        setIsSerialLocked(false)
      }
    } catch (error) {
      console.error(error)
      const errorMsg = error.response?.data?.message || 'QC validation failed'
      setErrorMessage(errorMsg)
      setErrorSerialNumber(serialNumber)
      setSerialNumber('')
      setIsSerialLocked(false)
    }
  }

  // STEP 2: Generate PLN Code
  const generatePlnCode = async (serialNumber) => {
    try {
      const response = await backendGenerate.patch(`/pln-codes/${serialNumber}/add-material`)

      if (response.data.success) {
        const plnSerial = response.data.data?.fullCode || ''
        setGeneratedPlnSerial(plnSerial)

        // Fetch product data
        await fetchProduct(serialNumber)

        const currentStatus = response.data.data?.status

        const normalizedStatus = currentStatus?.toUpperCase()

        if (normalizedStatus === 'LASERED') {
          // Serial sudah pernah selesai proses print laser, langsung ke scan hasil tanpa print ulang
          setShowPrintButton(false)
          setCurrentStep('SCAN_RESULT')
          toast.info('Serial has been processed. Please scan Barcode and QR Code to continue QC.')
          // Focus ke barcode input
          setTimeout(() => {
            barcodeInputRef.current?.focus()
          }, 100)
        } else {
          // Update step ke PRINT_READY (tampilkan PLN dan tombol print)
          setCurrentStep('PRINT_READY')
          setShowPrintButton(true)
          toast.success('PLN Serial generated successfully! Please click Print button.')
        }
      } else {
        const errorMsg = response.data.message || 'Failed to generate PLN Serial'
        setErrorMessage(errorMsg)
        setErrorSerialNumber(serialNumber)
        setSerialNumber('')
        setIsSerialLocked(false)
      }
    } catch (error) {
      console.error(error)
      const errorMsg = error.response?.data?.message || 'Failed to generate PLN Serial'
      setErrorMessage(errorMsg)
      setErrorSerialNumber(serialNumber)
      setSerialNumber('')
      setIsSerialLocked(false)
    }
  }

  // Fetch product data
  const fetchProduct = async (serialNumber) => {
    try {
      const response = await backendTracking.get(`/serial/${serialNumber}`)

      if (response.data.success === true) {
        setProductData(response.data.data)

        const assemblyId = response.data.data.assembly_id
        if (assemblyId) {
          await fetchTrackingProduct(assemblyId)
        }
      } else {
        const errorMsg = response.data.message || 'Failed get product data'
        setErrorMessage(errorMsg)
        setErrorSerialNumber(serialNumber)
      }
    } catch (error) {
      console.error(error)
      const errorMsg = error.response?.data?.message || 'ERROR get data product'
      setErrorMessage(errorMsg)
      setErrorSerialNumber(serialNumber)
    }
  }

  // Fetch tracking product untuk counter
  const fetchTrackingProduct = async (assemblyId) => {
    try {
      const response = await backendTracking.get('/sample-inspections/quantity-summary', {
        params: {
          assembly_id: assemblyId,
          qc_id: qcIdPrintLaser,
        },
      })
      setTrackingProduct(response.data.data)
    } catch (error) {
      console.error('Error fetching tracking:', error)
    }
  }

  // ============ STEP 5-6: Print Laser (kirim perintah ke mesin) ============
  // Fungsi untuk membuka popup konfirmasi print
  const openPrintConfirmModal = () => {
    setShowPrintConfirmModal(true)
  }

  // Fungsi untuk menutup popup konfirmasi print
  const closePrintConfirmModal = () => {
    setShowPrintConfirmModal(false)
  }

  // Fungsi untuk melakukan print setelah konfirmasi
  const handlePrintLaser = async () => {
    setShowPrintConfirmModal(false)
    setCurrentStep('PRINTING')

    if (!user || !user.name) {
      toast.error('User not found in localStorage!')
      setCurrentStep('PRINT_READY')
      return
    }

    try {
      const response = await backendGenerate.patch(`/pln-codes/${serialNumber}/mark-lasered`, {
        station: lasserNo, // station 1 atau 2 sesuai post yang dipilih
        laseredBy: user.name, // nama operator dari localStorage
        laserNotes: notes || 'Laser marking completed successfully', // notes dari form atau default
      })

      if (response.data.success) {
        toast.success('PRINT COMPLETED! Please scan barcode from print result.')
        setCurrentStep('SCAN_RESULT')

        // Focus ke input scan barcode
        setTimeout(() => {
          barcodeInputRef.current?.focus()
        }, 100)
      } else {
        toast.error(response.data.message || 'Print failed')
        setCurrentStep('PRINT_READY')
      }
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Error occurred during print'
      toast.error(errorMsg)
      setCurrentStep('PRINT_READY')
    }
  }

  // ============ STEP 7-8: Scan Barcode hasil print ============
  const handleBarcodeScanned = (e) => {
    // Auto-proceed ketika barcode terisi dan cocok dengan Serial Number
    const barcodeValue = e.target.value.trim()
    const expectedSerial = serialNumber.trim()
    
    if (barcodeValue && barcodeValue === expectedSerial) {
      // Barcode cocok dengan Serial Number, lock input barcode dan focus ke QR Code
      setErrorMessage(null)
      setIsBarcodeLocked(true)
      toast.success('Barcode matched with Serial Number! Please scan QR Code.')
      setTimeout(() => {
        qrCodeInputRef.current?.focus()
      }, 100)
    } else if (barcodeValue && barcodeValue !== expectedSerial) {
      // Barcode tidak cocok dengan Serial Number
      setErrorMessage(
        `Barcode mismatch!\nExpected Serial Number: ${expectedSerial}\nScanned Barcode: ${barcodeValue}`,
      )
      setErrorSerialNumber(barcodeValue)
      toast.error('Barcode does not match Serial Number!')
      setScannedBarcode('')
      setIsBarcodeLocked(false)
    }
  }

  // ============ STEP 7-8: Scan QR Code hasil print ============
  const handleQrCodeScanned = (e) => {
    // Auto-proceed ketika QR code terisi dan cocok dengan PLN Serial
    const qrValue = e.target.value.trim()
    const plnSerial = generatedPlnSerial.trim()
    const barcodeValue = scannedBarcode.trim()
    const expectedSerial = serialNumber.trim()
    
    if (!qrValue) return
    
    // Validasi QR Code dengan PLN Serial
    const qrMatchesPln = qrValue === plnSerial
    // Validasi Barcode dengan Serial Number (sudah divalidasi sebelumnya, tapi double check)
    const barcodeMatchesSerial = barcodeValue === expectedSerial
    
    if (qrMatchesPln && barcodeMatchesSerial) {
      // Semua cocok - Lock QR Code dan Tampilkan QC Questions
      setIsQrCodeLocked(true)
      setCurrentStep('QC_QUESTIONS')
      setErrorMessage(null)
      toast.success(
        `✓ Validation Passed!\n` +
        `Barcode matches Serial Number: ${expectedSerial}\n` +
        `QR Code matches PLN Serial: ${plnSerial}\n` +
        `Please answer QC questions.`
      )
      
      // Auto scroll ke QC Questions section - tambahan
      setTimeout(() => {
        qcQuestionsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        })
      }, 300)
    } else {
      // Ada yang tidak cocok - tampilkan detail error
      let errorDetails = []
      
      if (!barcodeMatchesSerial) {
        errorDetails.push(`✗ Barcode does NOT match Serial Number`)
        errorDetails.push(`  Expected Serial: ${expectedSerial}`)
        errorDetails.push(`  Scanned Barcode: ${barcodeValue}`)
      } else {
        errorDetails.push(`✓ Barcode matches Serial Number`)
      }
      
      if (!qrMatchesPln) {
        errorDetails.push(`✗ QR Code does NOT match PLN Serial`)
        errorDetails.push(`  Expected PLN: ${plnSerial}`)
        errorDetails.push(`  Scanned QR: ${qrValue}`)
      } else {
        errorDetails.push(`✓ QR Code matches PLN Serial`)
      }
      
      const errorMsg = errorDetails.join('\n')
      setErrorMessage(errorMsg)
      setErrorSerialNumber(qrValue)
      toast.error('Validation failed! Check details below.')
      setScannedQrCode('')
      
      // Focus kembali ke input yang bermasalah
      if (!barcodeMatchesSerial) {
        setScannedBarcode('')
        setIsBarcodeLocked(false)
        setTimeout(() => {
          barcodeInputRef.current?.focus()
        }, 100)
      }
    }
  }

  // ============ STEP 9: Submit QC ============
  const handleQcSubmit = async (e) => {
    e.preventDefault()

    // Cek apakah semua jawaban Pass (true)
    const allPass = Object.values(answers).every((answer) => answer === true)

    if (!allPass) {
      setErrorMessage('Not all QC questions are answered Yes (Pass). Cannot submit!')
      setErrorSerialNumber(serialNumber)
      toast.error('QC did not Pass! Fix answers to continue.')
      return
    }

    // Jika semua Pass, submit QC
    await submitQcToBackend()
  }

  // Submit QC ke backend setelah print berhasil
  const submitQcToBackend = async () => {
    if (!user || !user.id || !user.name) {
      toast.error('User not found in localStorage!')
      return
    }

    const payload = {
      serial_number: serialNumber,
      pln_serial: generatedPlnSerial,
      inspector_by: user.id,
      inspector_name: user.name,
      qc_name: qcName,
      qc_id: qcIdPrintLaser,
      qc_place: qcPlaceParams || 'Print Stages',
      tracking_id: productData?.id,
      batch: productData?.batch,
      notes: notes,
      answers,
      lasser_no: lasserNo,
    }

    try {
      const res = await backendQc.post('/submit', payload)

      const qcStatus = res.data?.data?.qcStatus ?? ''
      const messageShow = (
        <span>
          {res.data?.message ?? 'QC submitted successfully'}. QC Status:{' '}
          <span style={{ color: qcStatus.toUpperCase() === 'FAIL' ? 'red' : 'green' }}>
            {qcStatus}
          </span>
        </span>
      )

      toast.success(messageShow)
      setCurrentStep('COMPLETED')

      if (productData?.assembly_id) {
        await fetchTrackingProduct(productData.assembly_id)
      }

      setTimeout(() => {
        resetStates({ preserveTracking: true })
        serialInputRef.current?.focus()
      }, 0)
    } catch (error) {
      console.error('QC submit error:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to submit QC'
      setErrorMessage(errorMsg)
      setErrorSerialNumber(serialNumber)
      toast.error(errorMsg)
    }
  }

  // Handle keydown untuk input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (currentStep === 'SCAN_SERIAL') {
        handleSerialScan(e)
      }
    }
  }

  // Handle keydown untuk barcode
  const handleBarcodeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBarcodeScanned(e)
    }
  }

  // Handle keydown untuk QR code
  const handleQrCodeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleQrCodeScanned(e)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        {/* PLN Serial Card Full Width */}
        {generatedPlnSerial &&
          (currentStep === 'PRINT_READY' ||
            currentStep === 'PRINTING' ||
            currentStep === 'SCAN_RESULT' ||
            currentStep === 'QC_QUESTIONS') && (
            <div className="mb-4">
              <PlnSerialCard plnSerial={generatedPlnSerial} productName={productData?.product?.name} />
            </div>
          )}

        <CRow className="g-4 align-items-stretch">
          {/* Kolom Kiri - Form & Questions */}
          <CCol md={8} className="d-flex flex-column">
            {/* Card Serial Number & Notes */}
            <CCard className="mb-4 flex-grow-1 d-flex flex-column">
              <CCardHeader>
                <strong>Print Laser {postName}</strong>
              </CCardHeader>
              <CCardBody className="flex-grow-1 d-flex flex-column">
                <FormRow label="Product Name">
                  <div className="fw-semibold">{productData?.product?.name ?? '-'}</div>
                </FormRow>

                <FormRow label="Serial Number">
                  <CFormInput
                    name="serialNumber"
                    placeholder="Scan or input serial number"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    onKeyDown={handleKeyDown}
                    ref={serialInputRef}
                    disabled={isSerialLocked}
                  />
                </FormRow>

            {/* Input Scan Barcode - muncul setelah print dan tetap tampil saat QC */}
            {(currentStep === 'SCAN_RESULT' || currentStep === 'QC_QUESTIONS') && (
                  <>
                    <FormRow label="Scan Barcode">
                      <CFormInput
                        name="scannedBarcode"
                        placeholder="Scan barcode hasil print laser"
                        value={scannedBarcode}
                        onChange={(e) => setScannedBarcode(e.target.value)}
                        onKeyDown={handleBarcodeKeyDown}
                        ref={barcodeInputRef}
                        autoComplete="off"
                        disabled={isBarcodeLocked}
                      />
                    </FormRow>
                    
                    <FormRow label="Scan QR Code">
                      <CFormInput
                        name="scannedQrCode"
                        placeholder="Scan QR code hasil print laser"
                        value={scannedQrCode}
                        onChange={(e) => setScannedQrCode(e.target.value)}
                        onKeyDown={handleQrCodeKeyDown}
                        ref={qrCodeInputRef}
                        autoComplete="off"
                        disabled={isQrCodeLocked || !isBarcodeLocked}
                      />
                    </FormRow>
                  </>
                )}

                <FormRow label="Notes">
                  <CFormTextarea
                    rows={3}
                    name="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan tambahan (opsional)"
                  />
                </FormRow>
              </CCardBody>
            </CCard>

            {/* Card Tombol Print Laser - muncul setelah generate PLN */}
            {currentStep === 'PRINT_READY' && showPrintButton && !errorMessage && (
              <CCard className="mb-4">
                <CCardHeader>
                  <strong>Print Laser Ready</strong>
                </CCardHeader>
                <CCardBody>
                  <div className="d-grid gap-2">
                    <CButton color="success" onClick={openPrintConfirmModal} size="lg">
                      🖨️ Print Laser {postName}
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>
            )}

            {/* Print Confirmation Modal */}
            <CModal visible={showPrintConfirmModal} onClose={closePrintConfirmModal} alignment="center">
              <CModalHeader>
                <CModalTitle>Print Laser Confirmation</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <div className="text-center">
                  <p className="mb-3">
                    <strong>Are you sure you want to print the laser label?</strong>
                  </p>
                  <div className="bg-light p-3 rounded mb-3">
                    <p className="mb-1"><strong>Serial Number:</strong> {serialNumber}</p>
                    <p className="mb-1"><strong>PLN Serial:</strong> {generatedPlnSerial}</p>
                    <p className="mb-0"><strong>Station:</strong> {postName}</p>
                  </div>
                  <p className="text-muted small">
                    Please ensure the laser machine is ready and the material is properly installed.
                  </p>
                </div>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={closePrintConfirmModal}>
                  Cancel
                </CButton>
                <CButton color="success" onClick={handlePrintLaser}>
                  🖨️ Yes, Print Now
                </CButton>
              </CModalFooter>
            </CModal>

            {/* Status Printing */}
            {currentStep === 'PRINTING' && (
              <CCard className="mb-4">
                <CCardBody>
                  <div className="text-center p-4">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Printing...</span>
                    </div>
                    <p className="text-muted">Printing in progress...</p>
                  </div>
                </CCardBody>
              </CCard>
            )}

            {/* Card QC Questions - muncul setelah scan hasil print cocok */}
            {currentStep === 'QC_QUESTIONS' && (
              <CCard className="mb-4 flex-grow-1" ref={qcQuestionsRef}>
                <CCardHeader>
                  <strong>Quality Control - {qcName}</strong>
                </CCardHeader>
                <CCardBody>
                  <CForm onSubmit={handleQcSubmit}>
                    {questionData.length === 0 ? (
                      <p className="text-muted">Questions not yet available...</p>
                    ) : (
                      questionData.map((q) => (
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
                                [q.id]: e.target.checked,
                              }))
                            }
                          />
                        </div>
                      ))
                    )}

                    {/* Tombol Submit QC */}
                    {questionData.length > 0 && !errorMessage && currentStep === 'QC_QUESTIONS' && (
                      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <CButton color="primary" type="submit">
                          Submit QC
                        </CButton>
                      </div>
                    )}
                  </CForm>
                </CCardBody>
              </CCard>
            )}
          </CCol>

          {/* Kolom Kanan - PLN Serial Card, Counter, Error/Success */}
          <CCol md={4} className="d-flex flex-column">

            {/* Error Card */}
            {errorMessage && <ErrorCard serialNumber={errorSerialNumber} message={errorMessage} />}

            {/* Success Card */}
            {currentStep === 'COMPLETED' && (
              <SuccessCard
                serialNumber={serialNumber}
                message="Print Laser dan QC berhasil!"
                additionalInfo={`PLN Serial: ${generatedPlnSerial}`}
              />
            )}

            {/* Counter Card */}
            {!errorMessage && currentStep !== 'COMPLETED' && (
              <CCard className="mb-4 flex-grow-1 d-flex flex-column">
                <CCardHeader>
                  <strong>Counter</strong>
                </CCardHeader>
                <CCardBody className="flex-grow-1 d-flex flex-column justify-content-center">
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
            )}

          </CCol>
        </CRow>
      </CCol>
    </CRow>
  )
}

export default PrintLaser
