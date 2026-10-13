import React, { useState, useEffect, useRef } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CRow } from '@coreui/react'
import { backendTracking } from '../../../api/axios'
import { toast } from 'react-toastify'
import ImageContainer from '../../components/ImageContainer'
import ValidationPopup from '../../components/ValidationPopup'

const ScanBeforeAssembly = () => {
  const [formData, setFormData] = useState({
    pcbSnumb: '',
    sideCoverSnumb: '',
  })

  const [pcbDisabled, setPcbDisabled] = useState(false)
  const [sideCoverDisabled, setSideCoverDisabled] = useState(true)
  const [feedback, setFeedback] = useState(null) // error popup

  const pcbInputRef = useRef(null)
  const sideCoverInputRef = useRef(null)

  useEffect(() => {
    if (!pcbDisabled) {
      pcbInputRef.current?.focus()
    } else if (!sideCoverDisabled) {
      sideCoverInputRef.current?.focus()
    }
  }, [pcbDisabled, sideCoverDisabled])

  useEffect(() => {
    if (!feedback) {
      return
    }

    const timer = setTimeout(() => {
      setFeedback(null)
    }, 3000)

    return () => clearTimeout(timer)
  }, [feedback])

  const resetForm = () => {
    setFormData({ pcbSnumb: '', sideCoverSnumb: '' })
    setPcbDisabled(false)
    setSideCoverDisabled(true)
    setFeedback(null)
    setTimeout(() => pcbInputRef.current?.focus(), 100)
  }

  const handlePcbSnumb = async () => {
    const currentSerial = formData.pcbSnumb?.trim()

    if (!currentSerial) {
      setFeedback({
        title: 'PCB serial cannot be empty',
        message: 'Enter or scan the PCB serial number first.',
        serialNumber: currentSerial,
      })
      return
    }

    try {
      const validateResponse = await backendTracking.get('/validate', {
        params: {
          serial_number: currentSerial,
          tracking_type: 'receiving',
        },
      })

      if (!validateResponse.data.data.isValid) {
        setFeedback({
          title: 'PCB Validation Failed',
          message: validateResponse.data.message || 'PCB Serial Number is invalid!',
          serialNumber: currentSerial,
        })
        return
      }

      setFeedback(null)
      setPcbDisabled(true)
      setSideCoverDisabled(false)
      toast.success(validateResponse.data.message || 'PCB Serial Number is valid!')
    } catch (error) {
      setFeedback({
        title: 'PCB Validation Error',
        message: error.response?.data?.message || 'PCB validation failed!',
        serialNumber: currentSerial,
      })
    }
  }

  const handleSideCover = async () => {
    if (!formData.pcbSnumb || !formData.sideCoverSnumb) {
      setFeedback({
        title: 'Serial Number cannot be empty',
        message: 'Make sure PCB and Assembly serial have been scanned.',
        serialNumber: formData.sideCoverSnumb,
      })
      return
    }

    const currentSerial = formData.sideCoverSnumb?.trim()
    if (!currentSerial) {
      setFeedback({
        title: 'Assembly Serial cannot be empty',
        message: 'Enter or scan the Assembly serial number.',
      })
      return
    }

    try {
      const assemblyResponse = await backendTracking.get('/validate', {
        params: {
          serial_number: currentSerial,
          tracking_type: 'assembly',
        },
      })

      if (!assemblyResponse.data.data.isValid) {
        setFeedback({
          title: 'Assembly Validation Failed',
          message: assemblyResponse.data.message || 'Assembly Serial Number is invalid!',
          serialNumber: currentSerial,
        })
        return
      }

      const payload = {
        parent_serial_number: currentSerial,
        component_serial_number: formData.pcbSnumb,
        quantity: 1,
      }

      const res = await backendTracking.post('/assembly-components/by-serial', payload)
      const isSuccess = res.data?.success

      if (isSuccess === false) {
        const errorMessage = res.data?.message || 'Matching failed! Please try again.'
        setFeedback({
          title: 'Matching Failed',
          message: errorMessage,
          serialNumber: currentSerial,
        })
        toast.error(errorMessage)
        resetForm()
        return
      }

      setFeedback(null)
      toast.success(res.data?.message || 'Matching Successful! Data saved successfully!')
      resetForm()
    } catch (error) {
      console.log('error nih')
      setFeedback({
        title: 'Assembly Error',
        message: error.response?.data?.message || 'Failed to validate or submit data!',
        serialNumber: currentSerial,
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <CRow>
        {/* PCB Serial Number */}
        <CCol xs={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>PCB Serial Number</strong>
            </CCardHeader>
            <CCardBody>
              <CForm>
                <CRow className="mb-3">
                  <CCol sm={12}>
                    <ImageContainer
                      src="/images/assembly/pcb_serial_number.jpeg"
                      alt="PCB Preview"
                      height="300px"
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3 text-center">
                  <strong>PCB SERIAL NUMBER</strong>
                  <CCol sm={12} className="d-flex justify-content-center mt-2">
                    <CFormInput
                      type="text"
                      id="pcbSnumb"
                      name="pcbSnumb"
                      value={formData.pcbSnumb}
                      onChange={handleChange}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handlePcbSnumb())}
                      ref={pcbInputRef}
                      required
                      disabled={pcbDisabled}
                    />
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Side Cover Serial Number */}
        <CCol xs={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Assembly Serial Number</strong>
            </CCardHeader>
            <CCardBody>
              <CForm>
                <CRow className="mb-3">
                  <CCol sm={12}>
                    <ImageContainer
                      src="/images/assembly/assembly_serial_no_pcb.jpeg"
                      alt="Side Cover Preview"
                      height="300px"
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3 text-center">
                  <strong>SCAN Assembly SERIAL NUMBER</strong>
                  <CCol sm={12} className="d-flex justify-content-center mt-2">
                    <CFormInput
                      type="text"
                      id="sideCoverSnumb"
                      name="sideCoverSnumb"
                      value={formData.sideCoverSnumb}
                      onChange={handleChange}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), handleSideCover())
                      }
                      ref={sideCoverInputRef}
                      required
                      disabled={sideCoverDisabled}
                    />
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <ValidationPopup
        visible={!!feedback}
        type="error"
        title={feedback?.title}
        serialNumber={feedback?.serialNumber}
        message={feedback?.message}
        onClose={resetForm}
      />
    </>
  )
}

export default ScanBeforeAssembly
