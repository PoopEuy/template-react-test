/* eslint-disable prettier/prettier */

import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
} from '@coreui/react'
import $ from 'jquery'
import 'datatables.net-bs5'
import 'datatables.net-responsive-bs5'
import 'datatables.net-buttons-bs5'
import 'datatables.net-buttons/js/buttons.html5.js'
import 'datatables.net-buttons/js/buttons.print.js'
import JSZip from 'jszip'
import { backendPartner } from '../../../api/axios'

window.JSZip = JSZip

/* ---------- Komponen ---------- */
const PartnerPage = () => {
  /* ---------- refs & state ---------- */
  const tableRef = useRef(null)
  const dtInstance = useRef(null)
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [typeData, setTypeData] = useState([])

  /* form di modal */
  const [visibleBulk, setVisibleBulk] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [excelFile, setExcelFile] = useState(null)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    sap_pcode: '',
    type: '',
    address: '',
    phone: '',
    fax: '',
    email: '',
    contact_person: '',
    is_active: '',
  })

  /* ---------- helper ---------- */
  const refreshTable = async () => {
    const { data } = await backendPartner.get('/master').then((r) => r.data)
    setTableData(data) // trigger rerender DataTable
  }

  const handleOpenModelBulk = (mode) => {
    mode === 'bulk' && setVisibleBulk(true)
  }

  const handleOpenModal = (mode, rowData = null) => {
    setModalMode(mode)
    if (mode === 'edit' && rowData) {
      setFormData({
        id: rowData.id,
        name: rowData.name ?? '',
        sap_pcode: rowData.sap_pcode ?? '',
        type: rowData.type ?? '',
        address: rowData.address ?? '',
        phone: rowData.phone ?? '',
        fax: rowData.fax ?? '',
        email: rowData.email ?? '',
        contact_person: rowData.contact_person ?? '',
        is_active: rowData.is_active ?? '',
      })
    } else {
      setFormData(emptyForm)
    }
    setModalVisible(true)
  }

  /* onChange semua input */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'is_active') {
      return setFormData((p) => ({ ...p, is_active: value === 'true' }))
    }
    setFormData((p) => ({ ...p, [name]: value }))
  }
  /* ---------- modal helpers ---------- */
  const emptyForm = {
    id: '',
    name: '',
    sap_pcode: '',
    type: '',
    address: '',
    phone: '',
    fax: '',
    email: '',
    contact_person: '',
    is_active: '',
  }

  /* ---------- Simpan (Add / Update) ---------- */
  const handleSave = async () => {
    try {
      setLoading(true)
      const payload = {
        name: formData.name,
        sap_pcode: formData.sap_pcode,
        type: formData.type,
        address: formData.address,
        phone: formData.phone,
        fax: formData.fax,
        email: formData.email,
        contact_person: formData.contact_person,
        is_active: formData.is_active,
      }
      if (modalMode === 'add') {
        await backendPartner.post('/master', payload)
      } else {
        await backendPartner.put(`/master/${formData.id}`, payload)
      }
      setModalVisible(false)
      await refreshTable()
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadExcel = async (e) => {
    e.preventDefault()
    if (!excelFile) return

    const formData = new FormData()
    formData.append('file', excelFile)

    try {
      setLoading(true)
      await backendPartner.post('/master/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setVisibleBulk(false)
      setExcelFile(null)
      await refreshTable()
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ---------- fetch master ---------- */
  useEffect(() => {
    ;(async () => {
      const [typeRes] = await Promise.all([backendPartner.get('/master/types')])
      setTypeData(typeRes.data.data)
      await refreshTable()
    })()
  }, [])

  /* ---------- DataTable init & update ---------- */
  useEffect(() => {
    if (!tableData.length) return

    /* jika DT belum ada → inisialisasi */
    if (!dtInstance.current) {
      const actionCol = {
        title: 'Action',
        data: null,
        className: 'text-center',
        orderable: false,
        render: (_, __, row) => `
          <button class="btn btn-sm btn-primary btn-edit me-1" data-row='${JSON.stringify(row)}'>
            Edit
          </button>
          <button class="btn btn-sm btn-danger btn-delete" data-id='${row.id}'>
            Del
          </button>`,
      }

      dtInstance.current = $(tableRef.current).DataTable({
        data: tableData,
        responsive: false,
        dom:
          "<'row mb-2'<'col-md-6'B><'col-md-6'f>>" +
          "<'row'<'col-12'tr>>" +
          "<'row mt-2'<'col-md-6'i><'col-md-6'p>>",
        buttons: [
          { extend: 'copyHtml5', text: 'Copy' },
          { extend: 'excelHtml5', text: 'Excel' },
          { extend: 'csvHtml5', text: 'CSV' },
          { extend: 'print', text: 'Print' },
        ],
        columns: [
          actionCol,
          { title: 'ID', data: 'id' },
          { title: 'Partner Code', data: 'partner_code' },
          { title: 'SAP Code', data: 'sap_pcode' },
          { title: 'Name', data: 'name' },
          { title: 'Adress', data: 'address' },
          { title: 'Phone', data: 'phone' },
          { title: 'Fax', data: 'fax' },
          { title: 'Email', data: 'email' },
          { title: 'Contact Person', data: 'contact_person' },
          { title: 'Type', data: 'type', className: 'text-capitalize' },
          {
            title: 'Active',
            data: 'is_active',
            className: 'text-center',
            render: (a) =>
              a
                ? '<span class="badge bg-success">Yes</span>'
                : '<span class="badge bg-danger">No</span>',
          },
        ],
      })
      $(dtInstance.current.buttons().nodes()).addClass('btn btn-sm btn-outline-primary me-1 mb-1')

      /* Daftarkan 1x listener Edit / Delete */
      const $tbl = $(tableRef.current)
      $tbl.on('click', '.btn-delete', async (e) => {
        const id = $(e.currentTarget).data('id')
        if (window.confirm('Delete this Partner?')) {
          await backendPartner.delete(`/master/${id}`)
          await refreshTable()
        }
      })
      $tbl.on('click', '.btn-edit', (e) => {
        const row = JSON.parse($(e.currentTarget).attr('data-row'))
        handleOpenModal('edit', row)
      })
    } else {
      /* jika DT sudah ada → update datanya */
      dtInstance.current.clear().rows.add(tableData).draw(false)
    }
  }, [tableData])

  /* ---------- render ---------- */
  return (
    <>
      <CRow>
        <CCol xs={90}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Partner List</strong>
              <CButton
                className="fw-bold text-white"
                color="success"
                size="sm"
                onClick={() => handleOpenModelBulk('bulk')}
              >
                + Add Partner Bulk
              </CButton>
              <CButton
                className="fw-bold text-white"
                color="success"
                size="sm"
                onClick={() => handleOpenModal('add')}
              >
                + Add Partner
              </CButton>
            </CCardHeader>
            <CCardBody>
              <div className="table-responsive">
                <table
                  ref={tableRef}
                  className="table table-striped table-bordered align-middle"
                  style={{ width: '100%' }}
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* ---------- MODAL ---------- */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{modalMode === 'add' ? 'Add Partner' : 'Edit Partner'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* SAP Code */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">SAP Code</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="sap_pcode"
                  value={formData.sap_pcode}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>

            {/* Partner Name */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Name</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
            </CRow>

            {/* Type */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Type</CFormLabel>
              <CCol sm={9}>
                <CFormSelect name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="">Select Type</option>
                  {typeData.map((u) => (
                    <option key={u.prefix} value={u.type}>
                      {u.label}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>

            {/* Address */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Address</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
            </CRow>

            {/* Phone */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Phone</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
            </CRow>

            {/* Fax */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Fax</CFormLabel>
              <CCol sm={9}>
                <CFormInput name="fax" value={formData.fax} onChange={handleInputChange} required />
              </CCol>
            </CRow>

            {/* Email */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Email</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
            </CRow>

            {/* Contact Person */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Contact Person</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  type="contact_person"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
            </CRow>

            {/* Aktif View */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Aktif View</CFormLabel>
              <CCol sm={9}>
                <CFormSelect
                  name="is_active"
                  value={String(formData.is_active)}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </CFormSelect>
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Loading...' : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* MODAl BULK */}
      <CModal visible={visibleBulk} onClose={() => setVisibleBulk(false)}>
        <CForm onSubmit={handleUploadExcel}>
          <CModalHeader>
            <CModalTitle>Bulk Upload Partners (Excel)</CModalTitle>
          </CModalHeader>

          <CModalBody>
            <CFormLabel htmlFor="excel">Select Excel file (.xlsx / .xls)</CFormLabel>
            <CFormInput
              type="file"
              id="excel"
              accept=".xlsx,.xls"
              onChange={(e) => setExcelFile(e.target.files[0])}
              required
            />
          </CModalBody>

          <CModalFooter>
            <CButton color="secondary" onClick={() => setVisibleBulk(false)}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Upload'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default PartnerPage
