import React, { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import PrivateRoutes from './PrivateRoutes'

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'))
const ProductsPage = lazy(() => import('./views/products/ProductsPage'))

const routes = [
  // Redirect root ke /products
  {
    path: '/',
    element: <Navigate to="/products" replace />,
  },
  // Products — harus login
  {
    path: '/products',
    element: (
      <PrivateRoutes>
        <DefaultLayout>
          <ProductsPage />
        </DefaultLayout>
      </PrivateRoutes>
    ),
  },
  // Fallback
  {
    path: '*',
    element: <Navigate to="/products" replace />,
  },
]

export default routes
