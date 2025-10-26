import React, { useState, useRef } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    setError(null)
    const f = e.target.files && e.target.files[0]
    if (f && f.type !== 'application/pdf') {
      setError('Please select a PDF file.')
      setFile(null)
      return
    }
    setFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setStatus(null)

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    if (!file) {
      setError('Please select a PDF to upload.')
      return
    }

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('file', file)

    try {
      setUploading(true)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Upload failed (${res.status})`)
      }
      const json = await res.json().catch(() => ({ message: 'Upload successful' }))
      setStatus(json.message || 'Upload successful')
      setEmail('')
      setPassword('')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div id="root" className="container">
        <div className="brand">
          <h1>MediScan</h1>
          <p className="read-the-docs">Securely upload medical PDFs for processing</p>
        </div>

        <div className="upload-card card" role="region" aria-labelledby="upload-title">
          <h2 id="upload-title">Upload Medical PDF</h2>

          <form className="upload-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </label>

            <label className="file-label">
              Medical PDF
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                required
              />
              <div className="file-info">{file ? file.name : 'No file selected'}</div>
            </label>

            <div className="actions">
              <button type="submit" className="primary" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>

            {status && <div className="status success" role="status">{status}</div>}
            {error && <div className="status error" role="alert">{error}</div>}
          </form>
        </div>

        <footer className="notes">
          <small>Files are sent to the backend endpoint POST /api/upload as multipart/form-data.</small>
        </footer>
      </div>
    </>
  )
}

export default App
