import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Tile from './Tile'
import ApiClient from './ApiClient'
import './Dashboard.css'

const Dashboard = ({ user, onLogout }) => {
  const [dashboardConfig, setDashboardConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const apiClient = new ApiClient()

  // Debug logging
  console.log('Dashboard rendered with user:', user)
  console.log('Loading state:', loading)
  console.log('Dashboard config:', dashboardConfig)

  // Function to load dashboard data
  const loadDashboardData = async (forceRefresh = false) => {
    if (!user || Object.keys(user).length === 0 || !user.email) {
      setLoading(false)
      return
    }

    try {
      if (forceRefresh) {
        setRefreshLoading(true)
      } else {
        setLoading(true)
      }

      // Send ping login to update last login timestamp
      const pingLogin = async () => {
        try {
          await apiClient.post('/pinglogin', { username: user.email })
          console.log('Ping login successful for user:', user.email)
        } catch (error) {
          console.error('Ping login failed:', error)
          // Don't block dashboard loading if ping login fails
        }
      }

      // Execute ping login
      await pingLogin()

      // Load dashboard configuration from backend API
      const response = await apiClient.post('/get_dashboard', { username: user.email })
      
      if (response && response.dashboard) {
        const dashboardData = response.dashboard
        
        // Check if dashboard has tiles and is finished
        if (dashboardData.tiles && dashboardData.tiles.length > 0 && dashboardData.finished_or_make_api_call) {
          setDashboardConfig({
            title: "NalFlo Dashboard", // Default title since backend doesn't provide one
            gridSize: dashboardData.gridSize,
            tiles: dashboardData.tiles
          })
        } else {
          console.warn(`Dashboard not ready for user: ${user.email}`, dashboardData)
          setDashboardConfig(null)
        }
      } else {
        console.warn(`No dashboard data received for user: ${user.email}`)
        setDashboardConfig(null)
      }
    } catch (error) {
      console.error('Error loading dashboard from API:', error)
      setDashboardConfig(null)
    } finally {
      setLoading(false)
      setRefreshLoading(false)
    }
  }

  // Expose refresh function globally for Settings component
  useEffect(() => {
    window.refreshDashboard = () => loadDashboardData(true)
  }, [user])

  useEffect(() => {
    loadDashboardData(false)
  }, [user])

  // Check for empty user first
  if (!user || Object.keys(user).length === 0) {
    return (
      <div className="dashboard">
        <Navbar user={user} onLogout={onLogout} />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Preparing dashboard...</p>
        </div>
      </div>
    )
  }

  if (loading || refreshLoading) {
    return (
      <div className="dashboard">
        <Navbar user={user} onLogout={onLogout} />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>{refreshLoading ? 'Refreshing your dashboard...' : 'Loading your dashboard...'}</p>
          {refreshLoading && (
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!user.email) {
    return (
      <div className="dashboard-error">
        <h2>Authentication required</h2>
        <p>Please log in to access your dashboard.</p>
      </div>
    )
  }

  if (!dashboardConfig) {
    return (
      <div className="dashboard">
        <Navbar user={user} onLogout={onLogout} />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Preparing dashboard...</p>
        </div>
      </div>
    )
  }

  const { title, gridSize, tiles } = dashboardConfig

  // Adaptive grid: flexible cell sizes that adapt to content
  const minCellSize = 160
  const maxCellSize = 300
  const gap = 10

  const gridStyle = {
    display: 'grid',
    gridAutoFlow: 'dense',
    gridTemplateColumns: `repeat(${gridSize.cols}, minmax(${minCellSize}px, ${maxCellSize}px))`,
    gridTemplateRows: `repeat(${gridSize.rows}, minmax(${minCellSize}px, auto))`,
    gap: `${gap}px`,
    width: 'fit-content',
    height: 'fit-content',
    position: 'relative',
    justifyContent: 'start',
    alignContent: 'start'
  }

  // Fallback for any unexpected state
  if (!tiles || tiles.length === 0) {
    return (
      <div className="dashboard">
        <Navbar user={user} onLogout={onLogout} />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Preparing dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <Navbar user={user} onLogout={onLogout} />
      
      

      <div className="dashboard-viewport">
        <div className="viewport-fade" />
        <div className="dashboard-grid" style={gridStyle}>
          {tiles.map(tile => (
            <Tile key={tile.id} tile={tile} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
