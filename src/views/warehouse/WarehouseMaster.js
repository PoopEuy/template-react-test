import React, { useEffect, useState, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CForm,
  CModalBody,
  CFormLabel,
  CModalFooter,
  CFormInput,
  CSpinner,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import { backendWhNew } from '../../api/axios'

// Komponen detail row
const ExpandedComponent = ({ data }) => (
  <div className="p-3 border-top bg-light rounded">
    <CRow className="mb-2">
      <CCol md={6}>
        <strong>Warehouse Code:</strong> {data.code}
      </CCol>
      <CCol md={6}>
        <strong>Name:</strong> {data.name}
      </CCol>
    </CRow>
    <CRow className="mb-2">
      <CCol md={6}>
        <strong>Location:</strong> {data.location || '-'}
      </CCol>
      <CCol md={6}>
        <strong>Created:</strong>{' '}
        {data.created_at ? new Date(data.created_at).toLocaleString() : '-'}
      </CCol>
    </CRow>
    <CRow className="mb-2">
      <CCol md={6}>
        <strong>Updated:</strong>{' '}
        {data.updated_at ? new Date(data.updated_at).toLocaleString() : '-'}
      </CCol>
    </CRow>
  </div>
)

const WarehouseList = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const [modalVisible, setModalVisible] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({
    name: '',
    location: '',
    code: '',
  })

  // Fetch data sesuai pagination
  const fetchWarehouses = useCallback(
    async (page = currentPage, limit = perPage) => {
      setLoading(true)
      try {
        const res = await backendWhNew.get('/', {
          params: { page, limit },
        })
        const { data: warehouses, total } = res.data
        setData(warehouses || [])
        setTotalRows(total || 0)
      } catch (error) {
        console.error(error)
        toast.error('Failed to fetch warehouses')
      } finally {
        setLoading(false)
      }
    },
    [currentPage, perPage],
  )

  useEffect(() => {
    fetchWarehouses(currentPage, perPage)
  }, [fetchWarehouses, currentPage, perPage])

  // Reset form
  const resetForm = () => {
    setForm({
      name: '',
      location: '',
      code: '',
    })
    setEditData(null)
  }

  const handleEdit = (row) => {
    setEditData(row)
    setForm({
      name: row.name || '',
      location: row.location || '',
      code: row.code || '',
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) return
    try {
      const res = await backendWhNew.delete(`/${id}`)
      toast.success(res.data?.message || 'Warehouse deleted')
      fetchWarehouses(currentPage, perPage)
      resetForm()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to delete warehouse')
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, code: form.code?.toUpperCase() || '' }
    try {
      let res
      if (editData) {
        res = await backendWhNew.put(`/${editData.id}`, payload)
        toast.success(res.data?.message || 'Warehouse updated')
      } else {
        res = await backendWhNew.post('/', payload)
        toast.success(res.data?.message || 'Warehouse created')
      }
      setModalVisible(false)
      resetForm()
      fetchWarehouses(currentPage, perPage)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to save warehouse')
    }
  }

  // Pagination handler
  const handlePageChange = (page) => setCurrentPage(page)
  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage)
    setCurrentPage(page)
  }

  const columns = [
    { name: 'Warehouse Code', selector: (row) => row.code || '-', sortable: true },
    { name: 'Name', selector: (row) => row.name, sortable: true },
    { name: 'Location', selector: (row) => row.location || '-', sortable: true },
    {
      name: 'Created',
      selector: (row) => (row.created_at ? new Date(row.created_at).toLocaleString() : '-'),
      sortable: true,
    },
    {
      name: 'Updated',
      selector: (row) => (row.updated_at ? new Date(row.updated_at).toLocaleString() : '-'),
      sortable: true,
    },
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

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Warehouses</strong>
            <CButton onClick={() => setModalVisible(true)}>+ Add Warehouse</CButton>
          </CCardHeader>
          <CCardBody>
            {' '}
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
                data={data}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationDefaultPage={currentPage}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
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
          <CModalTitle>{editData ? 'Edit Warehouse' : 'Add Warehouse'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <CFormLabel>Warehouse Name</CFormLabel>
            <CFormInput name="name" value={form.name} onChange={handleInputChange} required />

            <CFormLabel className="mt-2">Location</CFormLabel>
            <CFormInput
              name="location"
              value={form.location}
              onChange={handleInputChange}
              required
            />

            <CFormLabel className="mt-2">Warehouse Code</CFormLabel>
            <CFormInput name="code" value={form.code} onChange={handleInputChange} required />
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
  )
}

export default WarehouseList
