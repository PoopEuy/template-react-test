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
import { backendProduct, backendWarehouse } from '../../../api/axios'
import Select from 'react-select'

window.JSZip = JSZip

/* ---------- Komponen ---------- */
const BalancesPage = () => {
  /* ---------- refs & state ---------- */
  const tableRef = useRef(null)
  const dtInstance = useRef(null)
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [warehouseData, setWarehouseData] = useState([])
  const [sapData, setSapData] = useState([])

  /* form di modal */
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [formData, setFormData] = useState({
    id: '', // hanya terisi saat edit
    sap_code: '',
    warehouse_code: '',
    quantity: '',
    uom: '',
  })

  /* ---------- helper ---------- */
  const refreshTable = async () => {
    const { data } = await backendWarehouse.get('/stock-balances').then((r) => r.data)
    setTableData(data) // trigger rerender DataTable
  }

  /* ---------- modal helpers ---------- */
  const emptyForm = {
    id: '',
    sap_code: '',
    warehouse_code: '',
    quantity: '',
    uom: '',
  }

  const handleOpenModal = (mode, rowData = null) => {
    setModalMode(mode)
    if (mode === 'edit' && rowData) {
      setFormData({
        id: rowData.id,
        sap_code: rowData.sap_code ?? '',
        warehouse_code: rowData.warehouse_code ?? '',
        quantity: rowData.quantity ?? '',
        uom: rowData.uom ?? '',
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

  const handleSelectSap = (option) => {
    const selected = sapData.find((p) => p.sap_code === option.value)
    setFormData((p) => ({
      ...p,
      sap_code: selected.sap_code,
      uom: selected.uom?.code || '',
    }))
  }

  const handleSelectWarehouse = (option) => {
    // const selected = warehouse_code.find((p) => p.warehouse_code === option.value)
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
        sap_code: formData.sap_code,
        warehouse_code: formData.warehouse_code,
        quantity: Number(formData.quantity),
        uom: formData.uom,
      }
      if (modalMode === 'add') {
        await backendWarehouse.post('/stock-balances', payload)
      } else {
        await backendWarehouse.put(`/stock-balances/${formData.id}`, payload)
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
      const [warehouseRes, sapRes] = await Promise.all([
        backendWarehouse.get('/master-warehouses'),
        backendProduct.get('/master-products'),
      ])
      setWarehouseData(warehouseRes.data.data)
      setSapData(sapRes.data.data)
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
          { title: 'SAP Code', data: 'sap_code' },
          { title: 'Warehouse', data: 'warehouse_code' },
          { title: 'Quantity', data: 'quantity' },
          { title: 'Unit', data: 'uom' },
        ],
      })
      $(dtInstance.current.buttons().nodes()).addClass('btn btn-sm btn-outline-primary me-1 mb-1')

      /* Daftarkan 1x listener Edit / Delete */
      const $tbl = $(tableRef.current)
      $tbl.on('click', '.btn-delete', async (e) => {
        const id = $(e.currentTarget).data('id')
        if (window.confirm('Delete this Stock?')) {
          await backendWarehouse.delete(`/stock-balances/${id}`)
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
              <strong>Stock Balance List</strong>
              <CButton
                className="fw-bold text-white"
                color="success"
                size="sm"
                onClick={() => handleOpenModal('add')}
              >
                + Add Stock
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
          <CModalTitle>{modalMode === 'add' ? 'Add Stock' : 'Edit Stock'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* SAP Code */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">SAP Code</CFormLabel>
              <CCol sm={9}>
                <Select
                  options={sapData.map((u) => ({ value: u.sap_code, label: u.sap_code }))}
                  value={
                    formData.sap_code
                      ? { value: formData.sap_code, label: formData.sap_code }
                      : null
                  }
                  onChange={handleSelectSap}
                  placeholder="Select SAP Code"
                  isClearable
                />
              </CCol>
            </CRow>

            {/* Warehouse Code */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Warehouse Code</CFormLabel>
              <CCol sm={9}>
                <Select
                  options={warehouseData.map((u) => ({
                    value: u.warehouse_code,
                    label: u.name,
                  }))}
                  value={
                    formData.warehouse_code
                      ? warehouseData
                          .filter((p) => p.warehouse_code === formData.warehouse_code)
                          .map((p) => ({ value: p.warehouse_code, label: p.name }))[0]
                      : null
                  }
                  onChange={handleSelectWarehouse}
                  placeholder="Select Warehouse"
                  isClearable
                />
              </CCol>
            </CRow>

            {/* Quantity */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Quantity</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
            </CRow>

            {/* Unit of Measure */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Unit</CFormLabel>
              <CCol sm={9}>
                <CFormInput name="uom" value={formData.uom} readOnly />
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

export default BalancesPage
