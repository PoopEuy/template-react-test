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
  CFormSelect,
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

import { backendWarehouse } from '../../../api/axios'

/* -------------------------------------------------------------------------- */
/* util helper                                                                */
/* -------------------------------------------------------------------------- */

const fetchMovementList = (page = 1, reference = '') =>
  backendWarehouse.get('/request-movement', {
    params: {
      status: 'pending',
      page,
      reference,
    },
  })

/* -------------------------------------------------------------------------- */
/* main component                                                             */
/* -------------------------------------------------------------------------- */
const ApprovalStock = () => {
  /* ------------------------------- state ---------------------------------- */
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [headerDetails, setHeaderDetails] = useState('')
  const [movementList, setMovementList] = useState([])
  const [detailList, setDetailList] = useState([])
  const [movementPage, setMovementPage] = useState(1)
  const [movementTotalPages, setMovementTotalPages] = useState(1)

  /* --------------------------- handlers ---------------------------------- */

  const handleApprove = async (code) => {
    try {
      const payload = { request_code: code, approved_by: 'admin' }
      const res = await backendWarehouse.post('/stock-movement/approve-from-request', payload)
      alert(`${res.data?.message}`)
      refreshMovementList()
    } catch (error) {
      console.log('error ~ ApprovalStock.js : handleApprove ', error)
    }
  }

  const handleReject = async (code, id) => {
    try {
      const payload = { request_code: code, approved_by: 'admin' }
      const res = await backendWarehouse.put(`/request-movement/reject/${id}`, payload)
      alert(`${res.data?.message}`)
      refreshMovementList()
    } catch (error) {
      console.log('error ~ ApprovalStock.js : handleReject ', error)
    }
  }

  const handleDetail = async (code) => {
    try {
      const res = await backendWarehouse.get('/request-movement/items', {
        params: { request_code: code },
      })
      const { data } = res
      setDetailList(data.data)
      setHeaderDetails(code)
    } catch (error) {
      console.log('error ~ ApprovalStock.js : handleDetail ', error)
    }
  }

  /* --------------------------- data fetchers ------------------------------ */

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
              <strong>Pending Request List</strong>
            </CCardHeader>
            <CCol md={4} className="mt-3 ms-3">
              <CFormInput
                placeholder="Search Reference PO"
                value={searchTerm}
                onChange={async (e) => {
                  const term = e.target.value
                  setSearchTerm(term)
                  try {
                    const res = await fetchMovementList(1, term)
                    setMovementList(res.data.data)
                    setMovementTotalPages(res.data.pagination.totalPages)
                    setMovementPage(1)
                  } catch (error) {
                    console.error('search fetch failed', error)
                  }
                }}
              />
            </CCol>
            <CCardBody>
              <CTable striped responsive border={1}>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>PO</CTableHeaderCell>
                    <CTableHeaderCell>Request Code</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Target Division</CTableHeaderCell>
                    <CTableHeaderCell>Requested At</CTableHeaderCell>
                    <CTableHeaderCell>Notes</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {movementList.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{item.reference}</CTableDataCell>
                      <CTableDataCell>{item.request_code}</CTableDataCell>
                      <CTableDataCell>{item.quantity_total}</CTableDataCell>
                      <CTableDataCell>{item.movement_type}</CTableDataCell>
                      <CTableDataCell>{item.target_division}</CTableDataCell>
                      <CTableDataCell>{item.requested_at}</CTableDataCell>
                      <CTableDataCell>{item.notes}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          className="fw-bold text-white me-1"
                          color="info"
                          size="sm"
                          onClick={() => handleDetail(item.request_code)}
                        >
                          Details
                        </CButton>
                        <CButton
                          className="fw-bold text-white me-1"
                          color="success"
                          size="sm"
                          onClick={() => handleApprove(item.request_code)}
                        >
                          Approve
                        </CButton>
                        <CButton
                          className="fw-bold text-white"
                          color="danger"
                          size="sm"
                          onClick={() => handleReject(item.request_code, item.id)}
                        >
                          Reject
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
      </CRow>
      <CRow>
        {detailList.length > 0 && (
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>
                Detail {headerDetails} - Total: {detailList.length}
              </strong>
              <CButton
                className="fw-bold text-white"
                color="danger"
                size="sm"
                onClick={() => {
                  setDetailList([])
                  setHeaderDetails('')
                }}
              >
                ✖ Close
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CTable striped responsive border={1}>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Partner Barcode</CTableHeaderCell>
                    <CTableHeaderCell>Product Barcode</CTableHeaderCell>
                    <CTableHeaderCell>Scanned By</CTableHeaderCell>
                    <CTableHeaderCell>Scanned At</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {detailList.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{item.id}</CTableDataCell>
                      <CTableDataCell>{item.partner_barcode}</CTableDataCell>
                      <CTableDataCell>{item.product_barcode || '-'}</CTableDataCell>
                      <CTableDataCell>{item.scanned_by}</CTableDataCell>
                      <CTableDataCell>{item.scanned_at}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        )}
      </CRow>
    </>
  )
}

export default ApprovalStock
