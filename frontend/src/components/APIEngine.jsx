import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './APIEngine.css'

const APIEngine = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState('apis')

  // Sample API data
  const apiData = [
    {
      id: 1,
      endpoint: '/api/v1/users',
      description: 'Retrieve all users in the system',
      method: 'GET',
      status: 'Active'
    },
    {
      id: 2,
      endpoint: '/api/v1/users/{id}',
      description: 'Get a specific user by ID',
      method: 'GET',
      status: 'Active'
    },
    {
      id: 3,
      endpoint: '/api/v1/users',
      description: 'Create a new user account',
      method: 'POST',
      status: 'Active'
    },
    {
      id: 4,
      endpoint: '/api/v1/users/{id}',
      description: 'Update user information',
      method: 'PUT',
      status: 'Active'
    },
    {
      id: 5,
      endpoint: '/api/v1/users/{id}',
      description: 'Delete a user account',
      method: 'DELETE',
      status: 'Active'
    },
    {
      id: 6,
      endpoint: '/api/v1/auth/login',
      description: 'Authenticate user and get access token',
      method: 'POST',
      status: 'Active'
    },
    {
      id: 7,
      endpoint: '/api/v1/auth/logout',
      description: 'Invalidate user session',
      method: 'POST',
      status: 'Active'
    },
    {
      id: 8,
      endpoint: '/api/v1/dashboard/data',
      description: 'Get dashboard analytics data',
      method: 'GET',
      status: 'Active'
    }
  ]

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
    // In a real application, this would open a modal or navigate to API details
    console.log('Viewing API:', api)
    alert(`Viewing API: ${api.endpoint}\nMethod: ${api.method}\nDescription: ${api.description}`)
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
              <table className="api-table">
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    <th>Description</th>
                    <th>View API</th>
                  </tr>
                </thead>
                <tbody>
                  {apiData.map(api => (
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
                  ))}
                </tbody>
              </table>
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
