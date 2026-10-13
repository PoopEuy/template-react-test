import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CCollapse,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CRow,
} from '@coreui/react'
import { backendTracking } from '../../api/axios'
import { CounterCard6 } from '../components/CounterCard'

const DashboardPLN = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [expanded, setExpanded] = useState({})
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // simpan pagination dari API
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await backendTracking.get('/pln-order-grouping', {
          params: { page, limit: 2, order: 'desc' },
        })

        if (res.data.success) {
          const { pln_orders, pagination } = res.data.data
          setOrders(pln_orders || [])
          setPagination(pagination)
        }
      } catch (err) {
        console.error('Error fetching PLN orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page, limit])

  const toggleExpand = (assemblyId) => {
    setExpanded((prev) => ({
      ...prev,
      [assemblyId]: !prev[assemblyId],
    }))
  }

  const handleNavigateAssembly = (assemblyId, plnOrderNumber) => {
    navigate(`/tracking/byorder?assembly_id=${assemblyId}&pln_order_number=${plnOrderNumber}`, {
      state: { assembly_id: assemblyId, pln_order_number: plnOrderNumber },
    })
  }

  // helper badge status
  const getStatusBadge = (status) => {
    let color = 'secondary'
    let text = status

    switch (status) {
      case 'in_progress':
        color = 'info'
        text = 'Running'
        break
      case 'completed':
        color = 'success'
        text = 'Completed'
        break
      case 'scheduled':
        color = 'warning'
        text = 'Scheduled'
        break
      default:
        color = 'secondary'
        text = status || 'Unknown'
    }

    return <span className={`badge bg-${color} fs-6`}>{text}</span>
  }

  if (loading) {
    return (
      <div className="text-center p-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <div>
      {orders.length === 0 ? (
        <p className="text-center text-muted">No PLN Orders found</p>
      ) : (
        orders.map((order) => (
          <CCard key={order.pln_order_id} className="mb-3 shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>PLN Order Code: {order.pln_order_details.order_number}</strong>
              {/* Ubah dari Total Quantity ke Status Progress */}
              {getStatusBadge(order.pln_order_status)}
            </CCardHeader>

            <CCardBody>
              {/* Counter Cards */}
              <CRow>
                <CounterCard6
                  title="Order Date"
                  value={new Date(order.pln_order_details.order_date).toLocaleDateString()}
                />
                <CounterCard6
                  title="Deadline"
                  value={new Date(order.pln_order_details.deadline).toLocaleDateString()}
                />
                <CounterCard6 title="Quantity" value={order.pln_order_details.quantity} />

                {/* Days Remaining -> jika complete ubah menjadi "Completed" */}
                <CounterCard6
                  title="Days Remaining"
                  value={
                    order.pln_order_status === 'completed' ? (
                      <span className="text-success fw-bold">Completed</span>
                    ) : (
                      order.pln_order_details.deadline_info.days_remaining
                    )
                  }
                />
              </CRow>

              {/* Assemblies */}
              {order.assemblies.map((asm, idx) => {
                const isCompleted =
                  order.pln_order_status === 'completed' || asm.assembly_status === 'completed'

                return (
                  <div key={asm.assembly_id} className="mb-2 mt-3">
                    <div className="d-flex align-items-stretch gap-2">
                      <CButton
                        color="light"
                        className="d-flex justify-content-between align-items-center w-100"
                        onClick={() => toggleExpand(asm.assembly_id)}
                      >
                        <span>Batch {idx + 1}</span>

                        {isCompleted ? (
                          <span className="badge bg-success text-white">Completed</span>
                        ) : (
                          <span className="badge bg-info">Quantity : {asm.current_quantity}</span>
                        )}
                      </CButton>

                      <CButton
                        color="light"
                        className="px-3 text-nowrap fw-semibold border"
                        onClick={() => handleNavigateAssembly(asm.assembly_id, order.pln_order_details.order_number)}
                      >
                        Serial List
                      </CButton>
                    </div>

                    <CCollapse visible={expanded[asm.assembly_id]}>
                      <CListGroup>
                        {(asm.qc_progress_by_id || []).map((qc) => {
                          const isQcCompleted = qc.completed === qc.total && qc.total > 0
                          return (
                            <CListGroupItem
                              key={qc.qc_id}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <span>
                                {' '}
                                {qc.qc_name} :{' '}
                                <strong>
                                  {qc.completed} / {qc.total}
                                </strong>
                              </span>
                              {isQcCompleted ? (
                                <span className="badge bg-success">Completed</span>
                              ) : (
                                <span className="badge bg-info">Running</span>
                              )}
                            </CListGroupItem>
                          )
                        })}
                      </CListGroup>
                    </CCollapse>
                  </div>
                )
              })}
            </CCardBody>
          </CCard>
        ))
      )}

      {/* Pagination Control */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <CButton disabled={!pagination.hasPrev} onClick={() => setPage((p) => p - 1)}>
          Prev
        </CButton>

        <span>
          Page {pagination.page} / {pagination.pages}
        </span>

        <CButton disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>
          Next
        </CButton>
      </div>
    </div>
  )
}

export default DashboardPLN
