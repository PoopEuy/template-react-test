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
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { backendSupplier } from '../../../api/axios'

const SearchBar = ({ value, onChange }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={6}>
      <CFormInput
        type="text"
        placeholder="Search by name or code..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </CCol>
  </CRow>
)

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({
    name: '',
    code: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
  })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalRows, setTotalRows] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await backendSupplier.get('/', {
        params: {
          page,
          limit,
          // search: searchKeyword,
        },
      })
      setSuppliers(res.data.data || [])
      setTotalRows(res.data.meta.pagination.totalItems || 0)
    } catch {
      toast.error('Failed to fetch suppliers')
    } finally {
      setLoading(false)
    }
  }, [page, limit, searchKeyword])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSuppliers()
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [page, limit, searchKeyword, fetchSuppliers])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: form.name,
        code: form.code,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        address: form.address,
      }

      let res
      if (editData) {
        // Update supplier
        res = await backendSupplier.put(`/${editData.id}`, payload)
        toast.success(res.data?.message || 'Supplier updated')
      } else {
        // Create supplier
        res = await backendSupplier.post('/', payload)
        toast.success(res.data?.message || 'Supplier created')
      }

      setModalVisible(false)
      resetForm()
      fetchSuppliers()
    } catch {
      toast.error('Failed to save supplier')
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      code: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      address: '',
    })
    setEditData(null)
  }

  const handleEdit = (row) => {
    setEditData(row)
    setForm({
      name: row.name,
      code: row.code,
      contact_name: row.contact_name,
      contact_email: row.contact_email,
      contact_phone: row.contact_phone,
      address: row.address,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return
    console.log('id suplier : ', id)
    try {
      await backendSupplier.delete(`/${id}`)
      toast.success('Supplier deleted')
      if (suppliers.length === 1 && page > 1) setPage((prev) => prev - 1)
      else fetchSuppliers()
      resetForm()
    } catch {
      toast.error('Failed to delete supplier')
    }
  }

  const columns = [
    {
      name: 'No',
      width: '60px',
      cell: (row, index) => (
        <div className="text-center w-100">{(page - 1) * limit + index + 1}</div>
      ),
    },
    { name: 'Name', selector: (row) => row.name, sortable: true },
    { name: 'Code', selector: (row) => row.code, sortable: true },
    { name: 'Contact', selector: (row) => row.contact_name || '-', sortable: true },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-2">
          <CButton size="sm" color="warning" onClick={() => handleEdit(row)}>
            Edit
          </CButton>
          <CButton size="sm" color="danger" onClick={() => handleDelete(row.id)}>
            Delete
          </CButton>
        </div>
      ),
    },
  ]

  const ExpandedComponent = ({ data }) => (
    <div className="p-3 border-top bg-light rounded">
      <strong>Supplier Info</strong>
      <CRow className="mb-2">
        <CCol md={6}>
          <strong>Name:</strong> {data.name}
        </CCol>
        <CCol md={6}>
          <strong>Code:</strong> {data.code}
        </CCol>
      </CRow>
      <CRow className="mb-2">
        <CCol md={6}>
          <strong>Contact Name:</strong> {data.contact_name}
        </CCol>
        <CCol md={6}>
          <strong>Email:</strong> {data.contact_email}
        </CCol>
      </CRow>
      <CRow className="mb-2">
        <CCol md={6}>
          <strong>Phone:</strong> {data.contact_phone}
        </CCol>
        <CCol md={6}>
          <strong>Address:</strong> {data.address}
        </CCol>
      </CRow>
    </div>
  )

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Supplier List</strong>
              <CButton onClick={() => setModalVisible(true)}>+ Add Supplier</CButton>
            </CCardHeader>
            <CCardBody>
              <SearchBar
                value={searchKeyword}
                onChange={(value) => {
                  setSearchKeyword(value)
                  setPage(1)
                }}
              />
              {loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ minHeight: '300px' }}
                >
                  <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={suppliers}
                  pagination
                  paginationServer
                  paginationTotalRows={totalRows}
                  paginationDefaultPage={page}
                  onChangePage={(p) => setPage(p)}
                  onChangeRowsPerPage={(newLimit) => {
                    setLimit(newLimit)
                    setPage(1)
                  }}
                  responsive
                  highlightOnHover
                  striped
                  expandableRows
                  expandableRowsComponent={ExpandedComponent}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Modal */}
        <CModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false)
            resetForm()
          }}
        >
          <CModalHeader>
            <CModalTitle>{editData ? 'Edit Supplier' : 'Add Supplier'}</CModalTitle>
          </CModalHeader>
          <CForm onSubmit={handleSubmit}>
            <CModalBody>
              <CFormLabel>Name</CFormLabel>
              <CFormInput name="name" value={form.name} onChange={handleInputChange} required />

              <CFormLabel className="mt-2">Code</CFormLabel>
              <CFormInput name="code" value={form.code} onChange={handleInputChange} required />

              <CFormLabel className="mt-2">Contact Name</CFormLabel>
              <CFormInput
                name="contact_name"
                value={form.contact_name}
                onChange={handleInputChange}
              />

              <CFormLabel className="mt-2">Contact Email</CFormLabel>
              <CFormInput
                type="email"
                name="contact_email"
                value={form.contact_email}
                onChange={handleInputChange}
              />

              <CFormLabel className="mt-2">Contact Phone</CFormLabel>
              <CFormInput
                name="contact_phone"
                value={form.contact_phone}
                onChange={handleInputChange}
              />

              <CFormLabel className="mt-2">Address</CFormLabel>
              <CFormInput name="address" value={form.address} onChange={handleInputChange} />
            </CModalBody>
            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => {
                  setModalVisible(false)
                  resetForm()
                }}
              >
                Cancel
              </CButton>
              <CButton type="submit" color="primary">
                {editData ? 'Update' : 'Create'}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>
      </CRow>
    </>
  )
}

export default SupplierPage
