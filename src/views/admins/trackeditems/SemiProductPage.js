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
} from '@coreui/react'
import $ from 'jquery'
import 'datatables.net-bs5'
import 'datatables.net-responsive-bs5'
import 'datatables.net-buttons-bs5'
import 'datatables.net-buttons/js/buttons.html5.js'
import 'datatables.net-buttons/js/buttons.print.js'
import JSZip from 'jszip'
import { backendTrackedItems } from '../../../api/axios'

window.JSZip = JSZip

/* ---------- Komponen ---------- */
const SemiProductPage = () => {
  /* ---------- refs & state ---------- */
  const tableRef = useRef(null)
  const dtInstance = useRef(null)
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  /* form di modal */
  const [modalVisible, setModalVisible] = useState(false)
  const [formData, setFormData] = useState({
    partner_barcode: '',
    product_barcode: '',
    incoming_batch: '',
    production_batch: '',
    aging_batch: '',
    location_detail: '',
  })

  /* ---------- helper ---------- */
  const refreshTable = async () => {
    const { data } = await backendTrackedItems.get('/master-ti').then((r) => r.data)
    setTableData(data) // trigger rerender DataTable
  }

  const handleOpenModal = (rowData = null) => {
    setFormData({
      partner_barcode: rowData.partner_barcode,
      product_barcode: rowData.product_barcode ?? '',
      incoming_batch: rowData.incoming_batch ?? '',
      production_batch: rowData.production_batch ?? '',
      aging_batch: rowData.aging_batch ?? '',
      location_detail: rowData.location_detail ?? '',
    })
    setModalVisible(true)
  }

  /* onChange semua input */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const payload = {
        product_barcode: formData.product_barcode,
        incoming_batch: Number(formData.incoming_batch),
        production_batch: Number(formData.production_batch),
        aging_batch: Number(formData.aging_batch),
        location_detail: formData.location_detail,
      }
      await backendTrackedItems.put(
        `/master-ti/partner-barcode/${formData.partner_barcode}`,
        payload,
      )
      setModalVisible(false)
      await refreshTable()
    } catch (err) {
      alert(err.response?.data?.message || err.message)
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  /* ---------- fetch master ---------- */
  useEffect(() => {
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
          <button class="btn btn-sm btn-danger btn-delete" data-partner-barcode='${row.partner_barcode}'>
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
          { title: 'Item Code', data: 'item_code' },
          { title: 'Partner Barcode', data: 'partner_barcode' },
          { title: 'Product Barcode', data: 'product_barcode' },
          { title: 'SAP Code', data: 'sap_code' },
          { title: 'Reference PO', data: 'reference_po' },
          { title: 'Incoming Batch', data: 'incoming_batch' },
          { title: 'Production Batch', data: 'production_batch' },
          { title: 'Aging Batch', data: 'aging_batch' },
          { title: 'Location', data: 'location_detail' },
          { title: 'Status', data: 'status' },
          {
            title: 'Confirm',
            data: 'is_confirm',
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
        const barcode = $(e.currentTarget).data('partnerBarcode')
        if (window.confirm('Delete this Product?')) {
          await backendTrackedItems.delete(`/master-ti/partner-barcode/${barcode}`)
          await refreshTable()
        }
      })
      $tbl.on('click', '.btn-edit', (e) => {
        const row = JSON.parse($(e.currentTarget).attr('data-row'))
        handleOpenModal(row)
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
              <strong>Semi Product List</strong>
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
          <CModalTitle>Edit</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* Product Barcode */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Product Barcode</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="product_barcode"
                  value={formData.product_barcode}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>

            {/* Incoming Batch */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Incoming Batch</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="incoming_batch"
                  value={formData.incoming_batch}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
            </CRow>

            {/* Production Batch */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Production Batch</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="production_batch"
                  value={formData.production_batch}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
            </CRow>

            {/* Aging Batch */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Aging Batch</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="aging_batch"
                  value={formData.aging_batch}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
            </CRow>

            {/* Location Detail */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Location Detail</CFormLabel>
              <CCol sm={9}>
                <CFormInput
                  name="location_detail"
                  value={formData.location_detail}
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

export default SemiProductPage
