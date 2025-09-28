import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './APIEngine.css'

const APIEngine = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState('apis')
  const [apiData, setApiData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAPIs()
  }, [])

  // Refresh APIs when component becomes visible (e.g., when navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAPIs()
      }
    }

    const handleFocus = () => {
      fetchAPIs()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const fetchAPIs = async () => {
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
        const apis = Object.entries(data.APIs).map(([endpoint, apiInfo], index) => ({
          id: index + 1,
          endpoint: endpoint,
          description: apiInfo.description,
          method: 'POST', // All APIs are POST by default in your system
          status: 'Active'
        }))
        setApiData(apis)
      }
    } catch (error) {
      console.error('Error fetching APIs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Sample Files data
  const filesData = [
    {
      id: 1,
      name: 'user_controller.py',
      description: 'Main controller for user management operations',
      type: 'Python',
      size: '2.4 KB',
      lastModified: '2024-01-15'
    },
    {
      id: 2,
      name: 'auth_service.py',
      description: 'Authentication and authorization service',
      type: 'Python',
      size: '1.8 KB',
      lastModified: '2024-01-14'
    },
    {
      id: 3,
      name: 'database_models.py',
      description: 'SQLAlchemy database models and schemas',
      type: 'Python',
      size: '3.2 KB',
      lastModified: '2024-01-13'
    },
    {
      id: 4,
      name: 'api_routes.py',
      description: 'FastAPI route definitions and endpoints',
      type: 'Python',
      size: '2.1 KB',
      lastModified: '2024-01-12'
    },
    {
      id: 5,
      name: 'config.json',
      description: 'Application configuration settings',
      type: 'JSON',
      size: '0.8 KB',
      lastModified: '2024-01-11'
    },
    {
      id: 6,
      name: 'requirements.txt',
      description: 'Python package dependencies',
      type: 'Text',
      size: '0.5 KB',
      lastModified: '2024-01-10'
    },
    {
      id: 7,
      name: 'docker-compose.yml',
      description: 'Docker container orchestration configuration',
      type: 'YAML',
      size: '1.2 KB',
      lastModified: '2024-01-09'
    },
    {
      id: 8,
      name: 'README.md',
      description: 'Project documentation and setup instructions',
      type: 'Markdown',
      size: '4.1 KB',
      lastModified: '2024-01-08'
    }
  ]

  const handleViewAPI = (api) => {
    // Navigate to ViewAPI page with encoded endpoint
    const encodedEndpoint = encodeURIComponent(api.endpoint)
    navigate(`/view-api/${encodedEndpoint}`)
  }

  const handleViewFile = (file) => {
    // In a real application, this would open the file or show file details
    console.log('Viewing file:', file)
    alert(`Viewing file: ${file.name}\nType: ${file.type}\nSize: ${file.size}`)
  }

  return (
    <div className="api-engine">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="api-engine-content">
        <div className="api-engine-header">
          <h1>API Engine</h1>
          <p>Manage your APIs and files in one place</p>
        </div>

        <div className="api-engine-tabs">
          <button 
            className={`tab-button ${selectedTab === 'apis' ? 'active' : ''}`}
            onClick={() => setSelectedTab('apis')}
          >
            APIs
          </button>
          <button 
            className={`tab-button ${selectedTab === 'files' ? 'active' : ''}`}
            onClick={() => setSelectedTab('files')}
          >
            Files
          </button>
        </div>

        <div className="api-engine-table-container">
          {selectedTab === 'apis' ? (
            <div>
              <div className="table-header-actions">
                <button 
                  className="create-button"
                  onClick={() => navigate('/create-api')}
                >
                  Create New API
                </button>
              </div>
              {loading ? (
                <div className="loading-message">Loading APIs...</div>
              ) : (
                <table className="api-table">
                  <thead>
                    <tr>
                      <th>Endpoint</th>
                      <th>Description</th>
                      <th>View API</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiData.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="no-data">
                          No APIs found. Create your first API to get started!
                        </td>
                      </tr>
                    ) : (
                      apiData.map(api => (
                        <tr key={api.id}>
                          <td className="endpoint-cell">
                            <code>{api.endpoint}</code>
                          </td>
                          <td className="description-cell">
                            {api.description}
                          </td>
                          <td className="action-cell">
                            <button 
                              className="view-button"
                              onClick={() => handleViewAPI(api)}
                            >
                              View API
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div>
              <div className="table-header-actions">
                <button className="create-button">
                  Upload File
                </button>
              </div>
              <table className="api-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Description</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filesData.map(file => (
                    <tr key={file.id}>
                      <td className="filename-cell">
                        <code>{file.name}</code>
                      </td>
                      <td className="description-cell">
                        {file.description}
                      </td>
                      <td className="action-cell">
                        <button 
                          className="delete-button"
                          onClick={() => handleViewFile(file)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default APIEngine
