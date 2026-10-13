import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CPagination,
  CPaginationItem,
  CRow,
} from '@coreui/react'
import {
  backendIncoming,
  backendPartner,
  backendProduct,
  backendUploadFile,
} from '../../../api/axios'

const formatDate = (iso) =>
  new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const cardStyle = {
  height: '420px',
  display: 'flex',
  flexDirection: 'column',
}

const cardBodyStyle = {
  flex: '1 1 auto',
  overflowY: 'auto',
}

const IncomingPage = () => {
  const [modalImageVisible, setModalImageVisible] = useState(false)
  const [modalImageSrc, setModalImageSrc] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [headerLoading, setHeaderLoading] = useState(false)
  const [detailLoading, setdetailLoading] = useState(false)
  const [sapData, setSapData] = useState([])
  const [partnerData, setPartnerData] = useState([])
  const [idHeader, setIdHeader] = useState(null)
  const [idDetail, setIdDetail] = useState(null)
  const [modalHeaderVisible, setModalHeaderVisible] = useState(false)
  const [modalDetailVisible, setModalDetailVisible] = useState(false)
  const [incomingData, setIncomingData] = useState({
    data: [],
    total: 1,
    page: 1,
    limit: 1,
    totalPages: 1,
  })
  const [formHeaderData, setFormHeaderData] = useState({
    reference_po: '',
    reference_gr: '',
    notes: '',
  })
  const [formDetailData, setFormDetailData] = useState({
    sap_code: '',
    partner_code: '',
    ref_quantity: '',
    incoming_batch: '',
    incoming_quantity: '',
    remaining_quantity: '',
    sample_quantity: '',
    inspect_quantity: '',
    file: null,
  })

  const fetchData = async (page = 1, reference_po = '') => {
    try {
      setLoading(true)
      const { data } = await backendIncoming.get(`/master-rp`, {
        params: { limit: 12, page, reference_po },
      })
      setIncomingData(data)
    } catch (error) {
      console.log('error : ~ IncomingPage : fetching data', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchImage = async (path) => {
    try {
      const response = await backendUploadFile.get(`/images/semi-product`, {
        params: { path },
        responseType: 'blob', // <-- penting!
      })
      const blobUrl = URL.createObjectURL(response.data)
      return blobUrl
    } catch (error) {
      console.log('error : ~ IncomingPage : fetching Image', error)
      return null
    }
  }

  const deleteHeader = async (id) => {
    if (!window.confirm('Delete this Header')) return
    try {
      await backendIncoming.delete(`/master-rp/header/${id}`)
      fetchData(incomingData.page)
    } catch (error) {
      console.log('error : ~ IncomingPage : deleteHeader', error)
    }
  }

  const deleteDetails = async (id) => {
    if (!window.confirm('Delete this Detail?')) return
    try {
      await backendIncoming.delete(`/master-rp/detail/${id}`)
      fetchData(incomingData.page)
    } catch (error) {
      console.log('error : ~ IncomingPage : deleteDetails', error)
    }
  }

  const handleFetchImage = async (imgPath) => {
    const url = await fetchImage(imgPath)
    setModalImageSrc(url)
    setModalImageVisible(true)
  }

  const handleHeaderChange = (e) => {
    const { name, value } = e.target
    setFormHeaderData((p) => ({ ...p, [name]: value }))
  }

  const handleDetailChange = (e) => {
    const { name, value, type, files } = e.target
    if (name === 'inspect_quantity') {
      return setFormDetailData((p) => ({
        ...p,
        inspect_quantity: value === 'true',
      }))
    }

    setFormDetailData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }))
  }

  const handleOpenModel = (mode, rowData) => {
    if (mode === 'header') {
      setModalHeaderVisible(true)
      setIdHeader(rowData.id)
      setFormHeaderData({
        reference_po: rowData.reference_po ?? '',
        reference_gr: rowData.reference_gr ?? '',
        notes: rowData.notes ?? '',
      })
    }
    if (mode === 'detail') {
      setModalDetailVisible(true)
      setIdDetail(rowData.id)
      setFormDetailData({
        sap_code: rowData.sap_code,
        partner_code: rowData.partner_code ?? '',
        ref_quantity: rowData.ref_quantity ?? '',
        incoming_batch: rowData.incoming_batch ?? '',
        incoming_quantity: rowData.incoming_quantity ?? '',
        remaining_quantity: rowData.remaining_quantity ?? '',
        sample_quantity: rowData.sample_quantity ?? '',
        inspect_quantity: rowData.inspect_quantity ?? '',
        image: rowData.img ?? '',
      })
    }
  }

  const handleEditHeader = async () => {
    try {
      setHeaderLoading(true)
      const payload = {
        reference_po: formHeaderData.reference_po,
        reference_gr: formHeaderData.reference_gr,
        notes: formHeaderData.notes,
      }
      //   console.log(payload)

      await backendIncoming.put(`/master-rp/header/${idHeader}`, payload)
      setModalHeaderVisible(false)
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setHeaderLoading(false)
    }
  }

  const handleDetailHeader = async () => {
    try {
      setdetailLoading(true)
      let uploadedFileName = ''
      if (formDetailData.file) {
        const { data } = await backendUploadFile.post(
          '/semi-product',
          { file: formDetailData.file },
          { headers: { 'Content-Type': 'multipart/form-data' } },
        )
        uploadedFileName = data.URL ?? 'example-image.jpg'
      }
      const payload = {
        sap_code: formDetailData.sap_code,
        partner_code: formDetailData.partner_code,
        ref_quantity: Number(formDetailData.ref_quantity),
        incoming_batch: Number(formDetailData.incoming_batch),
        incoming_quantity: Number(formDetailData.incoming_quantity),
        remaining_quantity: Number(formDetailData.remaining_quantity),
        sample_quantity: Number(formDetailData.sample_quantity),
        inspect_quantity: formDetailData.inspect_quantity,
        img: uploadedFileName,
      }
      // console.log(payload)

      await backendIncoming.put(`/master-rp/detail/${idDetail}`, payload)
      setModalDetailVisible(false)
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setdetailLoading(false)
    }
  }

  /* ---------- fetch master ---------- */
  useEffect(() => {
    ;(async () => {
      const [sapRes, partnerRes] = await Promise.all([
        backendProduct.get('/master-products'),
        backendPartner.get('/master'),
      ])
      setSapData(sapRes.data.data)
      setPartnerData(partnerRes.data.data)
    })()
    fetchData()
  }, [])

  return (
    <>
      {/* -------------input search------------- */}
      <CRow className="mb-3">
        <CCol md={4}>
          <CFormInput
            placeholder="Search Reference PO"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              fetchData(1, e.target.value) // search saat mengetik
            }}
          />
        </CCol>
      </CRow>
      {/* --------- Card----------- */}
      <CRow>
        {loading && <div className="text-center py-5 fw-semibold">Loading …</div>}
        {!loading && incomingData.data.length === 0 && (
          <div className="text-center py-5 fw-semibold">Tidak ada data</div>
        )}
        {incomingData.data.map((header) => (
          <CCol md={4} key={header.id}>
            <CCard style={cardStyle} className="mb-3 shadow-sm">
              <CCardHeader className="d-flex justify-content-between align-items-center fw-bold">
                {header.receiving_code}
                <div className="btn-group ms-auto">
                  <CButton
                    className="fw-bold text-white me-1"
                    size="sm"
                    color="success"
                    onClick={() => handleOpenModel('header', header)}
                  >
                    Edit
                  </CButton>
                  <CButton
                    className="fw-bold text-white me-1"
                    size="sm"
                    color="danger"
                    onClick={() => deleteHeader(header.id)}
                  >
                    Delete
                  </CButton>
                </div>
              </CCardHeader>
              <CCardBody style={cardBodyStyle}>
                <p>
                  <strong>Reference PO:</strong> {header.reference_po}
                </p>
                <p>
                  <strong>Reference GR:</strong> {header.reference_gr}
                </p>
                <p>
                  <strong>Notes:</strong> {header.notes}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(header.created_at)}
                </p>
                <hr />
                {(header.details ?? []).map((d) => (
                  <CCard key={d.id} className="mb-3">
                    <CCardBody>
                      <p>
                        <strong>SAP Code:</strong> {d.sap_code}
                      </p>
                      <p>
                        <strong>Partner:</strong> {d.partner_code}
                      </p>
                      <p>
                        <strong>Sample:</strong> {d.sample_quantity}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {d.incoming_quantity} / {d.ref_quantity}
                      </p>
                      <p>
                        <strong>Inspect:</strong> {d.inspect_quantity ? '✅' : '❌'}
                      </p>
                      <div className="text-center ">
                        <CButton
                          className="fw-bold text-white"
                          color="info"
                          size="sm"
                          onClick={() => handleFetchImage(d.img)}
                        >
                          Lihat Gambar
                        </CButton>
                      </div>
                      <div className="d-flex justify-content-center gap-2 mt-2">
                        <CButton
                          className="fw-bold text-white me-1"
                          size="sm"
                          color="success"
                          onClick={() => handleOpenModel('detail', d)}
                        >
                          Edit
                        </CButton>
                        <CButton
                          className="fw-bold text-white"
                          size="sm"
                          color="danger"
                          onClick={() => deleteDetails(d.id)}
                        >
                          Delete
                        </CButton>
                      </div>
                    </CCardBody>
                  </CCard>
                ))}
              </CCardBody>
            </CCard>
          </CCol>
        ))}
        {/* ---- pagination ---- */}
        {incomingData.totalPages > 1 && (
          <CPagination className="justify-content-center">
            <CPaginationItem
              disabled={incomingData.page === 1}
              onClick={() => fetchData(incomingData.page - 1, searchTerm)}
            >
              &laquo;
            </CPaginationItem>

            {Array.from({ length: incomingData.totalPages }).map((_, i) => (
              <CPaginationItem
                key={i + 1}
                active={incomingData.page === i + 1}
                onClick={() => fetchData(i + 1, searchTerm)}
              >
                {i + 1}
              </CPaginationItem>
            ))}

            <CPaginationItem
              disabled={incomingData.page === incomingData.totalPages}
              onClick={() => fetchData(incomingData.page + 1, searchTerm)}
            >
              &raquo;
            </CPaginationItem>
          </CPagination>
        )}
      </CRow>
      {/* ---------- MODAL Header ---------- */}
      <CModal visible={modalHeaderVisible} onClose={() => setModalHeaderVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Edit Header</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* Reference Code */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Reference Code</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="reference_po"
                  value={formHeaderData.reference_po}
                  onChange={handleHeaderChange}
                />
              </CCol>
            </CRow>

            {/* Reference GR */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Reference GR</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="reference_gr"
                  value={formHeaderData.reference_gr}
                  onChange={handleHeaderChange}
                />
              </CCol>
            </CRow>

            {/* Notes */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Notes</CFormLabel>
              <CCol sm={9}>
                <CFormTextarea
                  name="notes"
                  value={formHeaderData.notes}
                  onChange={handleHeaderChange}
                  required
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalHeaderVisible(false)}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={() => {
              handleEditHeader()
            }}
            disabled={headerLoading}
          >
            {loading ? 'Loading...' : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ---------- MODAL Details ---------- */}
      <CModal visible={modalDetailVisible} onClose={() => setModalDetailVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Edit Detail</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {/* Total Quantity */}
          <CRow className="mb-3">
            <CFormLabel htmlFor="ref_quantity" className="col-sm-2 col-form-label">
              Total Quantity
            </CFormLabel>
            <CCol sm={10}>
              <CFormInput
                type="number"
                id="ref_quantity"
                name="ref_quantity"
                value={formDetailData.ref_quantity}
                onChange={handleDetailChange}
                required
              />
            </CCol>
          </CRow>

          {/* Incoming Material */}
          <CFormLabel className="col-form-label">
            <strong>Incoming Material</strong>
          </CFormLabel>

          {/* SAP Code */}
          <CRow className="mb-3">
            <CFormLabel htmlFor="sap_code" className="col-sm-2 col-form-label">
              SAP Code
            </CFormLabel>
            <CCol sm={10}>
              <CFormSelect
                id="sap_code"
                name="sap_code"
                value={formDetailData.sap_code}
                onChange={handleDetailChange}
                required
              >
                <option value="">Select SAP Code</option>
                {sapData.map((u) => (
                  <option key={u.id} value={u.sap_code}>
                    {u.sap_code}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          {/* Incoming Batch */}
          <CRow className="mb-3">
            <CFormLabel htmlFor="incoming_batch" className="col-sm-2 col-form-label">
              Incoming Batch
            </CFormLabel>
            <CCol sm={10}>
              <CFormInput
                type="number"
                id="incoming_batch"
                name="incoming_batch"
                value={formDetailData.incoming_batch}
                onChange={handleDetailChange}
                required
              />
            </CCol>
          </CRow>

          {/* Incoming Quantity */}
          <CRow className="mb-3">
            <CFormLabel htmlFor="incoming_quantity" className="col-sm-2 col-form-label">
              Incoming Quantity
            </CFormLabel>
            <CCol sm={10}>
              <CFormInput
                type="number"
                id="incoming_quantity"
                name="incoming_quantity"
                value={formDetailData.incoming_quantity}
                onChange={handleDetailChange}
                required
              />
            </CCol>
          </CRow>

          {/* Remaining Quantity */}
          <CRow className="mb-3">
            <CFormLabel htmlFor="remaining_quantity" className="col-sm-2 col-form-label">
              Remaining Quantity
            </CFormLabel>
            <CCol sm={10}>
              <CFormInput
                type="number"
                id="remaining_quantity"
                name="remaining_quantity"
                value={formDetailData.remaining_quantity}
                readOnly
              />
            </CCol>
          </CRow>

          {/* Sample Quantity */}
          <CRow className="mb-3">
            <CFormLabel htmlFor="sample_quantity" className="col-sm-2 col-form-label">
              Sample Quantity
            </CFormLabel>
            <CCol sm={10}>
              <CFormInput
                type="number"
                id="sample_quantity"
                name="sample_quantity"
                value={formDetailData.sample_quantity}
                readOnly
              />
            </CCol>
          </CRow>

          {/* Partner */}
          <CRow className="mb-3">
            <CFormLabel htmlFor="partner_code" className="col-sm-2 col-form-label">
              Partner
            </CFormLabel>
            <CCol sm={10}>
              <CFormSelect
                id="partner_code"
                name="partner_code"
                value={formDetailData.partner_code}
                onChange={handleDetailChange}
                required
              >
                <option value="">Select Partner</option>
                {partnerData.map((u) => (
                  <option key={u.id} value={u.partner_code}>
                    {u.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          {/* Image */}
          <CRow className="mb-3">
            <CFormLabel htmlFor="file" className="col-sm-2 col-form-label">
              Image
            </CFormLabel>
            <CCol sm={10}>
              <CFormInput type="file" id="file" name="file" onChange={handleDetailChange} />
            </CCol>
          </CRow>

          {/* Early Inspection */}
          <CFormLabel className="col-form-label mt-3">
            <strong>Early Inspection</strong>
          </CFormLabel>
          {/* Quantity Check */}
          <CRow className="mb-3">
            <CCol sm={12}>
              <div className="border rounded p-3">
                <CFormLabel className="col-form-label">Jumlah Kuantitas sudah sesuai</CFormLabel>
                <div className="d-flex justify-content-end gap-3">
                  <CFormCheck
                    inline
                    type="radio"
                    name="inspect_quantity"
                    id="inspectionYes"
                    value="true"
                    label="Ya"
                    checked={formDetailData.inspect_quantity === true}
                    onChange={handleDetailChange}
                    required
                  />
                  <CFormCheck
                    inline
                    type="radio"
                    name="inspect_quantity"
                    id="inspectionNo"
                    value="false"
                    label="Tidak"
                    checked={formDetailData.inspect_quantity === false}
                    onChange={handleDetailChange}
                    required
                  />
                </div>
              </div>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDetailVisible(false)}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={() => {
              handleDetailHeader()
            }}
            disabled={headerLoading}
          >
            {detailLoading ? 'Loading...' : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* -----------Modal Image */}
      <CModal visible={modalImageVisible} onClose={() => setModalImageVisible(false)} size="xl">
        <CModalHeader onClose={() => setModalImageVisible(false)}>
          <CModalTitle>Gambar Produk</CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center">
          {modalImageSrc ? (
            <img
              src={modalImageSrc}
              alt="Product"
              style={{ maxWidth: '100%', maxHeight: '80vh' }}
            />
          ) : (
            <p>Tidak ada gambar</p>
          )}
        </CModalBody>
      </CModal>
    </>
  )
}
export default IncomingPage
