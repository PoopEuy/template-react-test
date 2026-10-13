import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { backendGenerate } from '../../../api/axios'

const getOperatorName = () => {
  try {
    return localStorage.getItem('name') || 'Unknown Operator'
  } catch (error) {
    // console.error('Failed to read operator name:', error)
    return 'Unknown Operator'
  }
}

const GenerateBoxSerial = () => {
  const [scanValue, setScanValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [boxInfo, setBoxInfo] = useState(null)
  const [codesInBox, setCodesInBox] = useState([])
  const scanInputRef = useRef(null)

  useEffect(() => {
    scanInputRef.current?.focus()
  }, [])

  const submitScan = useCallback(async (trimmedSerial) => {
    if (!trimmedSerial) {
      toast.error('The series cannot be empty')
      scanInputRef.current?.focus()
      return
    }

    // if (trimmedSerial.length < MIN_SERIAL_LENGTH) {
    //   toast.warning(`Serial harus memiliki minimal ${MIN_SERIAL_LENGTH} karakter`)
    //   scanInputRef.current?.focus()
    //   return
    // }

    setIsSubmitting(true)

    try {
      const operatorName = getOperatorName()
      const response = await backendGenerate.post(`/boxes/scan/${trimmedSerial}`, {
        scannedBy: operatorName,
      })

      const responseData = response.data?.data
      setBoxInfo(responseData?.box || null)
      setCodesInBox(responseData?.codesInBox || [])

      toast.success(response.data?.message || responseData?.message || 'Scan berhasil!')
    } catch (error) {
      // console.error('Error scanning box serial:', error)
      toast.error(error.response?.data?.message || 'Scan gagal, silakan coba lagi')
      
    } finally {
      setIsSubmitting(false)
      setScanValue('')
      setTimeout(() => {
        scanInputRef.current?.focus()
      }, 100)
    }
  }, [])

  const handleScan = async (e) => {
    e.preventDefault()
    const trimmedSerial = scanValue.trim()
    if (!trimmedSerial || isSubmitting) {
      return
    }
    await submitScan(trimmedSerial)
  }

  const renderBoxInfo = () => {
    if (!boxInfo) {
      return <p className="text-muted mb-0">There is no data box yet</p>
    }

    return (
      <div className="d-flex flex-column gap-2">
        <div>
          <small className="text-muted d-block">Box Number</small>
          <strong>{boxInfo.boxNumber || '-'}</strong>
        </div>
          <div>
            <small className="text-muted d-block">Assembly Order No</small>
            <strong>{boxInfo.assemblyOrderNo || '-'}</strong>
          </div>
        <div className="d-flex gap-3 flex-wrap">
          <div>
            <small className="text-muted d-block">Status</small>
            <strong>{boxInfo.status || '-'}</strong>
          </div>
          <div>
            <small className="text-muted d-block">Filled</small>
            <strong>
              {boxInfo.filled || 0}/{boxInfo.capacity || 0}
            </strong>
          </div>
          <div>
            <small className="text-muted d-block">Remaining</small>
            <strong>{boxInfo.remaining ?? '-'}</strong>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CRow className="g-4">
      <CCol md={4}>
        <CCard className="h-100">
          <CCardHeader>
            <strong>Scan Serial Box</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleScan}>
              <div className="mb-3">
                <CFormLabel className="fw-semibold">Serial Number</CFormLabel>
                <CFormInput
                  ref={scanInputRef}
                  autoComplete="off"
                  placeholder="Scan Here ..."
                  value={scanValue}
                  onChange={(e) => setScanValue(e.target.value)}
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleScan(e)
                    }
                  }}
                />
              </div>
            </CForm>

            <hr className="my-4" />

            <div>
              <h6 className="fw-semibold mb-3">Box Information</h6>
              {renderBoxInfo()}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md={8}>
        <CCard className="h-100">
          <CCardHeader>
            <strong>Scan Result Data</strong>
          </CCardHeader>
          <CCardBody className="p-0">
            {codesInBox.length === 0 ? (
              <div className="p-4 text-center text-muted">There is no serial data in the box yet</div>
            ) : (
              <CTable hover responsive align="middle" className="mb-0">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell scope="col" className="text-center">
                      #
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">Partial Code</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Full Code</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {[...codesInBox].reverse().map((code, index) => (
                    <CTableRow key={`${code.partialCode}-${index}`}>
                      <CTableHeaderCell scope="row" className="text-center">
                        {codesInBox.length - index}
                      </CTableHeaderCell>
                      <CTableDataCell>{code.partialCode || '-'}</CTableDataCell>
                      <CTableDataCell>{code.fullCode || '-'}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default GenerateBoxSerial
