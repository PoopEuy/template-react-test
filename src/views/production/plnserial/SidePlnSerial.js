import React, { useState, useEffect, useRef } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CRow } from '@coreui/react'
import { toast } from 'react-toastify'
import { backendGenerate, backendTracking } from '../../../api/axios'
import ImageContainer from '../../components/ImageContainer' // ✅ gunakan komponen reusable

const SidePlnSerial = () => {
  const [formData, setFormData] = useState({
    sideProdSnumb: '',
    sidePlnSerial: '',
  })

  const [pcbDisabled, setPcbDisabled] = useState(false)
  const [sidePlnDisable, setSidePlnDisable] = useState(true)

  const sideCoverInputRef = useRef(null)
  const sidePlnRef = useRef(null)

  useEffect(() => {
    sideCoverInputRef.current.focus()
    if (!sidePlnDisable && sidePlnRef.current) {
      sidePlnRef.current.focus()
    }
  }, [sidePlnDisable])

  const handlesideProdSnumb = async () => {
    try {
      const response = await backendTracking.get(`/serial/${formData.sideProdSnumb}`)
      if (response.data.success === true) {
        setPcbDisabled(true)
        setSidePlnDisable(false)
      } else {
        toast.error(response.data.message || 'Failed Get Item, Item Not Found')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed Get Item Data!')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const updatePlnCode = async (sideProdSnumb, sidePlnSerial) => {
    try {
      const payloadUpdate = {
        serial_number: sideProdSnumb,
        pln_code: sidePlnSerial,
      }

      const updateRes = await backendTracking.post('/update-pln-code', payloadUpdate)
      toast.success(updateRes.data?.message || 'PLN Code berhasil diupdate!')

      setFormData({ sideProdSnumb: '', sidePlnSerial: '' })
      setSidePlnDisable(true)
      setPcbDisabled(false)

      setTimeout(() => {
        sideCoverInputRef.current?.focus()
      }, 100)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal update PLN Code!')
    }
  }

  const handleSidePLNSerial = async () => {
    const { sidePlnSerial, sideProdSnumb } = formData
    if (!sidePlnSerial || !sideProdSnumb) {
      toast.warning('Serial number Side PLN Serial & Side Cover harus diisi!')
      return
    }

    try {
      const payloadValidate = { serialCode: sidePlnSerial }
      const response = await backendGenerate.post('/validate', payloadValidate)
      const validation = response.data?.data?.isValid

      if (!validation) {
        setFormData({ sideProdSnumb: '', sidePlnSerial: '' })
        setTimeout(() => sideCoverInputRef.current?.focus(), 100)
        toast.error(response.data?.data?.message || 'Side PLN Serial tidak valid!')
        return
      }

      await updatePlnCode(sideProdSnumb, sidePlnSerial)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat validasi!')
    }
  }

  return (
    <CRow>
      {/* Side Product Serial Number */}
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Side Product Serial Number</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <CRow className="mb-3">
                <CCol sm={12}>
                  <ImageContainer
                    src={`/images/assembly/kwhm_product_serial_side.jpeg`}
                    alt="Side Product Serial Number"
                    height="300px" // ✅ konsisten
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <div className="text-center">
                  <strong>Side Product Serial Number</strong>
                </div>
                <CCol sm={12} className="d-flex justify-content-center">
                  <CFormInput
                    type="text"
                    id="sideProdSnumb"
                    name="sideProdSnumb"
                    value={formData.sideProdSnumb}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handlesideProdSnumb()
                      }
                    }}
                    ref={sideCoverInputRef}
                    required
                    disabled={pcbDisabled}
                  />
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Side PLN Serial Number */}
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Side PLN Serial Number</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <CRow className="mb-3">
                <CCol sm={12}>
                  <ImageContainer
                    src={`/images/assembly/kwhm_pln_serial_side.jpeg`}
                    alt="Side PLN Serial Number"
                    height="300px" // ✅ konsisten
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <div className="text-center">
                  <strong>Side PLN Serial Number</strong>
                </div>
                <CCol sm={12} className="d-flex justify-content-center">
                  <CFormInput
                    type="text"
                    id="sidePlnSerial"
                    name="sidePlnSerial"
                    value={formData.sidePlnSerial}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSidePLNSerial()
                      }
                    }}
                    ref={sidePlnRef}
                    required
                    disabled={sidePlnDisable}
                  />
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default SidePlnSerial
