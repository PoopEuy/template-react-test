import React from 'react'
import { CCard, CCardBody, CCardHeader, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilXCircle } from '@coreui/icons'

const styles = {
  iconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    backgroundColor: 'rgba(229, 83, 83, 0.15)',
  },
}

const ErrorCard = ({ serialNumber, message, fullHeight = true, className = '' }) => {
  const cardClass = [
    'd-flex',
    'flex-column',
    fullHeight ? 'h-100' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <CCard className={cardClass}>
      <CCardHeader className="bg-danger text-white d-flex align-items-center gap-2">
        <CIcon icon={cilXCircle} />
        <strong>Error</strong>
      </CCardHeader>
      <CCardBody className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
        <div style={styles.iconWrapper}>
          <CIcon icon={cilXCircle} size="3xl" style={{ color: '#e55353' }} />
        </div>
        {serialNumber && (
          <CBadge color="danger" className="mb-3 px-3 py-2">
            Serial: {serialNumber}
          </CBadge>
        )}
        {message && (
          <p
            className="text-center text-danger mb-0"
            style={{ fontSize: '1rem', fontWeight: '500' }}
          >
            {message}
          </p>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ErrorCard
