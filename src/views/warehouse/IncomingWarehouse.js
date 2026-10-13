/* eslint-disable prettier/prettier */

import React, { useEffect, useState, useCallback } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CPagination,
  CPaginationItem,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import Select from 'react-select'

import { backendProduct, backendWarehouse } from '../../api/axios'

/* -------------------------------------------------------------------------- */
/* util helper                                                                */
/* -------------------------------------------------------------------------- */
const fetchMasters = () =>
  Promise.all([
    backendProduct.get('/master-products'),
    backendWarehouse.get('/master-warehouses'),
  ])

const fetchTotalTracked = (request_code) =>
  backendWarehouse.get('/request-movement/items', { params: { request_code } })

const fetchMovementList = (page = 1) =>
  backendWarehouse.get('/request-movement', {
    params: {
      status: 'pending',
      movement_type: 'in',
      page,
    },
  })

/* -------------------------------------------------------------------------- */
/* main component                                                             */
/* -------------------------------------------------------------------------- */
const IncomingWarehouse = () => {
  /* ------------------------------- state ---------------------------------- */
  const [loading, setLoading] = useState(false)
  const [sapData, setSapData] = useState([])
  const [warehouseData, setWarehouseData] = useState([])
  const [trackedTotal, setTrackedTotal] = useState(0)
  const [scannedQty, setScannedQty] = useState(0)
  const [requestCode, setRequestCode] = useState('')
  const [movementList, setMovementList] = useState([])
  const [movementPage, setMovementPage] = useState(1)
  const [movementTotalPages, setMovementTotalPages] = useState(1)
  const [formData, setFormData] = useState({
    warehouse_code: '',
    movement_type: 'in',
    sap_code: '',
    quantity_total: '',
    uom: '',
    reference: '',
    requested_by: 'admin',
    source_division: 'QC',
    target_division: 'Warehouse',
    notes: '',
  })

  /* --------------------------- handlers ---------------------------------- */
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

  /* add 1 pada counter, simpan ke DB, lalu refresh total */
  const handleBarcode = async () => {
    if (!formData.barcode.trim()) return
    try {
      await backendWarehouse.post('/request-movement/items', {
        partner_barcode: formData.barcode,
        request_code: requestCode,
        scanned_by: 'admin',
      })
      setScannedQty((q) => q + 1)
      setFormData((p) => ({ ...p, barcode: '' }))
      refreshTrackedTotal()
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      const resIncoming = await backendWarehouse.post('/request-movement', payload)
      refreshMovementList()
      setRequestCode(resIncoming.data?.data?.request_code)
      setFormData((p) => ({
        ...p,
        warehouse_code: '',
        sap_code: '',
        quantity_total: '',
        uom: '',
        reference: '',
        notes: '',
      }))
      alert(`${resIncoming.data?.message}`)
    } catch (err) {
      alert(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSetRequestCode = (code) => {
    setRequestCode(code)
    setScannedQty(0) // reset scan counter jika diperlukan
    refreshTrackedTotal() // panggil ulang total tracked
  }

  /* --------------------------- data fetchers ------------------------------ */
  const refreshTrackedTotal = useCallback(async () => {
    if (!requestCode) return
    try {
      const { data } = await fetchTotalTracked(requestCode)
      setTrackedTotal(data.pagination.total)
    } catch (err) {
      console.error('fetch total error', err)
    }
  }, [requestCode])

  const refreshMovementList = useCallback(async () => {
    try {
      const res = await fetchMovementList(movementPage)
      setMovementList(res.data.data)
      setMovementTotalPages(res.data.pagination.totalPages)
    } catch (err) {
      console.error('movement list fetch failed', err)
    }
  }, [movementPage])

  /* ------------------------------ effects -------------------------------- */
  useEffect(() => {
    fetchMasters()
      .then(([sapRes, warehouseRes]) => {
        setSapData(sapRes.data.data)
        setWarehouseData(warehouseRes.data.data)
      })
      .catch((err) => console.error('fetch masters', err))
  }, [])

  useEffect(() => {
    refreshTrackedTotal()
  }, [refreshTrackedTotal])

  useEffect(() => {
    refreshMovementList()
  }, [refreshMovementList])

  /* ----------------------------------------------------------------------- */
  /* ------------------------------ render --------------------------------- */
  return (
    <>
      {/* ROW Header ---------------------------------------------------------- */}
      <CRow>
        <CCol md={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Incoming Warehouse</strong>
            </CCardHeader>

            <CCardBody>
              <CForm onSubmit={handleSubmit}>

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

                <FormRow label="Notes">
                  <CFormTextarea
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInput}
                    required
                  />
                </FormRow>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <CButton color="primary" type="submit" disabled={loading}>
                    {loading ? 'Saving…' : 'Save'}
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      {/* ROW per Item */}
      <CRow>
        {/* Panel KIRI ---------------------------------------------------------- */}
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Movement Request List</strong>
            </CCardHeader>
            <CCardBody>
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>PO</CTableHeaderCell>
                    <CTableHeaderCell>Request Code</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                    <CTableHeaderCell>Requested At</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {movementList.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{item.reference}</CTableDataCell>
                      <CTableDataCell>{item.request_code}</CTableDataCell>
                      <CTableDataCell>{item.quantity_total}</CTableDataCell>
                      <CTableDataCell>{item.requested_at}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          className="fw-bold text-white me-1"
                          color="info"
                          size="sm"
                          onClick={() => handleSetRequestCode(item.request_code)}
                        >
                          Set
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              <CPagination align="end" className="mt-3">
                {[...Array(movementTotalPages)].map((_, i) => (
                  <CPaginationItem
                    key={i + 1}
                    active={movementPage === i + 1}
                    onClick={() => setMovementPage(i + 1)}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}
              </CPagination>
            </CCardBody>
          </CCard>
        </CCol>
        {/* PANEL KANAN (counter & barcode) ------------------------------------ */}
        <CCol md={6}>
          <CounterCard title="Counter Quantity" value={scannedQty} />
          <CounterCard title="Saved Quantity" value={trackedTotal} />

          <CCard className="mb-4">
            <CCardHeader>
              <strong>Scan Barcode</strong>
              {requestCode && (
                <span className="ms-2 text-muted">(Request Code : {requestCode})</span>
              )}
            </CCardHeader>
            <CCardBody>
              <FormRow label="Barcode" labelCols="2">
                <CFormInput
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleBarcode()
                    }
                  }}
                />
              </FormRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* kecil: komponen util agar form row lebih ringkas                           */
/* -------------------------------------------------------------------------- */
const FormRow = ({ label, children, labelCols = '3' }) => (
  <CRow className="mb-3">
    <CFormLabel className={`col-sm-${labelCols} col-form-label`}>{label}</CFormLabel>
    <CCol sm={12 - Number(labelCols)}>{children}</CCol>
  </CRow>
)

const CounterCard = ({ title, value }) => (
  <CCard className="mb-4">
    <CCardHeader>
      <strong>{title}</strong>
    </CCardHeader>
    <CCardBody>
      <div className="text-center">
        <h1 className="display-4 fw-bold">{value}</h1>
        <small className="text-muted">Units</small>
      </div>
    </CCardBody>
  </CCard>
)

export default IncomingWarehouse
