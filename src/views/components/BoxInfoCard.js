import React from 'react'
import { CCard, CCardBody, CCardHeader, CProgress, CButton } from '@coreui/react'

const BoxInfoCard = ({ boxId, capacity, scannedCount, onFinalize, disabled, loading }) => {
  const percentage = capacity > 0 ? (scannedCount / capacity) * 100 : 0
  const isFull = scannedCount >= capacity
  const canFinalize = scannedCount > 0

  return (
    <CCard className="mb-4">
      <CCardHeader className="bg-info text-white">
        <strong>📦 Box Information</strong>
      </CCardHeader>
      <CCardBody>
        {boxId && (
          <div className="mb-3">
            <small className="text-muted">Box ID</small>
            <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>
              {boxId}
            </div>
          </div>
        )}

        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-semibold">Capacity</span>
            <span className="fw-bold">{capacity}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="fw-semibold">Scanned</span>
            <span
              className="fw-bold"
              style={{ color: isFull ? '#28a745' : scannedCount > 0 ? '#0d6efd' : '#6c757d' }}
            >
              {scannedCount} / {capacity}
            </span>
          </div>

          <CProgress
            value={percentage}
            color={isFull ? 'success' : scannedCount > 0 ? 'info' : 'secondary'}
            className="mb-2"
          />

          <div className="text-center">
            <small className={isFull ? 'text-success fw-bold' : 'text-muted'}>
              {isFull ? '✓ Box Full!' : `${capacity - scannedCount} slots remaining`}
            </small>
          </div>
        </div>

        {canFinalize && (
          <div className="d-grid">
            <CButton
              color={isFull ? 'success' : 'primary'}
              onClick={onFinalize}
              disabled={disabled || loading}
              className="text-white"
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Processing...
                </>
              ) : (
                <>✓ Finalize Box</>
              )}
            </CButton>
            {!isFull && <small className="text-muted text-center mt-2">Box is not full yet</small>}
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default BoxInfoCard
