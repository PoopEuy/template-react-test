import React, { useState, useEffect, useRef } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CRow } from '@coreui/react'
import { backendTracking, backendQc } from '../../../api/axios'
import { toast } from 'react-toastify'
import ImageContainer from '../../components/ImageContainer'
import ValidationPopup from '../../components/ValidationPopup'

const ScanBeforeAssembly = () => {
  const [formData, setFormData] = useState({
    pcbSnumb: '',
    backCoverSnumb: '',
  })

  const [pcbDisabled, setPcbDisabled] = useState(false)
  const [backCoverDisabled, setBackCoverDisabled] = useState(true)
  const [feedback, setFeedback] = useState(null) // error popup

  const pcbInputRef = useRef(null)
  const backCoverInputRef = useRef(null)

  useEffect(() => {
    if (!pcbDisabled) {
      pcbInputRef.current?.focus()
    } else if (!backCoverDisabled) {
      backCoverInputRef.current?.focus()
    }
  }, [pcbDisabled, backCoverDisabled])

  useEffect(() => {
    if (!feedback) {
      return
    }

    const timer = setTimeout(() => {
      setFeedback(null)
    }, 5000)

    return () => clearTimeout(timer)
  }, [feedback])

  const resetForm = () => {
    setFormData({ pcbSnumb: '', backCoverSnumb: '' })
    setPcbDisabled(false)
    setBackCoverDisabled(true)
    setFeedback(null)
    setTimeout(() => pcbInputRef.current?.focus(), 100)
  }

  //validasi PCBA
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
      const validateResponse = await backendQc.get('/validation', {
        params: {
          serial_number: currentSerial,
          qc_id: 'QC-MP001',
        },
      })
      const { status, message, serial_number } = validateResponse.data
      // console.log('status : ', status)
      // console.log('message : ', message)
      // console.log('serial_number : ', serial_number)

      //jika belum burning
      if (status === 'not-burning') {
        setFeedback({
          title: 'PCB Validation Failed',
          message: validateResponse.data.message || 'Need to burn PCBA!',
          serialNumber: currentSerial,
        })
        return
      }

      //jika PCBA sudah digunakan
      if (status === 'already-used') {
        setFeedback({
          title: 'PCB Validation Failed',
          message: validateResponse.data.message || 'This PCB Serial Number is already used!',
          serialNumber: currentSerial,
        })
        return
      }

      //jika sudah burning namun fail
      if (status === 'FAIL') {
        setFeedback({
          title: 'PCB Validation Failed',
          message: validateResponse.data.message || 'PCB Serial Number is FAIL!',
          serialNumber: currentSerial,
        })
        return
      }

      //jika sudah burning dan pass (lanjut step selanjunya)
      if (status === 'PASS') {
        setFeedback(null)
        setPcbDisabled(true)
        setBackCoverDisabled(false)
        toast.success(validateResponse.data.message || 'PCB Serial Number is valid!')
      }

      // if (!validateResponse.data.data.isValid) {
      //   setFeedback({
      //     title: 'PCB Validation Failed',
      //     message: validateResponse.data.message || 'PCB Serial Number is invalid!',
      //     serialNumber: currentSerial,
      //   })
      //   return
      // }

      // setFeedback(null)
      // setPcbDisabled(true)
      // setBackCoverDisabled(false)
      // toast.success(validateResponse.data.message || 'PCB Serial Number is valid!')
    } catch (error) {
      setFeedback({
        title: 'PCB Validation Error',
        message: error.response?.data?.message || 'PCB validation failed!',
        serialNumber: currentSerial,
      })
    }
  }

  //matching BackCover
  const handleBackCover = async () => {
    if (!formData.pcbSnumb || !formData.backCoverSnumb) {
      setFeedback({
        title: 'Serial Number cannot be empty',
        message: 'Make sure PCB and Assembly serial have been scanned.',
        serialNumber: formData.backCoverSnumb,
      })
    }

    const assemblySerial = formData.backCoverSnumb?.trim()
    if (!assemblySerial) {
      setFeedback({
        title: 'Assembly Serial cannot be empty',
        message: 'Enter or scan the Assembly serial number.',
      })
      return
    }

    try {
      const assemblyResponse = await backendQc.get('/validation', {
        params: {
          serial_number: assemblySerial,
          qc_id: 'QC-MBC001',
        },
      })

      const { status, message, serial_number } = assemblyResponse.data
      // console.log('status : ', status)
      // console.log('message : ', message)
      // console.log('serial_number : ', serial_number)

      //jika belum dilakukan sub assy
      if (status === 'sub-assy-not-yet') {
        setFeedback({
          title: 'PCB Validation Failed',
          message: message || 'Must pass the Sub-Assembly process!',
          serialNumber: assemblySerial,
        })
        return
      }

      //jika sudah dilakukan sub assy namun FAIL
      if (status === 'sub-assy-fail') {
        setFeedback({
          title: 'PCB Validation Failed',
          message: message || 'Sub-Assembly process failed. Process cannot continue',
          serialNumber: assemblySerial,
        })
        return
      }

      //jika sudah dilakukan sub assy namun FAIL
      if (status === 'already-matching') {
        setFeedback({
          title: 'PCB Validation Failed',
          message: message || 'Back Cover Serial has already passed the Matching stage',
          serialNumber: assemblySerial,
        })
        return
      }

      //jika sudah dilakukan Aseembly Test namun belum matching
      if (status === 'assembly-test-exist') {
        setFeedback({
          title: 'PCB Validation Failed',
          message:
            message ||
            'Back Cover Serial has not been matched, but it has already gone through the Assembly Test process',
          serialNumber: assemblySerial,
        })
        return
      }

      //jika sudah Assembly Test (PASS) dan Lanjut Process Matching
      if (status === 'sub-assy-pass') {
        //lanjut ke submit

        const payload = {
          parent_serial_number: assemblySerial,
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
            serialNumber: assemblySerial,
          })
          toast.error(errorMessage)
          resetForm()
          return
        }
        setFeedback(null)
        toast.success(res.data?.message || 'Matching Successful! Data saved successfully!')
        resetForm()
      }
    } catch (error) {
      console.log('error nih')
      setFeedback({
        title: 'Assembly Error',
        message: error.response?.data?.message || 'Failed to validate or submit data!',
        serialNumber: assemblySerial,
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

        {/* Back Cover Serial Number */}
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
                      alt="Back Cover Preview"
                      height="300px"
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3 text-center">
                  <strong>SCAN Assembly SERIAL NUMBER</strong>
                  <CCol sm={12} className="d-flex justify-content-center mt-2">
                    <CFormInput
                      type="text"
                      id="backCoverSnumb"
                      name="backCoverSnumb"
                      value={formData.backCoverSnumb}
                      onChange={handleChange}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), handleBackCover())
                      }
                      ref={backCoverInputRef}
                      required
                      disabled={backCoverDisabled}
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
