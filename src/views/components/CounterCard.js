import React from 'react'
import { CCard, CCardBody, CCol } from '@coreui/react'

export const CounterCard6 = ({ title, value }) => (
  <CCol md={6}>
    <CCard className="mb-3">
      <CCardBody>
        <h6 className="text-muted">{title}</h6>
        <h4>{value}</h4>
      </CCardBody>
    </CCard>
  </CCol>
)

export const CounterCard12 = ({ title, value }) => (
  <CCol md={12}>
    <CCard className="mb-3">
      <CCardBody>
        <h6 className="text-muted">{title}</h6>
        <h4>{value}</h4>
      </CCardBody>
    </CCard>
  </CCol>
)
