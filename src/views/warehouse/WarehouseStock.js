import React, { useState, useEffect, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CRow,
  CCol,
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CToast,
  CToastHeader,
  CToastBody,
  CToaster,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import { backendWhNew } from '../../api/axios'

const WarehouseStock = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalRows, setTotalRows] = useState(0)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [formData, setFormData] = useState({
    quantity: '',
    adjustment_type: 'increase',
    notes: '',
    performed_by: 1,
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const response = await backendWhNew.get('/stock-units', {
        params: { page, limit, search: searchKeyword || undefined },
      })

      if (response.data.success) {
        setRecords(response.data.data || [])
        setTotalRows(response.data.pagination?.totalItems || 0)
      }
    } catch (error) {
      console.error('Error fetching stock units:', error)
    } finally {
      setLoading(false)
    }
  }, [page, limit, searchKeyword])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRecords()
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [fetchRecords])

  const handleStockOpname = (row) => {
    setSelectedRow(row)
    setFormData({
      quantity: '', // ✅ selalu kosong saat modal dibuka
      adjustment_type: 'increase',
      notes: '',
      performed_by: 1,
    })
    setShowModal(true)
  }
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProcessStockOpname = async () => {
    if (!selectedRow) {
      toast.error('Tidak ada data yang dipilih untuk stock opname')
      return
    }

    // ✅ Validasi input sebelum kirim ke API
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      toast.error('Quantity harus lebih dari 0')
      return
    }
    if (!formData.adjustment_type) {
      toast.error('Adjustment type wajib diisi')
      return
    }
    if (!formData.notes.trim()) {
      toast.error('Notes wajib diisi')
      return
    }
    if (!formData.performed_by) {
      toast.error('Performed by wajib diisi')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        quantity: Number(formData.quantity),
        adjustment_type: formData.adjustment_type,
        notes: formData.notes,
        performed_by: formData.performed_by,
      }

      const response = await backendWhNew.post(`/stock-units/${selectedRow.id}/adjust`, payload)

      toast.success(response?.data?.message || 'Stock opname berhasil diproses!')

      // reset state
      setShowModal(false)
      setSelectedRow(null)
      setFormData({
        quantity: '',
        adjustment_type: 'increase',
        notes: '',
        performed_by: 1,
      })
      fetchRecords()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.[0]?.message ||
          'Gagal melakukan stock opname',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      name: 'No',
      selector: (row, index) => index + 1,
      width: '70px',
    },
    {
      name: 'SAP Code',
      selector: (row) => row.product?.sap_code || '-',
      sortable: true,
    },
    {
      name: 'Product Name',
      selector: (row) => row.product?.name || '-',
      sortable: true,
    },
    {
      name: 'Warehouse',
      selector: (row) => row.warehouse?.name || '-',
      sortable: true,
    },
    {
      name: 'Quantity',
      selector: (row) => row.quantity,
      sortable: true,
    },
    {
      name: 'Action',
      cell: (row) => (
        <button className="btn btn-sm btn-warning" onClick={() => handleStockOpname(row)}>
          Stock Opname
        </button>
      ),
      ignoreRowClick: true,
    },
  ]

  return (
    <>
      <CCard>
        <CCardHeader>
          <strong>Stock by Product</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormInput
                placeholder="Search product..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </CCol>
          </CRow>

          <DataTable
            columns={columns}
            data={records}
            progressPending={loading}
            progressComponent={<CSpinner />}
            highlightOnHover
            striped
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            onChangePage={(page) => setPage(page)}
            onChangeRowsPerPage={(newLimit) => {
              setLimit(newLimit)
              setPage(1)
            }}
          />
        </CCardBody>
      </CCard>

      {/* Modal Stock Opname */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Stock Opname</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedRow && (
            <>
              <p>
                <strong>Product:</strong> {selectedRow.product?.name}
              </p>
              <p>
                <strong>Current Quantity:</strong> {selectedRow.quantity}
              </p>
              <CFormLabel>Quantity</CFormLabel>
              <CFormInput
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min={1}
              />
              <CFormLabel className="mt-2">Adjustment Type</CFormLabel>
              <CFormSelect
                name="adjustment_type"
                value={formData.adjustment_type}
                onChange={handleChange}
              >
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
              </CFormSelect>
              <CFormLabel className="mt-2">Notes</CFormLabel>
              <CFormTextarea name="notes" value={formData.notes} onChange={handleChange} />
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleProcessStockOpname} disabled={submitting}>
            {submitting ? 'Processing...' : 'Process'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default WarehouseStock
