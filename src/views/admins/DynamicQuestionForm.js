/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormCheck,
  CRow,
  CAlert,
} from '@coreui/react'

const DynamicQuestionForm = () => {
  const [questions, setQuestions] = useState([])
  const [counter, setCounter] = useState(1)
  const [errorMessage, setErrorMessage] = useState('')

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: counter,
        text: '',
        answer: null,
      },
    ])
    setCounter((prev) => prev + 1)
    setErrorMessage('')
  }

  const handleRemoveQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const handleQuestionChange = (id, field, value) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const hasEmpty = questions.some((q) => !q.text.trim() || q.answer === null)

    if (hasEmpty) {
      setErrorMessage('Semua pertanyaan harus diisi dan memiliki jawaban.')
      return
    }

    setErrorMessage('')
    console.log('Submitted Questions:', questions)
    alert('Data berhasil dikirim. Cek console.')
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Form Tambah Pertanyaan Dinamis</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="border rounded p-3 mb-3 position-relative"
                  style={{ background: '#f8f9fa' }}
                >
                  <CFormLabel>Pertanyaan #{index + 1}</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="Tuliskan pertanyaan"
                    value={q.text}
                    onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                    className="mb-3"
                  />

                  <div className="d-flex gap-3">
                    <CFormCheck
                      type="radio"
                      name={`answer-${q.id}`}
                      value="true"
                      label="Ya"
                      checked={q.answer === true}
                      onChange={() => handleQuestionChange(q.id, 'answer', true)}
                    />
                    <CFormCheck
                      type="radio"
                      name={`answer-${q.id}`}
                      value="false"
                      label="Tidak"
                      checked={q.answer === false}
                      onChange={() => handleQuestionChange(q.id, 'answer', false)}
                    />
                  </div>

                  <CButton
                    color="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-2"
                    onClick={() => handleRemoveQuestion(q.id)}
                  >
                    Hapus
                  </CButton>
                </div>
              ))}

              {errorMessage && (
                <CAlert color="danger" className="mt-3">
                  {errorMessage}
                </CAlert>
              )}

              <div className="d-flex justify-content-between">
                <CButton color="secondary" onClick={handleAddQuestion}>
                  + Tambah Pertanyaan
                </CButton>
                <CButton color="primary" type="submit">
                  Submit Semua Pertanyaan
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default DynamicQuestionForm
