import React from 'react'
import { CCard, CCardBody, CCardHeader, CButton, CRow, CCol } from '@coreui/react'

const QRDisplayCard = ({ qrData, boxId, serialCount, onCreateNew, onDownload, onPrint }) => {
  return (
    <CCard className="mb-4">
      <CCardHeader className="bg-success text-white">
        <strong>✅ Box Created Successfully!</strong>
      </CCardHeader>
      <CCardBody className="text-center">
        <div className="mb-4">
          <CRow className="mb-3">
            <CCol>
              <small className="text-muted">Box ID</small>
              <div className="fw-bold">{boxId}</div>
            </CCol>
            <CCol>
              <small className="text-muted">Total Serials</small>
              <div className="fw-bold text-success">{serialCount}</div>
            </CCol>
          </CRow>
        </div>

        {/* QR Code Display */}
        <div className="mb-4 p-3 bg-light rounded">
          {qrData?.qrCodeUrl ? (
            <img
              src={qrData.qrCodeUrl}
              alt="Box QR Code"
              style={{ maxWidth: '300px', width: '100%' }}
            />
          ) : qrData?.qrCodeBase64 ? (
            <img
              src={`data:image/png;base64,${qrData.qrCodeBase64}`}
              alt="Box QR Code"
              style={{ maxWidth: '300px', width: '100%' }}
            />
          ) : (
            <div className="py-5">
              <div style={{ fontSize: '4rem' }}>📦</div>
              <p className="text-muted">QR Code</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <CRow className="g-2">
          {onDownload && (
            <CCol md={6}>
              <CButton color="info" className="w-100 text-white" onClick={onDownload}>
                ⬇ Download QR
              </CButton>
            </CCol>
          )}
          {onPrint && (
            <CCol md={6}>
              <CButton color="secondary" className="w-100 text-white" onClick={onPrint}>
                ⎙ Print QR
              </CButton>
            </CCol>
          )}
          <CCol md={12}>
            <CButton color="primary" className="w-100 text-white" onClick={onCreateNew}>
              + Create New Box
            </CButton>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default QRDisplayCard
