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
  CFormTextarea,
} from '@coreui/react'
import $ from 'jquery'
import 'datatables.net-bs5'
import 'datatables.net-responsive-bs5'
import 'datatables.net-buttons-bs5'
import 'datatables.net-buttons/js/buttons.html5.js'
import 'datatables.net-buttons/js/buttons.print.js'
import JSZip from 'jszip'
import { backendProduct, backendWarehouse } from '../../../api/axios'
import Select from 'react-select'

window.JSZip = JSZip

const fetchMasters = () =>
  Promise.all([backendProduct.get('/master-products'), backendWarehouse.get('/master-warehouses')])

/* ---------- Komponen ---------- */
const MovementsPage = () => {
  /* ---------- refs & state ---------- */
  const tableRef = useRef(null)
  const dtInstance = useRef(null)
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [sapData, setSapData] = useState([])
  const [warehouseData, setWarehouseData] = useState([])

  /* form di modal */
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [formData, setFormData] = useState({
    id: '',
    request_code: '',
    warehouse_code: '',
    movement_type: 'in',
    sap_code: '',
    quantity_total: '',
    uom: '',
    reference: '',
    requested_by: '',
    source_division: '',
    target_division: '',
    notes: '',
  })

  /* ---------- helper ---------- */
  const refreshTable = async () => {
    const { data } = await backendWarehouse
      .get('/request-movement', { params: { limit: 1000000 } })
      .then((r) => r.data)
    setTableData(data)
  }

  /* ---------- modal helpers ---------- */
  const emptyForm = {
    id: '',
    request_code: '',
    warehouse_code: '',
    movement_type: '',
    sap_code: '',
    quantity_total: '',
    uom: '',
    reference: '',
    requested_by: '',
    source_division: '',
    target_division: '',
    notes: '',
  }

  const handleOpenModal = (mode, rowData = null) => {
    setModalMode(mode)
    if (mode === 'edit' && rowData) {
      setFormData({
        id: rowData.id ?? '',
        reference: rowData.reference ?? '',
        warehouse_code: rowData.warehouse_code ?? '',
        movement_type: rowData.movement_type ?? '',
        quantity_total: rowData.quantity_total ?? '',
        sap_code: rowData.sap_code ?? '',
        uom: rowData.uom ?? '',
        requested_by: rowData.requested_by ?? '',
        source_division: rowData.source_division ?? '',
        target_division: rowData.target_division ?? '',
        notes: rowData.notes ?? '',
      })
    } else {
      setFormData(emptyForm)
    }
    setModalVisible(true)
  }

  /* onChange semua input */
  const handleInput = (e) => {
    const { name, value, type, files } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
  }

  const handleSelectSap = (option) => {
    if (!option) {
      setFormData((p) => ({
        ...p,
        sap_code: '',
        uom: '',
      }))
      return
    }

    const selected = sapData.find((p) => p.sap_code === option.value)
    setFormData((p) => ({
      ...p,
      sap_code: selected?.sap_code || '',
      uom: selected?.uom?.code || '',
    }))
  }

  const handleSelectWarehouse = (option) => {
    setFormData((p) => ({
      ...p,
      warehouse_code: option ? option.value : '',
    }))
  }

  /* ---------- Simpan (Add / Update) ---------- */
  const handleSave = async () => {
    try {
      setLoading(true)
      const payload = {
        reference: formData.reference,
        warehouse_code: formData.warehouse_code,
        movement_type: formData.movement_type,
        quantity_total: Number(formData.quantity_total),
        sap_code: formData.sap_code,
        uom: formData.uom,
        requested_by: formData.requested_by,
        source_division: formData.source_division,
        target_division: formData.target_division,
        notes: formData.notes,
      }
      if (modalMode === 'add') {
        await backendWarehouse.post('/request-movement', payload)
      } else {
        await backendWarehouse.put(`/request-movement/request/${formData.id}`, payload)
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
    fetchMasters()
      .then(([sapRes, warehouseRes]) => {
        setSapData(sapRes.data.data)
        setWarehouseData(warehouseRes.data.data)
      })
      .catch((err) => console.error('fetch masters', err))
    refreshTable()
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
          { title: 'Request Code', data: 'request_code' },
          { title: 'Warehouse Code', data: 'warehouse_code' },
          { title: 'Movement Type', data: 'movement_type' },
          { title: 'SAP Code', data: 'sap_code' },
          { title: 'Quantity Total', data: 'quantity_total' },
          { title: 'UOM', data: 'uom' },
          { title: 'PO', data: 'reference' },
          { title: 'Requested By', data: 'requested_by' },
          { title: 'Requested At', data: 'requested_at' },
          { title: 'Status', data: 'status' },
          { title: 'Approved By', data: 'approved_by' },
          { title: 'Approved At', data: 'approved_at' },
          { title: 'Source Division', data: 'source_division' },
          { title: 'Target Division', data: 'target_division' },
          { title: 'Notes', data: 'notes' },
        ],
      })
      $(dtInstance.current.buttons().nodes()).addClass('btn btn-sm btn-outline-primary me-1 mb-1')

      /* Daftarkan 1x listener Edit / Delete */
      const $tbl = $(tableRef.current)
      $tbl.on('click', '.btn-delete', async (e) => {
        const id = $(e.currentTarget).data('id')
        if (window.confirm('Delete this Movement?')) {
          await backendWarehouse.delete(`/request-movement/request/${id}`)
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
              <strong>Stock Movement List</strong>
              <CButton
                className="fw-bold text-white"
                color="success"
                size="sm"
                onClick={() => handleOpenModal('add')}
              >
                + Add Movement List
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
          <CModalTitle>
            {modalMode === 'add' ? 'Add Stock Movement' : 'Edit Stock Movement'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <FormRow label="Reference PO">
              <CFormInput
                name="reference"
                value={formData.reference}
                onChange={handleInput}
                required
              />
            </FormRow>
            <FormRow label="Warehouse Code">
              <Select
                options={warehouseData.map((u) => ({
                  value: u.warehouse_code,
                  label: u.name,
                }))}
                value={
                  warehouseData.find((p) => p.warehouse_code === formData.warehouse_code)
                    ? {
                        value: formData.warehouse_code,
                        label: warehouseData.find(
                          (p) => p.warehouse_code === formData.warehouse_code,
                        ).name,
                      }
                    : null
                }
                onChange={handleSelectWarehouse}
                placeholder="Select Warehouse"
                isClearable
              />
            </FormRow>
            <FormRow label="SAP Code">
              <Select
                options={sapData.map((u) => ({ value: u.sap_code, label: u.sap_code }))}
                value={
                  sapData.find((p) => p.sap_code === formData.sap_code)
                    ? {
                        value: formData.sap_code,
                        label: formData.sap_code,
                      }
                    : null
                }
                onChange={handleSelectSap}
                placeholder="Select SAP Code"
                isClearable
              />
            </FormRow>
            <FormRow label="Unit">
              <CFormInput name="uom" value={formData.uom} readOnly />
            </FormRow>
            <FormRow label="Total Quantity">
              <CFormInput
                type="number"
                name="quantity_total"
                value={formData.quantity_total}
                onChange={handleInput}
                required
              />
            </FormRow>
            <FormRow label="Movement Type">
              <CFormSelect
                type="text"
                name="movement_type"
                value={formData.movement_type}
                onChange={handleInput}
                required
              >
                <option value="">Select Movement Type</option>
                <option value="in">In</option>
                <option value="out">Out</option>
              </CFormSelect>
            </FormRow>
            <FormRow label="Requested By">
              <CFormInput
                type="text"
                name="requested_by"
                value={formData.requested_by}
                onChange={handleInput}
                required
              />
            </FormRow>

            <FormRow label="Source Division">
              <CFormInput
                type="text"
                name="source_division"
                value={formData.source_division}
                onChange={handleInput}
                required
              />
            </FormRow>
            <FormRow label="Target Division">
              <CFormInput
                type="text"
                name="target_division"
                value={formData.target_division}
                onChange={handleInput}
                required
              />
            </FormRow>
            <FormRow label="Notes">
              <CFormTextarea
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleInput}
                required
              />
            </FormRow>
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

const FormRow = ({ label, children, labelCols = '3' }) => (
  <CRow className="mb-3">
    <CFormLabel className={`col-sm-${labelCols} col-form-label`}>{label}</CFormLabel>
    <CCol sm={12 - Number(labelCols)}>{children}</CCol>
  </CRow>
)

export default MovementsPage
