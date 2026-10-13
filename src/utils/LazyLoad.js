import { lazy, Suspense } from 'react'

// Loading fallback component
const LoadingFallback = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '300px',
      width: '100%',
    }}
  >
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
)

// Lazy load wrapper with Suspense
export const lazyLoad = (importFunc, fallback = <LoadingFallback />) => {
  const LazyComponent = lazy(importFunc)

  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

// Export LoadingFallback untuk custom usage
export { LoadingFallback }

// Usage examples:
// import { lazyLoad } from './utils/LazyLoad'
//
// // Basic usage
// const Dashboard = lazyLoad(() => import('./views/dashboard/Dashboard'))
//
// // With custom fallback
// const ProductPage = lazyLoad(
//   () => import('./views/admins/product/ProductPage'),
//   <div>Custom Loading...</div>
// )

