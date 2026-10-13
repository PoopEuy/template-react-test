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
  CImage,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import { backendProduct, backendSupplier, backendProductTypes } from '../../../api/axios'
import AsyncSelect from 'react-select/async'

const SearchBar = ({ value, onChange }) => (
  <CRow className="mb-3 align-items-center">
    <CCol md={6}>
      <CFormInput
        type="text"
        placeholder="Search by name or SAP code..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </CCol>
  </CRow>
)

const ProductPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({
    name: '',
    sap_code: '',
    product_type_id: '',
    supplier_id: '',
    is_active: true,
    image: null,
  })
  const [typeOptions, setTypeOptions] = useState([])
  const [supplierOptions, setSupplierOptions] = useState([])
  const [imagePreview, setImagePreview] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalRows, setTotalRows] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')

  const [inspectionModalVisible, setInspectionModalVisible] = useState(false)
  const [editInspection, setEditInspection] = useState(null)
  const [inspectionForm, setInspectionForm] = useState({
    aql_critical: '',
    aql_major: '',
    used_defects: '',
    notes: '',
  })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await backendProduct.get('/', {
        params: {
          page,
          limit,
          search: searchKeyword,
          sortBy: 'name',
          sortOrder: 'asc',
          include_details: true,
          include_categories: true,
          include_components: true,
          include_level_inspections: true,
        },
      })
      setProducts(res.data.data || [])
      setTotalRows(res.data.meta.pagination.totalItems || 0)
    } catch {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [page, limit, searchKeyword])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts()
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [page, limit, searchKeyword, fetchProducts])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const loadSupplierOptions = async (inputValue) => {
    try {
      const res = await backendSupplier.get('/', {
        params: {
          search: inputValue,
          page: 1,
          limit: 10,
        },
      })
      const options = res.data.data.map((item) => ({
        value: item.id,
        label: item.name,
      }))
      setSupplierOptions(options) // simpan ke state
      return options
    } catch (error) {
      toast.error('Failed to load suppliers')
      return []
    }
  }

  const loadTypeOptions = async (inputValue) => {
    try {
      const res = await backendProductTypes.get('/', {
        params: {
          search: inputValue,
          page: 1,
          limit: 10,
        },
      })
      const options = res.data.data.map((item) => ({
        value: item.id,
        label: item.name,
      }))
      setTypeOptions(options)
      return options
    } catch (error) {
      toast.error('Failed to load product types')
      return []
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      is_active: form.is_active === true || form.is_active === 'true',
    }

    try {
      let res
      if (editData) {
        res = await backendProduct.put(`/${editData.id}`, payload)
        toast.success(res.data?.message || 'Product updated')
      } else {
        res = await backendProduct.post('/', payload)
        toast.success(res.data?.message || 'Product created')
      }
      setModalVisible(false)
      resetForm()
      fetchProducts()
    } catch {
      toast.error('Failed to save product')
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      sap_code: '',
      product_type_id: '',
      supplier_id: '',
      is_active: true,
      image: null,
    })
    setImagePreview(null)
    setEditData(null)
  }

  const handleEdit = (row) => {
    setEditData(row)
    setForm({
      name: row.name,
      sap_code: row.sap_code,
      product_type_id: row.product_type_id,
      supplier_id: row.supplier_id,
      is_active: row.is_active,
      image: null,
    })
    setImagePreview(row.image_url || null)
    setModalVisible(true)
  }

  // Handler buka modal edit inspection
  const handleEditInspection = (inspection) => {
    setEditInspection(inspection)
    setInspectionForm({
      aql_critical: inspection.aql_critical || '',
      aql_major: inspection.aql_major || '',
      used_defects: inspection.used_defects || '',
      notes: inspection.notes || '',
    })
    setInspectionModalVisible(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await backendProduct.delete(`/${id}`)
      toast.success('Product deleted')
      if (products.length === 1 && page > 1) setPage((prev) => prev - 1)
      else fetchProducts()
      resetForm()
    } catch {
      toast.error('Failed to delete product')
    }
  }

  // Handler submit update inspection
  const handleUpdateInspection = async (e) => {
    e.preventDefault()
    try {
      const res = await backendProduct.put(
        `/level-inspections/${editInspection.id}`,
        inspectionForm,
      )
      toast.success(res.data?.message || 'Inspection updated')
      setInspectionModalVisible(false)
      setEditInspection(null)
      fetchProducts() // refresh data
    } catch {
      toast.error('Failed to update inspection')
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
    { name: 'SAP Code', selector: (row) => row.sap_code, sortable: true },
    { name: 'Type', selector: (row) => row.type?.name || '-', sortable: true },
    { name: 'Supplier', selector: (row) => row.supplier?.name || '-', sortable: true },
    { name: 'Active', selector: (row) => (row.is_active ? 'Yes' : 'No'), sortable: true },
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
      {/* Info produk */}
      <strong>Product Info</strong>
      <CRow className="mb-2">
        <CCol md={6}>
          <strong>Name:</strong> {data.name}
        </CCol>
        <CCol md={6}>
          <strong>SAP Code:</strong> {data.sap_code}
        </CCol>
      </CRow>

      <CRow className="mb-2">
        <CCol md={6}>
          <strong>Type:</strong> {data.type?.name || '-'}
        </CCol>
        <CCol md={6}>
          <strong>Supplier:</strong> {data.supplier?.name || '-'}
        </CCol>
      </CRow>

      {/* Image */}
      <CRow>
        <CCol>
          <strong>Image:</strong>
          <div className="mt-2">
            <img
              src={data.image_url || '-'}
              alt="Product"
              style={{ width: '100%', maxWidth: '300px', height: 'auto', borderRadius: '8px' }}
            />
          </div>
        </CCol>
      </CRow>

      {/* Level inspections */}
      {data.level_inspections && data.level_inspections.length > 0 && (
        <div className="mt-4">
          <strong>Level Inspections</strong>
          <CTable striped bordered responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Level</CTableHeaderCell>
                <CTableHeaderCell>AQL Critical</CTableHeaderCell>
                <CTableHeaderCell>AQL Major</CTableHeaderCell>
                <CTableHeaderCell>AQL Minor</CTableHeaderCell>
                <CTableHeaderCell>Used Defects</CTableHeaderCell>
                <CTableHeaderCell>Notes</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.level_inspections.map((inspection) => (
                <CTableRow key={inspection.id}>
                  <CTableDataCell>{inspection.level}</CTableDataCell>
                  <CTableDataCell>{inspection.aql_critical}</CTableDataCell>
                  <CTableDataCell>{inspection.aql_major}</CTableDataCell>
                  <CTableDataCell>{inspection.aql_minor}</CTableDataCell>
                  <CTableDataCell>{inspection.used_defects}</CTableDataCell>
                  <CTableDataCell>{inspection.notes}</CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      size="sm"
                      color="info"
                      onClick={() => handleEditInspection(inspection)}
                    >
                      Update
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
      )}
    </div>
  )

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Product List</strong>
              <CButton onClick={() => setModalVisible(true)}>+ Add Product</CButton>
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
                  data={products}
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
            <CModalTitle>{editData ? 'Edit Product' : 'Add Product'}</CModalTitle>
          </CModalHeader>
          <CForm onSubmit={handleSubmit}>
            <CModalBody>
              <CFormLabel>Product Name</CFormLabel>
              <CFormInput name="name" value={form.name} onChange={handleInputChange} required />

              <CFormLabel className="mt-2">SAP Code</CFormLabel>
              <CFormInput
                name="sap_code"
                value={form.sap_code}
                onChange={handleInputChange}
                required
              />

              <CFormLabel className="mt-2">Product Type</CFormLabel>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadTypeOptions}
                value={typeOptions.find((opt) => opt.value === form.product_type_id) || null}
                onChange={(selected) =>
                  setForm((prev) => ({ ...prev, product_type_id: selected?.value || '' }))
                }
              />

              <CFormLabel className="mt-2">Supplier</CFormLabel>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadSupplierOptions}
                value={supplierOptions.find((opt) => opt.value === form.supplier_id) || null}
                onChange={(selected) =>
                  setForm((prev) => ({ ...prev, supplier_id: selected?.value || '' }))
                }
              />

              <CFormLabel className="mt-2">Active</CFormLabel>
              <CFormSelect
                name="is_active"
                value={form.is_active}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_active: e.target.value === 'true' }))
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </CFormSelect>

              <CFormLabel className="mt-2">Image</CFormLabel>
              <CFormInput
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const imageUrl = URL.createObjectURL(file)
                    setForm((prev) => ({ ...prev, image_url: imageUrl, image_name: file.name }))
                    setImagePreview(imageUrl)
                  }
                }}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" height={100} />
                </div>
              )}
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

        {/* Modal Update Inspection */}
        <CModal visible={inspectionModalVisible} onClose={() => setInspectionModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>Update Inspection Level</CModalTitle>
          </CModalHeader>
          <CForm onSubmit={handleUpdateInspection}>
            <CModalBody>
              <CFormLabel>AQL Critical</CFormLabel>
              <CFormInput
                type="number"
                step="0.1"
                value={inspectionForm.aql_critical}
                onChange={(e) => setInspectionForm((p) => ({ ...p, aql_critical: e.target.value }))}
                required
              />

              <CFormLabel className="mt-2">AQL Major</CFormLabel>
              <CFormInput
                type="number"
                step="0.1"
                value={inspectionForm.aql_major}
                onChange={(e) => setInspectionForm((p) => ({ ...p, aql_major: e.target.value }))}
                required
              />

              <CFormLabel className="mt-2">Used Defects</CFormLabel>
              <CFormInput
                type="text"
                value={inspectionForm.used_defects}
                onChange={(e) => setInspectionForm((p) => ({ ...p, used_defects: e.target.value }))}
              />

              <CFormLabel className="mt-2">Notes</CFormLabel>
              <CFormInput
                type="text"
                value={inspectionForm.notes}
                onChange={(e) => setInspectionForm((p) => ({ ...p, notes: e.target.value }))}
              />
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setInspectionModalVisible(false)}>
                Cancel
              </CButton>
              <CButton type="submit" color="primary">
                Update
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>
      </CRow>
    </>
  )
}

export default ProductPage
