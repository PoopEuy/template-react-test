import React from 'react'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'

const ValidationPopup = ({ visible, type = 'success', title, serialNumber, message, onClose }) => {
  const isSuccess = type === 'success'
  const resolvedTitle = title || (isSuccess ? 'Success' : 'Error')
  const resolvedMessage =
    message || (isSuccess ? 'Operasi berhasil diselesaikan.' : 'Terjadi kesalahan.')

  return (
    <CModal
      alignment="center"
      visible={visible}
      onClose={onClose}
      className={`validation-popup validation-popup--${type}`}
    >
      <CModalHeader closeButton>
        <CModalTitle>{resolvedTitle}</CModalTitle>
      </CModalHeader>
      <CModalBody className="text-center">
        <div className={`display-4 mb-3 ${isSuccess ? 'text-success' : 'text-danger'}`}>
          {isSuccess ? '✓' : '⚠️'}
        </div>
        {serialNumber && <p className="fw-semibold mb-1">Serial: {serialNumber}</p>}
        <p className="mb-0">{resolvedMessage}</p>
      </CModalBody>
      <CModalFooter className="justify-content-center">
        <CButton color={isSuccess ? 'success' : 'danger'} onClick={onClose}>
          OK
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ValidationPopup
