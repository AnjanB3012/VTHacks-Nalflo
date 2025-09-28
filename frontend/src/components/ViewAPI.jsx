import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './ViewAPI.css'

const ViewAPI = ({ user, onLogout }) => {
  const { endpoint } = useParams()
  const navigate = useNavigate()
  const [apiData, setApiData] = useState(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchAPIData()
  }, [endpoint])

  const fetchAPIData = async () => {
    try {
      const response = await fetch('http://localhost:8000/get_apis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.email }),
      })

      if (response.ok) {
        const data = await response.json()
        const decodedEndpoint = decodeURIComponent(endpoint)
        const api = data.APIs[decodedEndpoint]
        
        if (api) {
          setApiData({
            endpoint: decodedEndpoint,
            description: api.description,
            body_format: api.body_format,
            function_name: api.function_name,
            code: api.code
          })
          setCode(api.code)
        } else {
          setError('API not found')
        }
      } else {
        setError('Failed to fetch API data')
      }
    } catch (err) {
      setError('Error fetching API data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCode = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // First save the server
      const saveResponse = await fetch('http://localhost:8000/save_server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save server')
      }

      // Then update the API code
      const updateResponse = await fetch('http://localhost:8000/update_api_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.email,
          endpoint: apiData.endpoint,
          code: code
        }),
      })

      if (updateResponse.ok) {
        setSuccess('Code updated successfully!')
        // Update local state
        setApiData(prev => ({ ...prev, code: code }))
      } else {
        const errorData = await updateResponse.json()
        setError(errorData.error || 'Failed to update code')
      }
    } catch (err) {
      setError('Error updating code: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveAPI = async () => {
    if (!window.confirm(`Are you sure you want to remove the API "${apiData.endpoint}"? This action cannot be undone.`)) {
      return
    }

    setRemoving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('http://localhost:8000/remove_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.email,
          endpoint: apiData.endpoint
        }),
      })

      if (response.ok) {
        setSuccess('API removed successfully!')
        // Navigate back to API Engine after a short delay
        setTimeout(() => {
          navigate('/api-engine')
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to remove API')
      }
    } catch (err) {
      setError('Error removing API: ' + err.message)
    } finally {
      setRemoving(false)
    }
  }

  const formatBodyFormat = (bodyFormat) => {
    if (typeof bodyFormat === 'object') {
      return JSON.stringify(bodyFormat, null, 2)
    }
    return bodyFormat || 'No body format specified'
  }

  if (loading) {
    return (
      <div className="view-api">
        <Navbar user={user} onLogout={onLogout} />
        <div className="view-api-content">
          <div className="loading">Loading API details...</div>
        </div>
      </div>
    )
  }

  if (!apiData) {
    return (
      <div className="view-api">
        <Navbar user={user} onLogout={onLogout} />
        <div className="view-api-content">
          <div className="error">API not found</div>
          <button onClick={() => navigate('/api-engine')} className="back-button">
            Back to API Engine
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="view-api">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="view-api-content">
        <div className="view-api-header">
          <button onClick={() => navigate('/api-engine')} className="back-button">
            ← Back to API Engine
          </button>
          <h1>View API</h1>
          <button 
            onClick={handleRemoveAPI}
            disabled={removing}
            className="remove-api-button"
          >
            {removing ? 'Removing...' : 'Remove API'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="api-details">
          <div className="api-info-section">
            <h2>API Information</h2>
            
            <div className="info-field">
              <label>Endpoint Name:</label>
              <div className="endpoint-display">
                <code>{apiData.endpoint}</code>
              </div>
            </div>

            <div className="info-field">
              <label>Description:</label>
              <div className="description-display">
                {apiData.description}
              </div>
            </div>

            <div className="info-field">
              <label>Required Body Format:</label>
              <div className="body-format-display">
                <pre>{formatBodyFormat(apiData.body_format)}</pre>
              </div>
            </div>
          </div>

          <div className="code-section">
            <div className="code-header">
              <h2>API Code</h2>
              <button 
                onClick={handleSaveCode}
                disabled={saving || code === apiData.code}
                className="save-button"
              >
                {saving ? 'Saving...' : 'Save Code'}
              </button>
            </div>
            
            <div className="code-editor">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your API code here..."
                className="code-textarea"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewAPI
