import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CAlert,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CImage,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import { apiProducts } from '../../api/axios'

// Deteksi apakah sebuah field adalah gambar
const IMAGE_FIELD_KEYWORDS = ['image', 'img', 'photo', 'picture', 'foto', 'thumbnail', 'avatar', 'cover']
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i

const isImageField = (key, value) => {
  if (!value || typeof value !== 'string') return false
  const keyLower = key.toLowerCase()
  const hasImageKeyword = IMAGE_FIELD_KEYWORDS.some((kw) => keyLower.includes(kw))
  const hasImageExtension = IMAGE_EXTENSIONS.test(value)
  const isUrl = value.startsWith('http') || value.startsWith('/')
  return (hasImageKeyword && isUrl) || hasImageExtension
}

const INITIAL_FORM = { name: '', description: '', price: '', image: '' }

const MODAL_CONFIG = {
  create: { title: 'Add Product',  successMsg: 'Produk berhasil ditambahkan!' },
  edit:   { title: 'Edit Product', successMsg: 'Produk berhasil diperbarui!' },
}

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal state
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Delete confirm state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiProducts.get('/')
      const data = res.data
      setProducts(Array.isArray(data) ? data : data.data ?? [])
    } catch (err) {
      setError(err.response?.data?.message ?? err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const columns = products.length > 0 ? Object.keys(products[0]) : []

  // --- Open modal helpers ---
  const openCreate = () => {
    setModalMode('create')
    setEditingId(null)
    setForm(INITIAL_FORM)
    setFormErrors({})
    setSubmitError(null)
    setSubmitSuccess(false)
    setShowModal(true)
  }

  const openEdit = (product) => {
    setModalMode('edit')
    setEditingId(product.id)
    setForm({
      name: product.name ?? '',
      description: product.description ?? '',
      price: product.price ?? '',
      image: product.image ?? '',
    })
    setFormErrors({})
    setSubmitError(null)
    setSubmitSuccess(false)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    if (submitting) return
    setShowModal(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  // Validasi
  const validate = () => {
    const errors = {}
    if (modalMode === 'create') {
      if (!form.name.trim()) errors.name = 'Nama produk wajib diisi.'
      if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
        errors.price = 'Harga harus berupa angka positif.'
    }
    // edit (PATCH): tidak ada field wajib, boleh isi sebagian
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }

    try {
      setSubmitting(true)
      setSubmitError(null)

      if (modalMode === 'create') {
        await apiProducts.post('/', {
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          image: form.image.trim(),
        })
      } else {
        // PATCH — hanya kirim field yang terisi
        const payload = {}
        if (form.name.trim())        payload.name        = form.name.trim()
        if (form.description.trim()) payload.description = form.description.trim()
        if (form.price !== '' && !isNaN(Number(form.price))) payload.price = Number(form.price)
        if (form.image.trim())       payload.image       = form.image.trim()
        await apiProducts.patch(`/${editingId}`, payload)
      }

      setSubmitSuccess(true)
      await fetchProducts()
      setTimeout(() => setShowModal(false), 800)
    } catch (err) {
      setSubmitError(err.response?.data?.message ?? err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const isCreate = modalMode === 'create'

  // --- Delete handlers ---
  const openDelete = (product) => {
    setDeletingProduct(product)
    setDeleteError(null)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    if (deleting) return
    setShowDeleteModal(false)
    setDeletingProduct(null)
  }

  const handleDelete = async () => {
    if (!deletingProduct) return
    try {
      setDeleting(true)
      setDeleteError(null)
      await apiProducts.delete(`/${deletingProduct.id}`)
      setShowDeleteModal(false)
      setDeletingProduct(null)
      await fetchProducts()
    } catch (err) {
      setDeleteError(err.response?.data?.message ?? err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex align-items-center justify-content-between">
            <strong>Products</strong>
            <div className="d-flex align-items-center gap-2">
              {!loading && !error && (
                <CBadge color="primary" shape="rounded-pill">
                  {products.length} items
                </CBadge>
              )}
              <CButton color="primary" size="sm" onClick={openCreate}>
                <CIcon icon={cilPlus} className="me-1" />
                Add Product
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {loading && (
              <div className="text-center py-5">
                <CSpinner color="primary" />
                <p className="mt-3 text-medium-emphasis">Loading products...</p>
              </div>
            )}

            {error && (
              <CAlert color="danger">
                <strong>Gagal memuat data.</strong> {error}
              </CAlert>
            )}

            {!loading && !error && products.length === 0 && (
              <CAlert color="warning">Tidak ada data produk ditemukan.</CAlert>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="table-responsive">
                <CTable hover striped bordered align="middle" className="mb-0">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell scope="col" style={{ width: '50px' }}>#</CTableHeaderCell>
                      {columns.map((col) => (
                        <CTableHeaderCell key={col} scope="col">
                          {col.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </CTableHeaderCell>
                      ))}
                      <CTableHeaderCell scope="col" style={{ width: '130px' }}>
                        Actions
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {products.map((product, index) => (
                      <CTableRow key={product.id ?? index}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        {columns.map((col) => (
                          <CTableDataCell key={col}>
                            {product[col] === null || product[col] === undefined ? (
                              <span className="text-medium-emphasis">—</span>
                            ) : typeof product[col] === 'boolean' ? (
                              <CBadge color={product[col] ? 'success' : 'secondary'}>
                                {product[col] ? 'Yes' : 'No'}
                              </CBadge>
                            ) : typeof product[col] === 'object' ? (
                              JSON.stringify(product[col])
                            ) : isImageField(col, String(product[col])) ? (
                              <CImage
                                src={String(product[col])}
                                alt={col}
                                width={64}
                                height={64}
                                style={{
                                  objectFit: 'cover',
                                  borderRadius: '6px',
                                  border: '1px solid #dee2e6',
                                  cursor: 'pointer',
                                }}
                                onClick={() => window.open(String(product[col]), '_blank')}
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.insertAdjacentHTML(
                                    'afterend',
                                    '<span class="text-medium-emphasis">No image</span>',
                                  )
                                }}
                              />
                            ) : (
                              String(product[col])
                            )}
                          </CTableDataCell>
                        ))}
                        {/* Action buttons */}
                        <CTableDataCell>
                          <div className="d-flex gap-1">
                            <CTooltip content="Edit product">
                              <CButton
                                color="warning"
                                variant="outline"
                                size="sm"
                                onClick={() => openEdit(product)}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                            </CTooltip>
                            <CTooltip content="Delete product">
                              <CButton
                                color="danger"
                                variant="outline"
                                size="sm"
                                onClick={() => openDelete(product)}
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </CTooltip>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Modal Create / Edit */}
      <CModal visible={showModal} onClose={handleCloseModal} alignment="center" backdrop="static">
        <CModalHeader>
          <CModalTitle>{MODAL_CONFIG[modalMode].title}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            {submitSuccess && (
              <CAlert color="success" className="mb-3">
                {MODAL_CONFIG[modalMode].successMsg}
              </CAlert>
            )}
            {submitError && (
              <CAlert color="danger" className="mb-3">
                <strong>Gagal menyimpan.</strong> {submitError}
              </CAlert>
            )}

            {/* Name */}
            <div className="mb-3">
              <CFormLabel htmlFor="name">
                Name {isCreate && <span className="text-danger">*</span>}
              </CFormLabel>
              <CFormInput
                id="name"
                name="name"
                placeholder={isCreate ? 'Masukkan nama produk' : 'Kosongkan jika tidak ingin diubah'}
                value={form.name}
                onChange={handleChange}
                invalid={!!formErrors.name}
                disabled={submitting}
              />
              {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
            </div>

            {/* Description */}
            <div className="mb-3">
              <CFormLabel htmlFor="description">Description</CFormLabel>
              <CFormTextarea
                id="description"
                name="description"
                placeholder={isCreate ? 'Masukkan deskripsi produk' : 'Kosongkan jika tidak ingin diubah'}
                rows={3}
                value={form.description}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            {/* Price */}
            <div className="mb-3">
              <CFormLabel htmlFor="price">
                Price {isCreate && <span className="text-danger">*</span>}
              </CFormLabel>
              <CFormInput
                id="price"
                name="price"
                type="number"
                min="0"
                placeholder={isCreate ? 'Contoh: 12000000' : 'Kosongkan jika tidak ingin diubah'}
                value={form.price}
                onChange={handleChange}
                invalid={!!formErrors.price}
                disabled={submitting}
              />
              {formErrors.price && <div className="invalid-feedback d-block">{formErrors.price}</div>}
            </div>

            {/* Image URL */}
            <div className="mb-3">
              <CFormLabel htmlFor="image">Image URL</CFormLabel>
              <CFormInput
                id="image"
                name="image"
                placeholder={isCreate ? 'https://example.com/image.jpg' : 'Kosongkan jika tidak ingin diubah'}
                value={form.image}
                onChange={handleChange}
                disabled={submitting}
              />
              {form.image && (
                <div className="mt-2">
                  <CImage
                    src={form.image}
                    alt="preview"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #dee2e6',
                    }}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
              )}
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="outline" onClick={handleCloseModal} disabled={submitting}>
              Cancel
            </CButton>
            <CButton color={isCreate ? 'primary' : 'warning'} type="submit" disabled={submitting}>
              {submitting ? (
                <><CSpinner size="sm" className="me-1" />Saving...</>
              ) : isCreate ? (
                'Save Product'
              ) : (
                'Update Product'
              )}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
      {/* Modal Delete Confirm */}
      <CModal visible={showDeleteModal} onClose={handleCloseDeleteModal} alignment="center">
        <CModalHeader>
          <CModalTitle>Hapus Product</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {deleteError && (
            <CAlert color="danger" className="mb-3">
              <strong>Gagal menghapus.</strong> {deleteError}
            </CAlert>
          )}
          <p className="mb-1">
            Yakin ingin menghapus produk ini?
          </p>
          {deletingProduct && (
            <p className="fw-semibold mb-0">
              &ldquo;{deletingProduct.name ?? `ID: ${deletingProduct.id}`}&rdquo;
            </p>
          )}
          <small className="text-medium-emphasis">Tindakan ini tidak bisa dibatalkan.</small>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={handleCloseDeleteModal} disabled={deleting}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <><CSpinner size="sm" className="me-1" />Deleting...</>
            ) : (
              'Delete'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default ProductsPage
