import React from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBarcode } from '@coreui/icons'
import ErrorCard from './ErrorCard'
import SuccessCard from './SuccessCard'

const styles = {
  iconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    backgroundColor: 'rgba(108, 117, 125, 0.1)',
  },
}

/**
 * StatusCard Component
 * Displays Error, Success, or Waiting status based on props
 *
 * @param {Object} props
 * @param {string} props.errorMessage - Error message to display (shows ErrorCard if provided)
 * @param {string} props.errorSerialNumber - Serial number for error display
 * @param {Object} props.successValidation - Success validation object { serialNumber, message }
 * @param {string} props.waitingMessage - Message to show in waiting state (default: "Scan serial number to start")
 * @param {string} props.waitingTitle - Title for waiting card header (default: "Status")
 * @param {boolean} props.fullHeight - Whether to use full height (default: true)
 * @param {string} props.className - Additional CSS classes
 */
const StatusCard = ({
  errorMessage,
  errorSerialNumber,
  successValidation,
  waitingMessage = 'Scan serial number to start',
  waitingTitle = 'Status',
  fullHeight = true,
  className = '',
}) => {
  // Error state
  if (errorMessage) {
    return (
      <ErrorCard
        serialNumber={errorSerialNumber}
        message={errorMessage}
        fullHeight={fullHeight}
        className={className}
      />
    )
  }

  // Success state
  if (successValidation) {
    return (
      <SuccessCard
        serialNumber={successValidation.serialNumber}
        message={successValidation.message}
        fullHeight={fullHeight}
        className={className}
      />
    )
  }

  // Waiting/Default state
  const cardClass = [
    'd-flex',
    'flex-column',
    fullHeight ? 'h-100' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <CCard className={cardClass}>
      <CCardHeader className="d-flex align-items-center gap-2">
        <CIcon icon={cilBarcode} />
        <strong>{waitingTitle}</strong>
      </CCardHeader>
      <CCardBody className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
        <div style={styles.iconWrapper}>
          <CIcon icon={cilBarcode} size="3xl" style={{ color: '#6c757d' }} />
        </div>
        <p className="text-center text-muted mb-0" style={{ fontSize: '1rem' }}>
          {waitingMessage}
        </p>
      </CCardBody>
    </CCard>
  )
}

export default StatusCard

