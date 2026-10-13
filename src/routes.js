import React, { lazy } from 'react'
import { Navigate } from 'react-router-dom'

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'))
const ProductsPage = lazy(() => import('./views/products/ProductsPage'))

const routes = [
  // Redirect root ke /products
  {
    path: '/',
    element: <Navigate to="/products" replace />,
  },
  // Products
  {
    path: '/products',
    element: (
      <DefaultLayout>
        <ProductsPage />
      </DefaultLayout>
    ),
  },
  // Fallback
  {
    path: '*',
    element: <Navigate to="/products" replace />,
  },
]

export default routes
