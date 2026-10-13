import React, { useState, useEffect, useRef } from 'react'
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
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CFormTextarea,
  CFormCheck,
} from '@coreui/react'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { backendProduct, backendAssembly } from '../../../api/axios'

/** Row helper sederhana untuk label + field */
const FormRow = ({ label, children }) => (
  <CRow className="mb-3">
    <CFormLabel className="col-sm-3 col-form-label">{label}</CFormLabel>
    <CCol sm={9}>{children}</CCol>
  </CRow>
)

const OrderForm = () => {
  const [productsData, setProductsData] = useState([])
  const [plnOrders, setPlnOrders] = useState([])

  const [selectedParent, setSelectedParent] = useState(null)

  const [formData, setFormData] = useState({
    pln_order_id: '', // 🔹 tambahan
    product_id: '',
    qty: 1,
    order_number: '',
    notes: '',
    items: [], // array of selected component IDs (termasuk required)
  })

  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingPlnOrders, setLoadingPlnOrders] = useState(false)

  // ref utk set indeterminate di "Select All"
  const selectAllRef = useRef(null)

  // fetch PLN Orders
  useEffect(() => {
    const fetchPlnOrders = async () => {
      setLoadingPlnOrders(true)
      try {
        const res = await backendAssembly.get('/pln-orders')
        setPlnOrders(res.data?.data || [])
      } catch (err) {
        console.error('Fetch PLN Orders error:', err)
        toast.error(err.response?.data?.message || 'Failed to load PLN orders')
      } finally {
        setLoadingPlnOrders(false)
      }
    }
    fetchPlnOrders()
  }, [])

  // fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true)
      try {
        const res = await backendProduct.get('/parents')
        setProductsData(res.data?.data || [])
      } catch (err) {
        console.error('Fetch product error:', err)
        toast.error(err.response?.data?.message || 'Failed to load products')
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  const getOptionLabel = (p) => `${p.sap_code} - ${p.name}`

  /** Saat pilih parent product */
  const handleSelectProduct = (opt) => {
    const parent = productsData.find((p) => p.id === opt?.value) || null
    setSelectedParent(parent)

    // auto centang semua required component
    const requiredIds = parent?.components?.filter((c) => c.required).map((c) => c.product.id) || []

    setFormData((prev) => ({
      ...prev,
      product_id: opt ? opt.value : '',
      items: requiredIds,
    }))
  }

  /** Toggle komponen per-baris */
  const toggleItem = (componentId) => {
    const comp = selectedParent?.components?.find((c) => c.product.id === componentId)
    if (!comp) return

    // block jika required
    if (comp.required) return

    setFormData((prev) => {
      const exists = prev.items.includes(componentId)
      return {
        ...prev,
        items: exists ? prev.items.filter((i) => i !== componentId) : [...prev.items, componentId],
      }
    })
  }

  /** helper: id2 untuk required & optional */
  const requiredIds =
    selectedParent?.components?.filter((c) => c.required).map((c) => c.product.id) || []
  const optionalIds =
    selectedParent?.components?.filter((c) => !c.required).map((c) => c.product.id) || []

  const allOptionalSelected =
    optionalIds.length > 0 && optionalIds.every((id) => formData.items.includes(id))
  const anyOptionalSelected =
    optionalIds.length > 0 && optionalIds.some((id) => formData.items.includes(id))

  // set indeterminate untuk Select All checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = anyOptionalSelected && !allOptionalSelected
    }
  }, [anyOptionalSelected, allOptionalSelected])

  /** Select All hanya untuk optional */
  const handleSelectAllChange = (e) => {
    const checked = e.target.checked
    setFormData((prev) => {
      if (checked) {
        // pilih semua optional + pertahankan required
        const merged = Array.from(new Set([...prev.items, ...optionalIds]))
        return { ...prev, items: merged }
      }
      // uncheck semua optional, tapi pertahankan required
      return { ...prev, items: requiredIds }
    })
  }

  const handleInput = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.product_id || formData.qty <= 0 || !formData.order_number) {
      toast.warn('Please fill all fields correctly.')
      return
    }
    if (!selectedParent) {
      toast.warn('Please select a product.')
      return
    }
    if (formData.items.length === 0) {
      toast.warn('Please select at least one item.')
      return
    }

    setLoadingSubmit(true)
    try {
      // Build items payload dari komponen yang dipilih
      const itemsPayload = (selectedParent.components || [])
        .filter((c) => formData.items.includes(c.product.id))
        .map((c) => ({
          product_id: c.product.id,
          qty_request: (Number(c.quantity) || 0) * Number(formData.qty),
          required: !!c.required,
          is_serialized: !!c.product.is_serialize,
        }))

      const payload = {
        order_number: formData.order_number,
        pln_order_id: formData.pln_order_id || null,
        product_id: formData.product_id,
        quantity: Number(formData.qty),
        status: 'pending',
        request_by: 1,
        notes: formData.notes || '',
        assembly_order_items: itemsPayload,
      }

      console.log('Payload : ', payload)
      const res = await backendAssembly.post('/assembly-orders/with-items', payload)
      toast.success(res.data?.message || 'Order submitted successfully!')
      // // (opsional) reset form:

      setSelectedParent(null)
      setFormData({
        pln_order_id: '',
        product_id: '',
        qty: 1,
        order_number: '',
        notes: '',
        items: [],
      })
    } catch (err) {
      console.error('Submit error:', err)
      toast.error(err.response?.data?.message || 'Failed to submit order.')
    } finally {
      setLoadingSubmit(false)
    }
  }

  const selectedValue =
    selectedParent != null
      ? { value: selectedParent.id, label: getOptionLabel(selectedParent) }
      : null

  return (
    <CRow>
      <CCol md={12} className="mx-auto">
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Order</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              {/* PLN Order */}
              <FormRow label="PLN Order">
                {loadingPlnOrders ? (
                  <div className="d-flex align-items-center gap-2">
                    <CSpinner size="sm" /> Loading PLN orders…
                  </div>
                ) : (
                  <Select
                    options={plnOrders.map((o) => ({
                      value: o.id,
                      label: `${o.order_number} (Qty: ${o.remaining_quantity})`,
                    }))}
                    value={
                      formData.pln_order_id
                        ? (() => {
                            const selected = plnOrders.find((o) => o.id === formData.pln_order_id)
                            return selected
                              ? {
                                  value: selected.id,
                                  label: `${selected.order_number} (Qty: ${selected.remaining_quantity})`,
                                }
                              : null
                          })()
                        : null
                    }
                    onChange={(opt) => {
                      const selected = plnOrders.find((o) => o.id === opt?.value)
                      setFormData((prev) => ({
                        ...prev,
                        pln_order_id: opt ? opt.value : '',
                        qty: selected ? selected.remaining_quantity : '', // ⬅️ ambil dari remaining_quantity
                      }))
                    }}
                    isClearable
                    placeholder="Select PLN Order"
                  />
                )}
              </FormRow>

              {/* AO/PO */}
              <FormRow label="AO">
                <CFormInput
                  type="text"
                  name="order_number"
                  value={formData.order_number}
                  onChange={(e) => {
                    const rawValue = e.target.value
                    const value = rawValue.replace(/\D/g, '')
                    if (rawValue !== value) {
                      toast.warn('AO can only contain numbers')
                    }
                    setFormData((prev) => ({ ...prev, order_number: value }))
                  }}
                  placeholder="AO"
                  required
                />
              </FormRow>

              {/* Product */}
              <FormRow label="Product">
                {loadingProducts ? (
                  <div className="d-flex align-items-center gap-2">
                    <CSpinner size="sm" /> Loading products…
                  </div>
                ) : (
                  <Select
                    options={productsData.map((p) => ({ value: p.id, label: getOptionLabel(p) }))}
                    value={selectedValue}
                    onChange={handleSelectProduct}
                    isClearable
                    placeholder="Select Product"
                  />
                )}
              </FormRow>

              {/* Qty */}
              <FormRow label="Qty">
                <CFormInput
                  type="number"
                  min={1}
                  name="qty"
                  value={formData.qty}
                  onChange={(e) => {
                    // ambil nilai input user
                    let value = Number(e.target.value.replace(/\D/g, '')) || 0

                    // nilai maksimum sesuai qty PLN order
                    const maxVal = formData.pln_order_id
                      ? plnOrders.find((o) => o.id === formData.pln_order_id)?.remaining_quantity ||
                        formData.qty
                      : formData.qty

                    // batasi nilainya agar tidak lebih besar dari maksimum
                    if (value > maxVal) {
                      value = maxVal
                      toast.info(`Maximum remaining_quantity is ${maxVal}`)
                    }
                    if (value < 1) value = 1

                    setFormData((prev) => ({
                      ...prev,
                      qty: value,
                    }))
                  }}
                  required
                />
              </FormRow>

              {/* Notes */}
              <FormRow label="Notes">
                <CFormTextarea
                  rows={3}
                  name="notes"
                  onChange={handleInput}
                  value={formData.notes}
                  placeholder="Write any additional notes"
                />
              </FormRow>

              {/* Tabel Items (BOM) */}
              {selectedParent && selectedParent.components?.length > 0 && (
                <CRow className="mb-3">
                  <CCol md={12}>
                    <h5 className="mb-3">Items</h5>
                    <CTable striped bordered hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col" className="align-middle">
                            #
                          </CTableHeaderCell>
                          <CTableHeaderCell scope="col" className="align-middle">
                            Code
                          </CTableHeaderCell>
                          <CTableHeaderCell scope="col" className="align-middle">
                            Name
                          </CTableHeaderCell>
                          <CTableHeaderCell scope="col" className="align-middle">
                            BOM Qty
                          </CTableHeaderCell>
                          <CTableHeaderCell scope="col" className="align-middle">
                            Total Qty
                          </CTableHeaderCell>
                          <CTableHeaderCell scope="col" className="align-middle">
                            Required
                          </CTableHeaderCell>
                          <CTableHeaderCell scope="col" className="align-middle">
                            <div className="d-flex align-items-center gap-2">
                              <CFormCheck
                                ref={selectAllRef}
                                checked={allOptionalSelected}
                                onChange={handleSelectAllChange}
                                disabled={optionalIds.length === 0}
                              />
                              <span>Select All</span>
                            </div>
                          </CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {selectedParent.components.map((c, idx) => {
                          const id = c.product.id
                          const baseQty = Number(c.quantity) || 0
                          const totalQty = baseQty * Number(formData.qty || 0)
                          const isRequired = !!c.required
                          const checked = formData.items.includes(id)

                          return (
                            <CTableRow key={id}>
                              <CTableHeaderCell scope="row" className="align-middle">
                                {idx + 1}
                              </CTableHeaderCell>
                              <CTableDataCell className="align-middle">
                                {c.product.sap_code}
                              </CTableDataCell>
                              <CTableDataCell className="align-middle">
                                {c.product.name}
                              </CTableDataCell>
                              <CTableDataCell className="align-middle">{baseQty}</CTableDataCell>
                              <CTableDataCell className="align-middle">{totalQty}</CTableDataCell>
                              <CTableDataCell className="align-middle">
                                {isRequired ? 'Yes' : 'No'}
                              </CTableDataCell>
                              <CTableDataCell className="align-middle">
                                <CFormCheck
                                  checked={checked}
                                  onChange={() => toggleItem(id)}
                                  disabled={isRequired}
                                />
                              </CTableDataCell>
                            </CTableRow>
                          )
                        })}
                      </CTableBody>
                    </CTable>
                  </CCol>
                </CRow>
              )}

              {/* Submit */}
              <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
                <CButton color="primary" type="submit" disabled={loadingSubmit}>
                  {loadingSubmit ? (
                    <>
                      <CSpinner size="sm" /> Saving…
                    </>
                  ) : (
                    'Save'
                  )}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default OrderForm
