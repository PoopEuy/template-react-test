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
import { backendWarehouse } from '../../../api/axios'

window.JSZip = JSZip

/* ---------- Komponen ---------- */
const WarehousesPage = () => {
  /* ---------- refs & state ---------- */
  const tableRef = useRef(null)
  const dtInstance = useRef(null)
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])
//   const [uomData, setUomData] = useState([])
//   const [catData, setCatData] = useState([])

  /* form di modal */
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    location: '',
    latitude: '',
    longitude: '',
  })

  /* ---------- helper ---------- */
  const refreshTable = async () => {
    const { data } = await backendWarehouse.get('/master-warehouses').then((r) => r.data)
    setTableData(data) // trigger rerender DataTable
  }

  /* ---------- modal helpers ---------- */
  const emptyForm = {
    id: '',
    name: '',
    location: '',
    latitude: '',
    longitude: '',
  }

  const handleOpenModal = (mode, rowData = null) => {
    setModalMode(mode)
    if (mode === 'edit' && rowData) {
      setFormData({
        id: rowData.id,
        name: rowData.name ?? '',
        location: rowData.location ?? '',
        latitude: rowData.latitude ?? '',
        longitude: rowData.longitude ?? '',
      })
    } else {
      setFormData(emptyForm)
    }
    setModalVisible(true)
  }

  /* onChange semua input */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
  }

  /* ---------- Simpan (Add / Update) ---------- */
  const handleSave = async () => {
    try {
      setLoading(true)
      const payload = {
        name: formData.name,
        location: formData.location,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      }
      if (modalMode === 'add') {
        await backendWarehouse.post('/master-warehouses', payload)
      } else {
        await backendWarehouse.put(`master-warehouses/${formData.id}`, payload)
      }
      setModalVisible(false)
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
        responsive: true,
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
          { title: 'Warehouse Code', data: 'warehouse_code' },
          { title: 'Name', data: 'name' },
          { title: 'Location', data: 'location' },
          { title: 'Latitude', data: 'latitude' },
          { title: 'Longitude', data: 'longitude' },
        ],
      })
      $(dtInstance.current.buttons().nodes()).addClass('btn btn-sm btn-outline-primary me-1 mb-1')

      /* Daftarkan 1x listener Edit / Delete */
      const $tbl = $(tableRef.current)
      $tbl.on('click', '.btn-delete', async (e) => {
        const id = $(e.currentTarget).data('id')
        if (window.confirm('Delete this Product?')) {
          await backendWarehouse.delete(`/master-warehouses/${id}`)
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
              <strong>Warehouse List</strong>
              <CButton
                className="fw-bold text-white"
                color="success"
                size="sm"
                onClick={() => handleOpenModal('add')}
              >
                + Add Warehouse
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
          <CModalTitle>{modalMode === 'add' ? 'Add Warehouse' : 'Edit Warehouse'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* Name */}
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

            {/* Location */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Location</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
            </CRow>

            {/* Latitude*/}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Latitude</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
            </CRow>

            {/* Longitude */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Longitude</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  required
                />
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
    </>
  )
}

export default WarehousesPage
