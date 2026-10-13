import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
  CButton,
  CFormInput,
  CPagination,
  CPaginationItem,
  CFormTextarea,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX, cilCloudDownload, cilArrowLeft } from '@coreui/icons'
import { backendReceiving, cdnBackend } from '../../api/axios'
import { toast } from 'react-toastify'
import { CounterCard12 } from '../components/CounterCard'
import { useAuth } from '../../context/AuthContext'

// Komponen FormRow
const FormRow = ({ label, labelCols = '2', children }) => (
  <div className="mb-3 row">
    <label className={`col-sm-${labelCols} col-form-label`}>{label}</label>
    <div className={`col-sm-${12 - Number(labelCols)}`}>{children}</div>
  </div>
)

const ReceivingDetail = () => {
  const { user } = useAuth()
  const { receivingHeaderId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [header, setHeader] = useState(null)
  const [items, setItems] = useState([])

  const [scanningItem, setScanningItem] = useState(null)
  const [formData, setFormData] = useState({
    serialNumber: '',
    notes: '',
  })
  const [scannedQty, setScannedQty] = useState(0)
  const [trackedTotal, setTrackedTotal] = useState(0)
  const [isFormLocked, setIsFormLocked] = useState(false)

  // State untuk upload photo
  const [uploadingItem, setUploadingItem] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [uploading, setUploading] = useState(false)
  const [existingPhotos, setExistingPhotos] = useState([]) // Array of UUIDs from documentation_uuid

  // Ref untuk input file tambahan dan scroll focus
  const addMorePhotosRef = useRef(null)
  const scanSectionRef = useRef(null)
  const uploadSectionRef = useRef(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const fetchDetail = useCallback(async () => {
    setLoading(true)
    try {
      const res = await backendReceiving.get(`/receiving-headers/${receivingHeaderId}`)
      const headerData = res.data.data
      setHeader(headerData)
      setItems(headerData?.receiving_items || [])
    } catch (error) {
      toast.error('Failed to fetch receiving detail')
    } finally {
      setLoading(false)
    }
  }, [receivingHeaderId]) // cegah dependency

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  const handleScan = (item) => {
    if (scanningItem?.itemId === item.id) {
      setScanningItem(null)
      setCurrentPage(1)
    } else {
      // Tutup upload photo section jika terbuka
      if (uploadingItem) {
        previewUrls.forEach((url) => URL.revokeObjectURL(url))
        setUploadingItem(null)
        setSelectedFiles([])
        setPreviewUrls([])
      }
      fetchStagingItem(item)
      setCurrentPage(1)
      // Scroll ke scan section setelah render
      setTimeout(() => {
        scanSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const paginatedSerialNumbers = useMemo(() => {
    if (!scanningItem?.serialNumbers) return []

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return scanningItem.serialNumbers.slice(startIndex, endIndex)
  }, [scanningItem, currentPage])

  const fetchStagingItem = async (item) => {
    // setLoading(true)

    try {
      const stagingRes = await backendReceiving.get(`/serial-staging/receiving-item/${item.id}`)

      filterStageingItem(item, stagingRes)
    } catch (error) {
      toast.error('Failed to fetch Receiving Staging')
    } finally {
      // setLoading(false)
    }
  }

  const filterStageingItem = (item, stagingRes) => {
    // console.log('item scan : ', item.id)

    const itemName = item.product?.data?.name || 'Unknown Product'
    const stagingSummary = stagingRes.data.data.staging_summary
    const receivingItem = stagingRes.data.data.receiving_item
    const serialNumbers = stagingRes.data.data.serial_numbers

    const combinedData = {
      //Receiving
      // Dari item hasil select button scan
      itemId: item.id,
      itemName: itemName,

      //Serial Staging
      // Dari staging summary
      totalStaged: stagingSummary.total_staged,
      expectedQuantity: stagingSummary.expected_quantity,
      remainingStage: stagingSummary.remaining_to_stage,
      stagingComplete: stagingSummary.staging_complete,

      // Dari receiving_item
      receivingItemId: receivingItem.id,
      receivingHeadersId: receivingItem.receiving_headers_id,
      productId: receivingItem.product_id,
      isSerialized: receivingItem.is_serialized,
      quantity: receivingItem.quantity,
      notes: receivingItem.notes,
      itemType: receivingItem.item_type,
      createdAt: receivingItem.created_at,
      updatedAt: receivingItem.updated_at,

      // Header info
      grNumber: receivingItem.receiving_header?.gr_number || null,
      referenceAO: receivingItem.receiving_header?.reference_ao || null,

      // Tambahan: serial numbers array
      serialNumbers: serialNumbers,
    }

    setScanningItem(combinedData)
  }

  const handleInput = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAccept = async () => {
    console.log('Accept Handle')

    //login validation
    if (!user?.id || !user?.username) {
      toast.error('You must be logged in to submit a Purchase Order.')
      setTimeout(() => navigate('/login'), 1500)
      return
    }

    try {
      const payload = {
        status: 'accept',
        // received_by: user?.id, //OPTIONAL
        // received_date: new Date().toISOString(), //OPTIONAL
      }

      const response = await backendReceiving.put(
        `/receiving-headers/${receivingHeaderId}`,
        payload,
      )
      const successMessage = response?.data?.message || 'Receiving updated successfully'
      console.log('message : ', successMessage)
      toast.success(successMessage)
      fetchDetail() // refresh detail
    } catch (error) {
      const failures = error?.response?.data?.message?.failures

      if (Array.isArray(failures) && failures.length > 0) {
        failures.forEach((f) => {
          toast.error(f.message)
        })
      } else {
        toast.error(
          error?.response?.data?.message?.message || 'Gagal melakukan update pada receiving',
        )
      }
    }
  }

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to REJECT this receiving?')) return

    try {
      const payload = {
        status: 'reject',
      }

      await backendReceiving.put(`/receiving-headers/${receivingHeaderId}`, payload)
      toast.success('Receiving rejected successfully')
      fetchDetail() // refresh detail after reject
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Gagal melakukan reject pada receiving',
      )
    }
  }

  const handleSerial = async () => {
    const serialNumber = formData.serialNumber.replace(/\s+/g, '')
    if (!serialNumber) return

    const payload = {
      receiving_item_id: scanningItem.itemId,
      serial_number: serialNumber,
    }

    try {
      const response = await backendReceiving.post('/serial-staging', payload)

      // Ambil data serial baru dari response
      const newSerial = response.data.data

      // Toast sukses dari server
      toast.success(response.data.message || 'Serial Number berhasil disimpan')

      // Bersihkan input
      setFormData({ serialNumber: '' })

      // Optimistic update ke scanningItem (atau combinedData jika kamu pakai array)
      setScanningItem((prev) => ({
        ...prev,
        totalStaged: prev.totalStaged + 1,
        remainingStage: prev.remainingStage - 1,
        serialNumbers: [newSerial, ...(prev.serialNumbers || [])],
      }))

      // (Opsional) auto scroll atau highlight serial baru
      setTimeout(() => {
        document.getElementById('serial-top')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Terjadi kesalahan saat menyimpan Serial Number'

      toast.error(message)
      console.error('Gagal simpan Serial Number:', error)
    }
  }

  // Handler untuk membuka form upload photo
  const handleUploadPhoto = (item) => {
    if (uploadingItem?.id === item.id) {
      // Cleanup preview URLs
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
      setUploadingItem(null)
      setSelectedFiles([])
      setPreviewUrls([])
      setExistingPhotos([])
    } else {
      // Tutup scan section jika terbuka
      if (scanningItem) {
        setScanningItem(null)
        setCurrentPage(1)
      }
      // Cleanup previous preview URLs if any
      previewUrls.forEach((url) => URL.revokeObjectURL(url))

      // Parse documentation_uuid jika ada
      let photoUuids = []
      if (item.documentation_uuid && item.documentation_uuid.trim() !== '') {
        photoUuids = item.documentation_uuid.split(',').map((uuid) => uuid.trim())
      }

      setUploadingItem(item)
      setSelectedFiles([])
      setPreviewUrls([])
      setExistingPhotos(photoUuids)

      // Scroll ke upload section setelah render
      setTimeout(() => {
        uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  // Handler untuk memilih file dengan validasi 10MB
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    const validFiles = []
    const invalidFiles = []

    files.forEach((file) => {
      if (file.size > maxSize) {
        invalidFiles.push(file.name)
      } else {
        validFiles.push(file)
      }
    })

    if (invalidFiles.length > 0) {
      toast.error(
        `File berikut melebihi 10MB: ${invalidFiles.join(', ')}. File tidak akan diupload.`,
      )
    }

    // Cleanup old preview URLs
    previewUrls.forEach((url) => URL.revokeObjectURL(url))

    // Create new preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file))

    setSelectedFiles(validFiles)
    setPreviewUrls(newPreviewUrls)
  }

  // Handler untuk menambah foto tambahan (tidak replace yang sudah ada)
  const handleAddMorePhotos = (e) => {
    const files = Array.from(e.target.files)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    const validFiles = []
    const invalidFiles = []

    files.forEach((file) => {
      if (file.size > maxSize) {
        invalidFiles.push(file.name)
      } else {
        validFiles.push(file)
      }
    })

    if (invalidFiles.length > 0) {
      toast.error(
        `File berikut melebihi 10MB: ${invalidFiles.join(', ')}. File tidak akan diupload.`,
      )
    }

    // Create preview URLs untuk file baru
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file))

    // Gabungkan dengan file dan preview yang sudah ada
    setSelectedFiles([...selectedFiles, ...validFiles])
    setPreviewUrls([...previewUrls, ...newPreviewUrls])

    // Reset input file
    e.target.value = ''
  }

  // Handler untuk hapus gambar individual
  const handleRemoveImage = (index) => {
    // Cleanup URL yang dihapus
    URL.revokeObjectURL(previewUrls[index])

    // Remove dari array
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previewUrls.filter((_, i) => i !== index)

    setSelectedFiles(newFiles)
    setPreviewUrls(newPreviews)
  }

  // Handler untuk submit upload
  const handleSubmitUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.warning('Silakan pilih file untuk diupload')
      return
    }

    setUploading(true)
    try {
      // Step 1: Upload files ke CDN
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })
      formData.append('receivingItemId', uploadingItem.id)
      formData.append('documentType', 'photo')

      const uploadResponse = await cdnBackend.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Step 2: Extract UUIDs dari response
      const uploadedDocuments = uploadResponse.data.data
      const newDocumentUuids = uploadedDocuments.map((doc) => doc.id)

      // Step 3: Gabungkan dengan existing UUIDs jika ada
      const allUuids = [...existingPhotos, ...newDocumentUuids]
      const documentUuidsString = allUuids.join(',')

      // Step 4: Update receiving item dengan documentation_uuid
      await backendReceiving.put(`/receiving-items/${uploadingItem.id}`, {
        documentation_uuid: documentUuidsString,
      })

      // Success
      toast.success(uploadResponse.data.message || `${selectedFiles.length} file berhasil diupload`)

      // Cleanup preview URLs
      previewUrls.forEach((url) => URL.revokeObjectURL(url))

      // Reset state
      setUploadingItem(null)
      setSelectedFiles([])
      setPreviewUrls([])
      setExistingPhotos([])

      // Refresh data
      fetchDetail()
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Gagal mengupload file'
      toast.error(message)
      console.error('Error upload:', error)
    } finally {
      setUploading(false)
    }
  }

  // Handler untuk download semua foto
  const handleDownloadAllPhotos = async () => {
    if (!uploadingItem?.id) return

    try {
      const response = await cdnBackend.get(
        `/documents/bulk-download/receiving-item/${uploadingItem.id}`,
        {
          responseType: 'blob', // Important untuk download file
        },
      )

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `photos-receiving-item-${uploadingItem.id}.zip`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Photos downloaded successfully')
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to download photos'
      toast.error(message)
      console.error('Error downloading photos:', error)
    }
  }

  // Handler untuk delete existing photo
  const handleDeleteExistingPhoto = async (uuid, index) => {
    // Konfirmasi security
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this photo?\n\nThis action cannot be undone.`,
    )

    if (!confirmDelete) return

    try {
      // Step 1: Delete dari CDN
      await cdnBackend.delete(`/documents/${uuid}`)

      // Step 2: Update state - remove UUID dari array
      const updatedUuids = existingPhotos.filter((id) => id !== uuid)
      setExistingPhotos(updatedUuids)

      // Step 3: Update receiving item dengan documentation_uuid yang baru
      const documentUuidsString = updatedUuids.join(',')
      await backendReceiving.put(`/receiving-items/${uploadingItem.id}`, {
        documentation_uuid: documentUuidsString || null, // null jika kosong
      })

      toast.success('Photo deleted successfully')

      // Refresh data untuk sync dengan backend
      fetchDetail()
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to delete photo'
      toast.error(message)
      console.error('Error deleting photo:', error)
    }
  }

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '300px' }}
      >
        <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <strong>Receiving Detail - GR Number: {header?.gr_number}</strong>
              <CButton
                color="secondary"
                size="sm"
                onClick={() => navigate(-1)}
                className="d-flex align-items-center"
              >
                <CIcon icon={cilArrowLeft} className="me-1" />
                Back
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <div className="fw-semibold">PO Number</div>
                <div>{header?.purchase_order?.po_number || '-'}</div>
              </CCol>
              <CCol md={6}>
                <div className="fw-semibold">Batch</div>
                <div>{header?.batch || '-'}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <div className="fw-semibold">Status</div>
                <CBadge
                  color={
                    header?.status === 'complete'
                      ? 'success'
                      : header?.status === 'reject'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {header?.status}
                </CBadge>
              </CCol>
              <CCol md={6}>
                <div className="fw-semibold">Received Date</div>
                <div>
                  {header?.received_date
                    ? new Date(header.received_date).toLocaleDateString()
                    : '-'}
                </div>
              </CCol>
            </CRow>

            {/* <CRow className="mb-3">
              <CCol md={6}>
                <FormRow label="Notes">
                  <CFormTextarea
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInput}
                    placeholder="Write any additional notes"
                  />
                </FormRow>
              </CCol>

              <CCol md={6}>
                <div className="fw-semibold">Location</div>
                <div>{header?.location || '-'}</div>
              </CCol>
            </CRow> */}

            <CRow className="mb-3"></CRow>

            <h5 className="mt-4">
              <b>Receiving Items</b>
            </h5>
            <CTable bordered responsive>
              <CTableHead>
                <CTableRow className="text-center">
                  <CTableHeaderCell>No</CTableHeaderCell>
                  <CTableHeaderCell>Product</CTableHeaderCell>
                  <CTableHeaderCell>Item Type</CTableHeaderCell>
                  <CTableHeaderCell>Qty</CTableHeaderCell>
                  <CTableHeaderCell>Serialized</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <CTableRow key={item.id || index} className="text-center align-middle">
                      <CTableDataCell className="align-middle">{index + 1}</CTableDataCell>
                      <CTableDataCell className="align-middle">
                        {item.product?.data?.name || '-'}
                      </CTableDataCell>
                      <CTableDataCell className="align-middle">{item.item_type}</CTableDataCell>
                      <CTableDataCell className="align-middle">{item.quantity}</CTableDataCell>
                      <CTableDataCell className="align-middle">
                        {item.is_serialized ? 'Yes' : 'No'}
                      </CTableDataCell>
                      <CTableDataCell className="align-middle">
                        {item.is_serialized ? (
                          <div className="d-flex flex-column gap-2 align-items-center">
                            <CButton
                              size="sm"
                              color="success"
                              onClick={() => handleScan(item)}
                              className="text-white"
                            >
                              Scan
                            </CButton>
                            <CButton
                              size="sm"
                              color="warning"
                              onClick={() => handleUploadPhoto(item)}
                              className="text-white"
                            >
                              Upload Photo
                            </CButton>
                          </div>
                        ) : (
                          <CButton
                            size="sm"
                            color="warning"
                            onClick={() => handleUploadPhoto(item)}
                            className="d-block mx-auto text-white"
                          >
                            Upload Photo
                          </CButton>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan={6} className="text-center">
                      No items found
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>

            {header?.status !== 'completed' && header?.status !== 'accept' && (
              <div className="d-flex justify-content-between mt-3">
                <CCol md={12} className="d-flex justify-content-end align-items-end">
                  <CButton color="danger" className="me-2 text-white" onClick={handleReject}>
                    Reject
                  </CButton>
                  <CButton color="success" className="text-white" onClick={handleAccept}>
                    Accept
                  </CButton>
                </CCol>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {scanningItem && (
        <CCol xs={12} ref={scanSectionRef}>
          <CRow>
            {' '}
            {/* Kiri: Info dan Input */}
            <CCol md={6}>
              <CCard className="mb-4 h-100">
                <CCardHeader>
                  <strong>Scan Serial Number : {scanningItem.itemName || '-'}</strong>
                </CCardHeader>
                <CCardBody>
                  <FormRow label="Serial Number" labelCols="2">
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
                      disabled={isFormLocked}
                    />
                  </FormRow>
                  <CounterCard12 title="Expected Quantity" value={scanningItem.expectedQuantity} />
                  <CounterCard12 title="Remaining Quantity" value={scanningItem.remainingStage} />
                </CCardBody>
              </CCard>
            </CCol>
            {/* Kanan: Tabel Serial Numbers */}
            <CCol md={6}>
              <CCard className="mb-4 h-100">
                <CCardHeader>
                  <strong>Staged Serial Numbers || Total Staged: {scanningItem.totalStaged}</strong>
                </CCardHeader>
                <CCardBody className="d-flex flex-column">
                  <div className="flex-grow-1 overflow-auto">
                    <CTable striped hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>No</CTableHeaderCell>
                          <CTableHeaderCell>Serial Number</CTableHeaderCell>
                          <CTableHeaderCell>Staged At</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {paginatedSerialNumbers.map((sn, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell>
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </CTableDataCell>
                            <CTableDataCell>{sn.serial_number}</CTableDataCell>
                            <CTableDataCell>
                              {new Date(sn.created_at).toLocaleString()}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>

                  {/* Pagination Control */}
                  <div className="d-flex justify-content-end mt-3">
                    <CPagination>
                      <CPaginationItem
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                      >
                        Previous
                      </CPaginationItem>
                      {Array.from({
                        length: Math.ceil(scanningItem.serialNumbers.length / itemsPerPage),
                      }).map((_, i) => (
                        <CPaginationItem
                          key={i}
                          active={i + 1 === currentPage}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </CPaginationItem>
                      ))}
                      <CPaginationItem
                        disabled={
                          currentPage ===
                          Math.ceil(scanningItem.serialNumbers.length / itemsPerPage)
                        }
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
        </CCol>
      )}

      {uploadingItem && (
        <CCol xs={12} ref={uploadSectionRef}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Upload Photo - {uploadingItem.product?.data?.name || '-'}</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={6}>
                  <div className="fw-semibold">Product Name</div>
                  <div>{uploadingItem.product?.data?.name || '-'}</div>
                </CCol>
                <CCol md={6}>
                  <div className="fw-semibold">Item Type</div>
                  <div>{uploadingItem.item_type || '-'}</div>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <div className="fw-semibold">Quantity</div>
                  <div>{uploadingItem.quantity || '-'}</div>
                </CCol>
                <CCol md={6}>
                  <div className="fw-semibold">Serialized</div>
                  <div>{uploadingItem.is_serialized ? 'Yes' : 'No'}</div>
                </CCol>
              </CRow>

              {/* Existing Photos Section */}
              {existingPhotos.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Existing Photos ({existingPhotos.length}):</h6>
                    <CButton
                      size="sm"
                      color="primary"
                      onClick={handleDownloadAllPhotos}
                      disabled={uploading}
                    >
                      <CIcon icon={cilCloudDownload} className="me-1" />
                      Download All
                    </CButton>
                  </div>
                  <CRow className="g-3">
                    {existingPhotos.map((uuid, index) => (
                      <CCol key={uuid} xs={6} md={4} lg={3}>
                        <CCard className="h-100 shadow-sm existing-photo-card position-relative">
                          <button
                            className="photo-preview-close-btn position-absolute top-0 end-0"
                            onClick={() => handleDeleteExistingPhoto(uuid, index)}
                            disabled={uploading}
                            title="Delete this photo"
                          >
                            <CIcon icon={cilX} size="sm" />
                          </button>
                          <div className="photo-preview-container">
                            <img
                              src={`${cdnBackend.defaults.baseURL}/documents/${uuid}/thumbnail`}
                              alt={`Photo ${index + 1}`}
                              className="photo-preview-image"
                              onError={(e) => {
                                e.target.src =
                                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'
                              }}
                            />
                          </div>
                          <CCardBody className="p-2 text-center">
                            <small className="text-muted photo-preview-filesize">
                              Photo {index + 1}
                            </small>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    ))}
                  </CRow>
                </div>
              )}

              {/* Upload New Photos Section */}
              <FormRow label="Select Photos" labelCols="2">
                <CFormInput
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                <small className="text-muted">
                  Maximum file size: 10MB per file. You can select multiple files.
                </small>
              </FormRow>

              {selectedFiles.length > 0 && (
                <div className="mb-3 mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Preview Gambar ({selectedFiles.length} file):</h6>
                    <div>
                      <input
                        type="file"
                        ref={addMorePhotosRef}
                        multiple
                        accept="image/*"
                        onChange={handleAddMorePhotos}
                        style={{ display: 'none' }}
                      />
                      <CButton
                        size="sm"
                        color="primary"
                        variant="outline"
                        onClick={() => addMorePhotosRef.current?.click()}
                        disabled={uploading}
                      >
                        <CIcon icon={cilPlus} className="me-1" />
                        Add More Photos
                      </CButton>
                    </div>
                  </div>
                  <CRow className="g-3 mt-2">
                    {selectedFiles.map((file, index) => (
                      <CCol key={index} xs={6} md={4} lg={3}>
                        <CCard className="h-100 position-relative shadow-sm">
                          <button
                            className="photo-preview-close-btn position-absolute top-0 end-0"
                            onClick={() => handleRemoveImage(index)}
                            disabled={uploading}
                          >
                            <CIcon icon={cilX} size="sm" />
                          </button>
                          <div className="photo-preview-container">
                            <img
                              src={previewUrls[index]}
                              alt={file.name}
                              className="photo-preview-image"
                            />
                          </div>
                          <CCardBody className="p-2">
                            <small
                              className="text-truncate d-block photo-preview-filename"
                              title={file.name}
                            >
                              {file.name}
                            </small>
                            <small className="text-muted photo-preview-filesize">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </small>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    ))}
                  </CRow>
                </div>
              )}

              <div className="d-flex justify-content-end gap-2">
                <CButton
                  color="secondary"
                  onClick={() => {
                    // Cleanup preview URLs
                    previewUrls.forEach((url) => URL.revokeObjectURL(url))
                    setUploadingItem(null)
                    setSelectedFiles([])
                    setPreviewUrls([])
                  }}
                  disabled={uploading}
                >
                  Cancel
                </CButton>
                <CButton
                  color="success"
                  className="text-white"
                  onClick={handleSubmitUpload}
                  disabled={uploading || selectedFiles.length === 0}
                >
                  {uploading ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      )}
    </CRow>
  )
}

export default ReceivingDetail
