import React, { useState, useRef, useEffect } from 'react'
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

const addHoursIso = (iso, hours) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  d.setTime(d.getTime() + hours * 60 * 60 * 1000)
  return d.toISOString()
}

const pickTimestampFromPayload = (payload) => {
  return (
    payload?.data?.timestamp ||
    payload?.timestamp ||
    payload?.start_time ||
    payload?.started_at ||
    null
  )
}

const formatCountdown = (ms) => {
  if (ms == null || Number.isNaN(ms)) return '-'
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const QaBeforeStage2 = () => {
  const serialInputRef = useRef(null)
  const handleStopProcessRef = useRef(null)
  const isStopLoadingRef = useRef(false)
  const autoStopInvokedRef = useRef(false)
  const [serialNumber, setSerialNumber] = useState('')
  const [inspectionDetails, setInspectionDetails] = useState([])
  const [isProcessStarted, setIsProcessStarted] = useState(false)
  const [isInputLocked, setIsInputLocked] = useState(false)
  const [isStopState, setIsStopState] = useState(false)
  const [isResetState, setIsResetState] = useState(false)
  const [processStartIso, setProcessStartIso] = useState(null)
  const [processEndEstimateIso, setProcessEndEstimateIso] = useState(null)
  const [startedSerialNumbers, setStartedSerialNumbers] = useState([])
  const [isStopLoading, setIsStopLoading] = useState(false)
  const [countdownMs, setCountdownMs] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const maxSerials = 9

  useEffect(() => {
    serialInputRef.current?.focus()
  }, [])

  useEffect(() => {
    isStopLoadingRef.current = isStopLoading
  }, [isStopLoading])

  const handleStartProcess = async () => {
    const serials = inspectionDetails.map((d) => d.serial_number).filter(Boolean)
    if (serials.length === 0) {
      toast.warning('Belum ada serial yang di-scan. Scan minimal 1 serial.')
      return
    }
    try {
      const { data: body } = await backendQc.post('/tamper/tts007/start', {
        serial_number: serials,
      })
      const ok = body?.status === true || body?.data?.success === true
      if (!ok) {
        toast.error(body?.message || 'Start proses ditolak oleh server.')
        return
      }
      const ts = body?.data?.timestamp
      if (ts) {
        setProcessStartIso(ts)
        setProcessEndEstimateIso(addHoursIso(ts, 6))
      } else {
        setProcessStartIso(null)
        setProcessEndEstimateIso(null)
      }
      const returnedSerials = Array.isArray(body?.serial_number)
        ? body.serial_number
        : serials
      setStartedSerialNumbers(returnedSerials)
      toast.success(body?.message || 'Proses berhasil dimulai.')
      setIsProcessStarted(true)
      setIsStopState(false)
      setIsResetState(false)
      autoStopInvokedRef.current = false
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal start proses.')
    }
  }

  const resolveSerialsForStop = () => {
    if (startedSerialNumbers.length > 0) return startedSerialNumbers
    return inspectionDetails.map((d) => d.serial_number).filter(Boolean)
  }

  const handleStopProcess = async ({ triggeredByTimer = false } = {}) => {
    const serials = resolveSerialsForStop()
    if (serials.length === 0) {
      toast.warning('Tidak ada serial untuk stop process.')
      return
    }
    setIsStopLoading(true)
    try {
      await backendQc.post('/tamper/tts007/stop', { serial_number: serials })
      toast.success(
        triggeredByTimer
          ? 'Waktu proses habis. Proses dihentikan otomatis.'
          : 'Stop process berhasil.',
      )
      setIsProcessStarted(false)
      setIsInputLocked(false)
      setIsStopState(false)
      setIsResetState(false)
      setProcessStartIso(null)
      setProcessEndEstimateIso(null)
      setStartedSerialNumbers([])
      setInspectionDetails([])
      setCurrentPage(1)
      setCountdownMs(null)
      autoStopInvokedRef.current = false
      setTimeout(() => serialInputRef.current?.focus(), 0)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal stop process.')
    } finally {
      setIsStopLoading(false)
    }
  }

  handleStopProcessRef.current = handleStopProcess

  useEffect(() => {
    if (!isProcessStarted || !processEndEstimateIso) {
      setCountdownMs(null)
      return undefined
    }
    const endMs = new Date(processEndEstimateIso).getTime()
    if (Number.isNaN(endMs)) {
      setCountdownMs(null)
      return undefined
    }

    const tick = () => {
      const remaining = Math.max(0, endMs - Date.now())
      setCountdownMs(remaining)
      if (
        remaining <= 0 &&
        !autoStopInvokedRef.current &&
        !isStopLoadingRef.current &&
        handleStopProcessRef.current
      ) {
        autoStopInvokedRef.current = true
        void handleStopProcessRef.current({ triggeredByTimer: true })
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isProcessStarted, processEndEstimateIso])

  const clearSerialNumber = () => {
    setInspectionDetails([])
    setCurrentPage(1)
    setIsInputLocked(false)
    setIsStopState(false)
    setIsResetState(false)
    setIsProcessStarted(false)
    setProcessStartIso(null)
    setProcessEndEstimateIso(null)
    setStartedSerialNumbers([])
    setCountdownMs(null)
    autoStopInvokedRef.current = false
    toast.info('The Serial Number data has been reset..')
    setTimeout(() => serialInputRef.current?.focus(), 0)
  }

  const handleResetProcess = async () => {
    const serials = inspectionDetails.map((d) => d.serial_number).filter(Boolean)
    if (serials.length === 0) {
      toast.warning('Tidak ada serial untuk reset process.')
      return
    }
    try {
      const response = await backendQc.post('/tamper/tts007/reset', {
        serial_numbers: serials,
      })
      const body = response.data
      const returnedSerials = Array.isArray(body?.serial_numbers) ? body.serial_numbers : []
      const limitedSerials = returnedSerials.slice(0, maxSerials)
      if (returnedSerials.length > maxSerials) {
        toast.warning(`Maksimal ${maxSerials} serial. Data ditampilkan ${maxSerials} serial pertama.`)
      }
      setInspectionDetails(limitedSerials.map((sn) => ({ serial_number: sn })))
      setCurrentPage(1)
      setIsInputLocked(false)
      setIsStopState(false)
      setIsResetState(true)
      setIsProcessStarted(false)
      setProcessStartIso(null)
      setProcessEndEstimateIso(null)
      setCountdownMs(null)
      setStartedSerialNumbers([])
      autoStopInvokedRef.current = false
      toast.success(body?.message || 'Reset process berhasil.')
      setTimeout(() => serialInputRef.current?.focus(), 0)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal reset process.')
    }
  }

  const handleSerial = async () => {
    const serial = serialNumber.trim()
    if (!serial) return

    if (isInputLocked || isProcessStarted) return

    try {
      const response = await backendQc.get('/validation/tts007', {
        params: { serial_number: serial },
      })
      const data = response.data

      const isStop = data.status === 'stop'
      const isLanjut = data.status === 'progress'
      const isReset = data.status === 'reset'

      if (isStop) {
        const group = data.serial_number_group || []
        const limitedGroup = group.slice(0, maxSerials)
        if (group.length > maxSerials) {
          toast.warning(`Maksimal ${maxSerials} serial. Data ditampilkan ${maxSerials} serial pertama.`)
        }
        setInspectionDetails(
          limitedGroup.map((item) => ({ serial_number: item.serial_number })),
        )
        setStartedSerialNumbers([])
        setCurrentPage(1)
        setIsInputLocked(false)
        setIsProcessStarted(false)
        setIsStopState(true)
        setIsResetState(false)
        setProcessStartIso(null)
        setProcessEndEstimateIso(null)
        setCountdownMs(null)
        autoStopInvokedRef.current = false
        toast.info(data?.message || 'Serial sudah START Tamper.')
      } else if (isLanjut) {
        const group = data.serial_number_group || []
        const limitedGroup = group.slice(0, maxSerials)
        if (group.length > maxSerials) {
          toast.warning(`Maksimal ${maxSerials} serial. Data ditampilkan ${maxSerials} serial pertama.`)
        }
        setInspectionDetails(
          limitedGroup.map((item) => ({ serial_number: item.serial_number })),
        )
        const ts = pickTimestampFromPayload(data)
        if (ts) {
          setProcessStartIso(ts)
          setProcessEndEstimateIso(addHoursIso(ts, 6))
          setIsProcessStarted(true)
          autoStopInvokedRef.current = false
        }
        const serialsFromGroup = limitedGroup
          .map((item) => item.serial_number)
          .filter(Boolean)
        setStartedSerialNumbers(serialsFromGroup)
        setCurrentPage(1)
        setIsInputLocked(true)
        setIsStopState(false)
        setIsResetState(false)
        toast.success(data?.message || 'Serial masuk tabel.')
      }else if (isReset) {
        const group = data.serial_number_group || []
        const limitedGroup = group.slice(0, maxSerials)
        if (group.length > maxSerials) {
          toast.warning(`Maksimal ${maxSerials} serial. Data ditampilkan ${maxSerials} serial pertama.`)
        }
        setInspectionDetails(
          limitedGroup.map((item) => ({ serial_number: item.serial_number })),
        )
        const ts = pickTimestampFromPayload(data)
        if (ts) {
          setProcessStartIso(ts)
          setProcessEndEstimateIso(addHoursIso(ts, 6))
          setIsProcessStarted(true)
          autoStopInvokedRef.current = false
        }
        const serialsFromGroup = limitedGroup
          .map((item) => item.serial_number)
          .filter(Boolean)
        setStartedSerialNumbers(serialsFromGroup)
        setCurrentPage(1)
        setIsInputLocked(false)
        setIsStopState(false)
        setIsResetState(true)
        toast.success(data?.message || 'Serial masuk tabel.')
      } else {
        if (inspectionDetails.length >= maxSerials) {
          toast.warning(`Maksimal ${maxSerials} serial dalam tabel.`)
          setSerialNumber('')
          return
        }
        const exists = inspectionDetails.some((d) => d.serial_number === serial)
        if (exists) {
          toast.warning('Serial number sudah ada di tabel.')
          setSerialNumber('')
          return
        }
        setInspectionDetails((prev) => [...prev, { serial_number: serial }])
        setIsStopState(false)
        setIsResetState(false)
        toast.success(data?.message || 'Serial masuk tabel.')
      }
      setSerialNumber('')
    } catch (err) {
      setSerialNumber('')
      toast.error(err.response?.data?.message || 'Gagal validasi serial.')
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
            <strong>Tamper 7 Time : Record Process</strong>
          </CCardHeader>
          <CCardBody className="d-flex flex-column h-100">
            <FormRow label="Product Serial Number">
              <CFormInput
                ref={serialInputRef}
                value={serialNumber}
                disabled={isInputLocked || isProcessStarted}
                onChange={(e) => setSerialNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSerial()
                  }
                }}
              />
            </FormRow>
            {/* Time Process Start and End */}
            {isProcessStarted && processStartIso && (
              <>
                <FormRow label="Start time">
                  <span className="small text-muted">{formatDateTimeId(processStartIso)} (WIB)</span>
                </FormRow>
                <FormRow label="Estimate complete">
                  <span className="small text-muted">
                    {formatDateTimeId(processEndEstimateIso)} (WIB, start + 6 hours)
                  </span>
                </FormRow>
                {processEndEstimateIso && (
                  <FormRow label="Countdown to stop">
                    <span className="text-primary fw-semibold">{formatCountdown(countdownMs)}</span>
                    <span className="ms-1 small text-muted">(hours:minutes:seconds)</span>
                  </FormRow>
                )}
              </>
            )}
            <div className="mt-auto d-flex justify-content-end pt-3 gap-2 flex-wrap">
              {(isInputLocked || isProcessStarted) && (
                <>
                  <CButton
                    color="secondary"
                    className="text-white"
                    onClick={handleResetProcess}
                    disabled={inspectionDetails.length === 0}
                  >
                    Reset Process
                  </CButton>
                  <CButton
                    color="danger"
                    className="text-white"
                    onClick={() => handleStopProcess()}
                    disabled={isStopLoading}
                  >
                    Stop Process
                  </CButton>
                </>
              )}
              {!isInputLocked && !isProcessStarted && !isStopState && (
                <CButton
                  color="primary"
                  className="text-white"
                  onClick={handleStartProcess}
                  disabled={inspectionDetails.length === 0}
                >
                  Start Process
                </CButton>
              )}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Tabel Inspection Details */}
      <CCol md={6}>
        <CCard className="mb-4 h-100">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>
              Inspection Details || Total: {inspectionDetails.length}
              {isResetState ? ' || RESET' : ''}
            </strong>
            <div className="d-flex gap-2">
              <CButton
                color="warning"
                size="sm"
                className="text-white"
                onClick={clearSerialNumber}
                disabled={inspectionDetails.length === 0 || isProcessStarted}
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
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {paginatedDetails.map((item, index) => (
                    <CTableRow key={(currentPage - 1) * itemsPerPage + index}>
                      <CTableDataCell>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </CTableDataCell>
                      <CTableDataCell>{item.serial_number}</CTableDataCell>
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

export default QaBeforeStage2
