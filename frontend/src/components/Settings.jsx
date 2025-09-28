import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import ApiClient from './ApiClient'
import './Settings.css'

const Settings = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const apiClient = new ApiClient()
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  // Load user settings from API on component mount
  useEffect(() => {
    loadUserSettings()
  }, [user])

  const loadUserSettings = async () => {
    if (!user || !user.email) return
    
    try {
      setIsLoading(true)
      const response = await apiClient.post('/get_user_dash_config', { username: user.email })
      
      if (response.dash_config) {
        setUserInput(response.dash_config)
      }
    } catch (error) {
      console.error('Error loading user settings:', error)
      // Fallback to localStorage
      const savedInput = localStorage.getItem('nalflo_user_input')
      if (savedInput) {
        setUserInput(savedInput)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !user.email) {
      setSaveStatus('User not authenticated. Please log in again.')
      setTimeout(() => setSaveStatus(''), 3000)
      return
    }

    try {
      setIsLoading(true)
      
      // Save to API
      await apiClient.post('/update_user_dash_config', { 
        username: user.email, 
        user_input: userInput 
      })
      
      // Also save to localStorage as backup
      localStorage.setItem('nalflo_user_input', userInput)
      
      setSaveStatus('Settings saved successfully!')
      setTimeout(() => setSaveStatus(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('Error saving settings. Please try again.')
      setTimeout(() => setSaveStatus(''), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForceRefresh = async () => {
    if (!user || !user.email) {
      setSaveStatus('User not authenticated. Please log in again.')
      setTimeout(() => setSaveStatus(''), 3000)
      return
    }

    setIsLoading(true)
    try {
      // Use the existing API endpoint for force refresh
      await apiClient.post('/force_refresh_dashboard', { 
        username: user.email 
      })
      
      setSaveStatus('Dashboard refreshed successfully!')
      
      // Also trigger the global refresh function if available
      if (window.refreshDashboard) {
        await window.refreshDashboard()
      }
    } catch (error) {
      console.error('Error refreshing dashboard:', error)
      if (error.message.includes('timed out')) {
        setSaveStatus('Request timed out after 2 minutes.')
      } else {
        setSaveStatus('Error refreshing dashboard. Please try again.')
      }
    } finally {
      setIsLoading(false)
      setTimeout(() => setSaveStatus(''), 5000)
    }
  }

  return (
    <div className="settings">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your preferences and refresh your dashboard data.</p>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <label htmlFor="user-input" className="settings-label">
              User Input
            </label>
            <textarea
              id="user-input"
              className="settings-textarea"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter your custom input here..."
              rows={8}
            />
            <div className="settings-actions">
              <button 
                className="settings-save-btn"
                onClick={handleSave}
                disabled={isLoading}
              >
                Save Settings
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h3>Dashboard Management</h3>
            <p>Force refresh your dashboard to get the latest data.</p>
            <button 
              className="settings-refresh-btn"
              onClick={handleForceRefresh}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Force Refresh Dashboard'}
            </button>
          </div>

          {isLoading && (
            <div className="loading-container">
              <div className="loading-bar">
                <div className="loading-progress"></div>
              </div>
              <p className="loading-text">Refreshing dashboard data... This may take up to 2 minutes.</p>
            </div>
          )}

          {saveStatus && (
            <div className={`status-message ${saveStatus.includes('Error') ? 'error' : 'success'}`}>
              {saveStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
