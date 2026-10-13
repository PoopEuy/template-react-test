// components/ToastContainerWrapper.jsx
import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ToastContainerWrapper = () => (
  <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light" // atau "dark"
  />
)

export default ToastContainerWrapper
