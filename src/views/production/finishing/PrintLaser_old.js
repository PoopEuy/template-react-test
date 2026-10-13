import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  CRow,
  CCard,
  CCol,
  CCardBody,
  CCardHeader,
  CFormLabel,
  CFormInput,
  CForm,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { backendGenerate } from '../../../api/axios'

const FormRow = ({ label, children }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={4}>
      <CFormLabel className="fw-semibold">{label}</CFormLabel>
    </CCol>
    <CCol md={8}>{children}</CCol>
  </CRow>
)

const PrintLaser = () => {
  const location = useLocation()
  const [serialNumber, setSerialNumber] = useState('')
  const serialInputRef = useRef(null) // 🔑 simpan referensi ke input

  // fokus otomatis saat page load / nav pindah
  useEffect(() => {
    serialInputRef.current?.focus()
  }, [location.pathname]) // setiap pindah ke post1/post2 fokus ulang

  // tentukan post
  let postName = 'Post ?'
  let lasserNo = 0
  if (location.pathname.includes('post1')) {
    postName = 'Post 1'
    lasserNo = 1
  } else if (location.pathname.includes('post2')) {
    postName = 'Post 2'
    lasserNo = 2
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!serialNumber) {
      toast.error('Serial number cannot be empty')
      setSerialNumber('')
      serialInputRef.current?.focus()
      return
    }

    try {
      // Step 1: validate
      const validateRes = await backendGenerate.post('/validate', {
        serialCode: serialNumber,
      })

      if (!validateRes.data.data?.isValid) {
        toast.error(validateRes.data.data.message || 'Invalid serial')
        setSerialNumber('')
        serialInputRef.current?.focus()
        return
      }

      // Step 2: lassered
      const lasserRes = await backendGenerate.post('/lassered', {
        serialNumber: serialNumber,
        lasser: lasserNo,
      })

      console.log('lasserRes : ', lasserRes)
      if (lasserRes.data.success) {
        toast.success(lasserRes.data.message)
        setSerialNumber('')
      } else {
        toast.error(lasserRes.data.message)
        setSerialNumber('')
      }

      serialInputRef.current?.focus()
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Terjadi kesalahan koneksi ke server'
      toast.error(errorMsg)
      setSerialNumber('')
      serialInputRef.current?.focus()
    }
  }

  // submit otomatis saat scan (enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 h-100">
          <CCardHeader>
            <strong>Print Laser {postName}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <FormRow label="Serial Number">
                <CFormInput
                  name="serialNumber"
                  placeholder="Scan or input serial number"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  onKeyDown={handleKeyDown}
                  ref={serialInputRef} //pakai ref
                />
              </FormRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default PrintLaser
