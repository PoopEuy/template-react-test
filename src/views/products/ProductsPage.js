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
} from '@coreui/react'
import { apiProducts } from '../../api/axios'

// Deteksi apakah sebuah field adalah gambar berdasarkan nama field atau nilai URL-nya
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

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await apiProducts.get('/')
        const data = res.data
        // support array response maupun { data: [...] } wrapper
        setProducts(Array.isArray(data) ? data : data.data ?? [])
      } catch (err) {
        setError(err.response?.data?.message ?? err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Derive column keys dynamically from the first item
  const columns = products.length > 0 ? Object.keys(products[0]) : []

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex align-items-center justify-content-between">
            <strong>Products</strong>
            {!loading && !error && (
              <CBadge color="primary" shape="rounded-pill">
                {products.length} items
              </CBadge>
            )}
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
                <br />
                <small className="text-medium-emphasis">
                  Pastikan backend berjalan di <code>{PRODUCTS_URL}</code>
                </small>
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
                      <CTableHeaderCell scope="col" style={{ width: '50px' }}>
                        #
                      </CTableHeaderCell>
                      {columns.map((col) => (
                        <CTableHeaderCell key={col} scope="col">
                          {col.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </CTableHeaderCell>
                      ))}
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
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ProductsPage
