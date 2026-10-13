import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CSpinner,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import Select from 'react-select'
import { backendGenerate, backendAssembly } from '../../../api/axios'
import { toast } from 'react-toastify'

const GeneratePlnSerial = () => {
  const [formData, setFormData] = useState({
    referencePO: '',
    plnRaw: 'PLN01030000195',
    stsId: '125',
    generateQty: '',
  })

  const [loading, setLoading] = useState(false)
  const [serialNumbers, setSerialNumbers] = useState([])
  const [orders, setOrders] = useState([])

  // Fetch Assembly Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await backendAssembly.get('/assembly-orders')
        const data = res.data?.data || []
        setOrders(data)
      } catch (err) {
        console.error(err)
        toast.error('Failed to fetch Assembly Orders')
      }
    }
    fetchOrders()
  }, [])

  const handleInput = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOrderSelect = (selected) => {
    setFormData((prev) => ({
      ...prev,
      referencePO: selected ? selected.value : '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      referencePo: formData.referencePO,
      plnRaw: formData.plnRaw,
      stsId: formData.stsId,
      quantity: Number(formData.generateQty),
    }

    try {
      const res = await backendGenerate.post('/generate', payload)
      setSerialNumbers(res.data?.data?.serialNumbers || [])
      toast.success(res.data?.message || 'Generate success!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate serial numbers')
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    if (serialNumbers.length === 0) {
      toast.error('No data to export!')
      return
    }

    const headers = ['No', 'Serial Number', 'PLN Raw', 'STS ID', 'Batch', 'Status']
    const rows = serialNumbers.map((row) => [
      row.id,
      row.serialCode,
      row.plnRaw,
      row.stsId,
      row.batch,
      row.status,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `generated_serial_numbers_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Download success!')
  }

  const columns = [
    { name: 'No', selector: (row, index) => index + 1, width: '70px' },
    { name: 'Serial Number', selector: (row) => row.serialCode, sortable: true },
    { name: 'PLN Raw', selector: (row) => row.plnRaw, sortable: true },
    { name: 'STS ID', selector: (row) => row.stsId, sortable: true },
    { name: 'Batch', selector: (row) => row.batch, sortable: true },
    { name: 'Status', selector: (row) => row.status, sortable: true },
  ]

  return (
    <>
      <CRow>
        <CCol md={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Generate PLN Serial</strong>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                {/* Reference AO/PO pakai Select */}
                <FormRow label="Reference AO / PO">
                  <Select
                    options={orders.map((o) => ({
                      value: o.order_number, // kirim order_number
                      label: o.order_number, // tampilkan order_number juga
                    }))}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        referencePO: selected ? selected.value : '', // ambil order_number (string)
                      }))
                    }
                    isClearable
                    placeholder="-- Select Assembly Order --"
                  />
                </FormRow>

                <FormRow label="PLN Raw Serial">
                  <CFormInput name="plnRaw" value={formData.plnRaw} readOnly />
                </FormRow>

                <FormRow label="STS ID">
                  <CFormInput name="stsId" value={formData.stsId} readOnly />
                </FormRow>

                <FormRow label="Total Quantity">
                  <CFormInput
                    type="number"
                    name="generateQty"
                    value={formData.generateQty}
                    onChange={handleInput}
                    required
                  />
                </FormRow>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <CButton color="primary" type="submit" disabled={loading}>
                    {loading ? 'Generating…' : 'Generate'}
                  </CButton>

                  {serialNumbers.length > 0 && (
                    <CButton color="success" onClick={downloadCSV} className="text-white">
                      Download CSV
                    </CButton>
                  )}
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {serialNumbers.length > 0 && (
        <CRow>
          <CCol md={12}>
            <CCard>
              <CCardHeader>
                <strong>Generated Serial Numbers</strong>
              </CCardHeader>
              <CCardBody>
                <DataTable
                  columns={columns}
                  data={serialNumbers}
                  progressPending={loading}
                  progressComponent={<CSpinner size="sm" />}
                  pagination
                  highlightOnHover
                  persistTableHead
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

/* Helper FormRow */
const FormRow = ({ label, children, labelCols = '3' }) => (
  <CRow className="mb-3">
    <CFormLabel className={`col-sm-${labelCols} col-form-label`}>{label}</CFormLabel>
    <CCol sm={12 - Number(labelCols)}>{children}</CCol>
  </CRow>
)

export default GeneratePlnSerial
