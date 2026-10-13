import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

const DefaultLayout = ({ children }) => {
  return (
    <div className="app d-flex">
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />

        {/* Body utama */}
        <div className="body flex-grow-1 d-flex flex-column">
          <div className="container-lg flex-grow-1">{children ? children : <AppContent />}</div>
        </div>

        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
