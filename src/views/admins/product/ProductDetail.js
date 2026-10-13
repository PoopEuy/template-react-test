import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { backendProduct } from '../../../api/axios'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CButton,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CFormSelect,
  CImage,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import { toast } from 'react-toastify'
import NotFoundCard from '../../components/NotFoundCard'

const ProductDetail = () => {
  const { sapCode } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Image modal state
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const fetchProductDetail = useCallback(async () => {
    setLoading(true)
    try {
      const res = await backendProduct.get('/parents', {
        params: {
          include_details: true,
          search: sapCode,
        },
      })
      // Ambil data pertama dari hasil pencarian
      const data = res.data.data
      if (data && data.length > 0) {
        setProduct(data[0])
      } else {
        setProduct(null)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch product detail')
    } finally {
      setLoading(false)
    }
  }, [sapCode])

  useEffect(() => {
    if (sapCode) {
      fetchProductDetail()
    }
  }, [sapCode, fetchProductDetail])

  // Reset page when product changes
  useEffect(() => {
    setCurrentPage(1)
  }, [product])

  const handleComponentDetail = (componentSapCode) => {
    if (componentSapCode) {
      navigate(`/masterdata/product/detail/${componentSapCode}`)
    } else {
      toast.error('SAP Code component tidak tersedia')
    }
  }

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl)
    setImageModalVisible(true)
  }

  // Pagination logic
  const components = useMemo(() => product?.components || [], [product])
  const totalItems = components.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const paginatedComponents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return components.slice(startIndex, endIndex)
  }, [components, currentPage, itemsPerPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center loading-container">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <NotFoundCard
        headerTitle="Product Detail"
        title="Product Not Found"
        message="No product data found for"
        searchLabel="SAP Code"
        searchValue={sapCode}
        onBack={() => navigate(-1)}
        onRetry={fetchProductDetail}
      />
    )
  }

  return (
    <>
      {/* Card Product Info */}
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Product Detail</strong>
          <CButton color="secondary" size="sm" onClick={() => navigate(-1)}>
            Back
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CRow>
            {/* Left Side - Product Image */}
            <CCol md={4} className="d-flex justify-content-center align-items-start">
              <div className="product-image-container">
                {product.image_url ? (
                  <CImage
                    src={product.image_url}
                    alt={product.name || 'Product Image'}
                    className="product-image-thumbnail"
                    onClick={() => handleImageClick(product.image_url)}
                    title="Click to enlarge"
                  />
                ) : (
                  <div className="product-image-placeholder">No Image Available</div>
                )}
                <div className="text-muted small product-image-hint">
                  {product.image_url ? 'Click image to enlarge' : ''}
                </div>
              </div>
            </CCol>

            {/* Right Side - Product Details */}
            <CCol md={8}>
              <CRow className="mb-3">
                <CCol sm={4}>
                  <span className="product-detail-label">SAP Code</span>
                </CCol>
                <CCol sm={8}>
                  <span className="product-detail-separator">:</span>{' '}
                  <span className="product-detail-value">{product.sap_code || '-'}</span>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol sm={4}>
                  <span className="product-detail-label">Product Name</span>
                </CCol>
                <CCol sm={8}>
                  <span className="product-detail-separator">:</span>{' '}
                  <span className="product-detail-value">{product.name || '-'}</span>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol sm={4}>
                  <span className="product-detail-label">Description</span>
                </CCol>
                <CCol sm={8}>
                  <span className="product-detail-separator">:</span>{' '}
                  <span className="product-detail-value">{product.description || '-'}</span>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol sm={4}>
                  <span className="product-detail-label">Product Type</span>
                </CCol>
                <CCol sm={8}>
                  <span className="product-detail-separator">:</span>{' '}
                  <span className="product-detail-value">{product.type?.name || '-'}</span>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol sm={4}>
                  <span className="product-detail-label">Supplier</span>
                </CCol>
                <CCol sm={8}>
                  <span className="product-detail-separator">:</span>{' '}
                  <span className="product-detail-value">{product.supplier?.name || '-'}</span>
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Card Components */}
      {components.length > 0 && (
        <CCard className="mt-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Product Components</strong>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Show:</span>
              <CFormSelect
                size="sm"
                className="pagination-select"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </CFormSelect>
            </div>
          </CCardHeader>
          <CCardBody>
            <CTable bordered responsive hover>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell className="text-center table-col-no">No</CTableHeaderCell>
                  <CTableHeaderCell>SAP Code</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Supplier</CTableHeaderCell>
                  <CTableHeaderCell className="text-center table-col-action">
                    Action
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {paginatedComponents.map((component, index) => (
                  <CTableRow
                    key={component.id || component.sap_code || component.product?.sap_code || index}
                  >
                    <CTableDataCell className="text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </CTableDataCell>
                    <CTableDataCell>
                      {component.product?.sap_code || component.sap_code || '-'}
                    </CTableDataCell>
                    <CTableDataCell>
                      {component.product?.name || component.name || '-'}
                    </CTableDataCell>
                    <CTableDataCell>
                      {component.product?.type?.name || component.type?.name || '-'}
                    </CTableDataCell>
                    <CTableDataCell>
                      {component.product?.supplier?.name || component.supplier?.name || '-'}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton
                        size="sm"
                        color="primary"
                        onClick={() =>
                          handleComponentDetail(component.product?.sap_code || component.sap_code)
                        }
                      >
                        Detail
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted small">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
              </div>
              {totalPages > 1 && (
                <CPagination aria-label="Component pagination">
                  <CPaginationItem
                    aria-label="Previous"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'cursor-not-allowed' : 'cursor-pointer'}
                  >
                    <span aria-hidden="true">&laquo;</span>
                  </CPaginationItem>

                  {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                      <CPaginationItem key={`ellipsis-${idx}`} disabled>
                        ...
                      </CPaginationItem>
                    ) : (
                      <CPaginationItem
                        key={page}
                        active={currentPage === page}
                        onClick={() => handlePageChange(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </CPaginationItem>
                    ),
                  )}

                  <CPaginationItem
                    aria-label="Next"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? 'cursor-not-allowed' : 'cursor-pointer'}
                  >
                    <span aria-hidden="true">&raquo;</span>
                  </CPaginationItem>
                </CPagination>
              )}
            </div>
          </CCardBody>
        </CCard>
      )}

      {/* No Components Message */}
      {components.length === 0 && (
        <CCard className="mt-4">
          <CCardHeader>
            <strong>Product Components</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-muted mb-0">No components found for this product.</p>
          </CCardBody>
        </CCard>
      )}

      {/* Image Modal */}
      <CModal
        visible={imageModalVisible}
        onClose={() => setImageModalVisible(false)}
        size="lg"
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>{product?.name || 'Product Image'}</CModalTitle>
        </CModalHeader>
        <CModalBody className="text-center p-4">
          {selectedImage && (
            <CImage
              src={selectedImage}
              alt={product?.name || 'Product Image'}
              className="product-modal-image"
            />
          )}
        </CModalBody>
      </CModal>
    </>
  )
}

export default ProductDetail
