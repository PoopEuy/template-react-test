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
} from '@coreui/react'

const PRODUCTS_URL = 'http://localhost:2000/products'

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(PRODUCTS_URL)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        // support both array response and { data: [...] } wrapper
        setProducts(Array.isArray(data) ? data : data.data ?? [])
      } catch (err) {
        setError(err.message)
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
                            {product[col] === null || product[col] === undefined
                              ? <span className="text-medium-emphasis">—</span>
                              : typeof product[col] === 'boolean'
                              ? <CBadge color={product[col] ? 'success' : 'secondary'}>{product[col] ? 'Yes' : 'No'}</CBadge>
                              : typeof product[col] === 'object'
                              ? JSON.stringify(product[col])
                              : String(product[col])}
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
