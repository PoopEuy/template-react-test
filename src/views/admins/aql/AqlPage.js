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
import { backendAql, backendProduct } from '../../../api/axios'
import Select from 'react-select'

window.JSZip = JSZip

/* ---------- Komponen ---------- */
const AqlPage = () => {
  /* ---------- refs & state ---------- */
  const [defectData, setDefectData] = useState([])
  const [sapData, setSapData] = useState([])
  const [inspectionData, setInspectionData] = useState([])
  const [aqlData, setAqlData] = useState([])
  const tableRef = useRef(null)
  const dtInstance = useRef(null)
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])

  /* form di modal */
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [formData, setFormData] = useState({
    id: '',
    sap_code: '',
    inspection_level: '',
    aql_critical: '',
    aql_major: '',
    aql_minor: '',
    used_defects: '',
    description: '',
  })

  /* ---------- helper ---------- */
  const refreshTable = async () => {
    const { data } = await backendAql.get('/aql-settings').then((r) => r.data)
    setTableData(data) // trigger rerender DataTable
  }

  /* ---------- modal helpers ---------- */
  const emptyForm = {
    id: '',
    sap_code: '',
    inspection_level: '',
    aql_critical: '',
    aql_major: '',
    aql_minor: '',
    used_defects: '',
    description: '',
  }

  const handleSelectDefects = (option) => {
    setFormData((p) => ({
      ...p,
      used_defects: option ? option.value : '',
    }))
  }

  const handleSelectAqlMinor = (option) => {
    setFormData((p) => ({
      ...p,
      aql_minor: option ? option.value : '',
    }))
  }

  const handleSelectAqlMayor = (option) => {
    setFormData((p) => ({
      ...p,
      aql_major: option ? option.value : '',
    }))
  }

  const handleSelectAqlCritical = (option) => {
    setFormData((p) => ({
      ...p,
      aql_critical: option ? option.value : '',
    }))
  }

  const handleSelectInspection = (option) => {
    setFormData((p) => ({
      ...p,
      inspection_level: option ? option.value : '',
    }))
  }

  const handleSelectSap = (option) => {
    if (!option) {
      setFormData((p) => ({
        ...p,
        sap_code: '',
      }))
      return
    }

    const selected = sapData.find((p) => p.sap_code === option.value)
    setFormData((p) => ({
      ...p,
      sap_code: selected?.sap_code || '',
    }))
  }

  const handleOpenModal = (mode, rowData = null) => {
    setModalMode(mode)
    if (mode === 'edit' && rowData) {
      setFormData({
        id: rowData.id,
        sap_code: rowData.sap_code ?? '',
        inspection_level: rowData.inspection_level ?? '',
        aql_critical: rowData.aql_critical ?? '',
        aql_major: rowData.aql_major ?? '',
        aql_minor: rowData.aql_minor ?? '',
        used_defects: rowData.used_defects ?? '',
        description: rowData.description ?? '',
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
        sap_code: formData.sap_code,
        qc_stage: formData.qc_stage,
        inspection_level: formData.inspection_level,
        aql_critical: formData.aql_critical,
        aql_major: formData.aql_major,
        aql_minor: formData.aql_minor,
        used_defects: formData.used_defects,
        description: formData.description,
      }
      if (modalMode === 'add') {
        await backendAql.post('/aql-settings', payload)
      } else {
        await backendAql.put(`/aql-settings/${formData.id}`, payload)
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
      const [sapRes, inspectionRes, aqlRes, defectRes] = await Promise.all([
        backendProduct.get('/master-products'),
        backendAql.get('/aql-settings/inspection-level'),
        backendAql.get('/aql-settings/aql-level'),
        backendAql.get('/aql-settings/used-defects'),
      ])
      setSapData(sapRes.data.data)
      setInspectionData(inspectionRes.data.data)
      setAqlData(aqlRes.data.data)
      setDefectData(defectRes.data.data)
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
          { title: 'QC Stage', data: 'qc_stage' },
          { title: 'Inspection Level', data: 'inspection_level' },
          { title: 'AQL Critical', data: 'aql_critical' },
          { title: 'AQL Mayor', data: 'aql_major' },
          { title: 'AQL Minor', data: 'aql_minor' },
          { title: 'Used Defect', data: 'used_defects' },
          { title: 'Description', data: 'description' },
        ],
      })
      $(dtInstance.current.buttons().nodes()).addClass('btn btn-sm btn-outline-primary me-1 mb-1')

      /* Daftarkan 1x listener Edit / Delete */
      const $tbl = $(tableRef.current)
      $tbl.on('click', '.btn-delete', async (e) => {
        const id = $(e.currentTarget).data('id')
        if (window.confirm('Delete this Product?')) {
          await backendAql.delete(`/aql-settings/${id}`)
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
              <strong>AQL Setting List</strong>
              <CButton
                className="fw-bold text-white"
                color="success"
                size="sm"
                onClick={() => handleOpenModal('add')}
              >
                + Add AQL Setting
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
          <CModalTitle>{modalMode === 'add' ? 'Add AQL Setting' : 'Edit AQL Setting'}</CModalTitle>
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
              </CCol>
            </CRow>

            {/* QC Stage */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">QC Stage</CFormLabel>
              <CCol sm={9}>
                <CFormSelect
                  name="qc_stage"
                  value={formData.qc_stage}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select QC Stage</option>
                  <option value="Receiving Semi Product">Receiving Semi Product</option>
                  <option value="Receiving Raw Material">Receiving Raw Material</option>
                  <option value="Aging Test">Aging Test</option>
                </CFormSelect>
              </CCol>
            </CRow>

            {/* Inspection Level */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label">Inspection Level</CFormLabel>
              <CCol sm={9}>
                <Select
                  options={inspectionData.map((v) => ({
                    value: v,
                    label: v,
                  }))}
                  value={
                    formData.inspection_level
                      ? {
                          value: formData.inspection_level,
                          label: formData.inspection_level,
                        }
                      : null
                  }
                  onChange={handleSelectInspection}
                  placeholder="Select Inspection Level"
                  isClearable
                />
              </CCol>
            </CRow>

            {/* AQL Critical */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label"> AQL Critical</CFormLabel>
              <CCol sm={9}>
                <Select
                  options={aqlData.map((v) => ({
                    value: v,
                    label: v,
                  }))}
                  value={
                    formData.aql_critical
                      ? {
                          value: formData.aql_critical,
                          label: formData.aql_critical,
                        }
                      : null
                  }
                  onChange={handleSelectAqlCritical}
                  placeholder="Select AQL Critical"
                  isClearable
                />
              </CCol>
            </CRow>

            {/* AQL Mayor */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label"> AQL Mayor</CFormLabel>
              <CCol sm={9}>
                <Select
                  options={aqlData.map((v) => ({
                    value: v,
                    label: v,
                  }))}
                  value={
                    formData.aql_major
                      ? {
                          value: formData.aql_major,
                          label: formData.aql_major,
                        }
                      : null
                  }
                  onChange={handleSelectAqlMayor}
                  placeholder="Select AQL Mayor"
                  isClearable
                />
              </CCol>
            </CRow>

            {/* AQL Minor */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label"> AQL Minor</CFormLabel>
              <CCol sm={9}>
                <Select
                  options={aqlData.map((v) => ({
                    value: v,
                    label: v,
                  }))}
                  value={
                    formData.aql_minor
                      ? {
                          value: formData.aql_minor,
                          label: formData.aql_minor,
                        }
                      : null
                  }
                  onChange={handleSelectAqlMinor}
                  placeholder="Select AQL Minor"
                  isClearable
                />
              </CCol>
            </CRow>

            {/* Used Defect */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label"> Used Defect</CFormLabel>
              <CCol sm={9}>
                <Select
                  options={defectData.map((v) => ({
                    value: v,
                    label: v,
                  }))}
                  value={
                    formData.used_defects
                      ? {
                          value: formData.used_defects,
                          label: formData.used_defects,
                        }
                      : null
                  }
                  onChange={handleSelectDefects}
                  placeholder="Select Used Defect"
                  isClearable
                />
              </CCol>
            </CRow>

            {/* Description */}
            <CRow className="mb-3">
              <CFormLabel className="col-sm-3 col-form-label"> Description</CFormLabel>
              <CCol sm={9}>
                <CFormTextarea
                  rows={3}
                  name="description"
                  value={formData.description}
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

export default AqlPage
