import React from 'react'
import { CCard, CCardBody, CCardHeader, CButton, CTable } from '@coreui/react'

const SerialListTable = ({ serials, onRemove, disabled }) => {
  if (serials.length === 0) {
    return (
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Scanned Serials</strong>
        </CCardHeader>
        <CCardBody className="text-center text-muted py-5">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <p>No serials scanned yet. Start scanning to add serials to the box.</p>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Scanned Serials</strong>
        <span className="badge bg-primary">{serials.length}</span>
      </CCardHeader>
      <CCardBody style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <CTable hover responsive striped>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>No</th>
              <th>Assembly Serial Code</th>
              <th style={{ width: '80px' }} className="text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {serials.map((serial, index) => (
              <tr key={serial.id}>
                <td>{index + 1}</td>
                <td className="fw-semibold">{serial.partialCode}</td>
                <td className="text-center">
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => onRemove(serial.id)}
                    disabled={disabled}
                    title="Remove serial"
                    className="text-white"
                  >
                    ×
                  </CButton>
                </td>
              </tr>
            ))}
          </tbody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default SerialListTable
