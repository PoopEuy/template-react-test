import React from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'

const PlnSerialCard = ({ plnSerial, productName }) => {
  return (
    <CCard className="mb-4">
      <CCardHeader className="bg-success text-white">
        <strong>⚡ PLN Serial Number</strong>
      </CCardHeader>
      <CCardBody className="text-center">
        <div className="mb-3">
          {productName && (
            <div className="mb-2">
              <small className="text-muted">Product</small>
              <div className="fw-semibold">{productName}</div>
            </div>
          )}
        </div>
        <div
          className="p-3 rounded"
          style={{
            backgroundColor: '#d1e7dd',
            border: '2px solid #badbcc',
          }}
        >
          <h4 className="mb-0 fw-bold" style={{ color: '#0f5132' }}>
            {plnSerial}
          </h4>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default PlnSerialCard
