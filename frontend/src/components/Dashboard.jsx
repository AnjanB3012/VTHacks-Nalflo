import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Tile from './Tile'
import './Dashboard.css'

const Dashboard = ({ user, onLogout }) => {
  const [dashboardConfig, setDashboardConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  // Debug logging
  console.log('Dashboard rendered with user:', user)
  console.log('Loading state:', loading)
  console.log('Dashboard config:', dashboardConfig)

  useEffect(() => {
    // Load dashboard configuration for the specific user
    if (!user || Object.keys(user).length === 0 || !user.email) {
      setLoading(false)
      return
    }

    fetch('/dash_config.json')
      .then(response => response.json())
      .then(data => {
        // Get the user's specific dashboard configuration
        const userDashboard = data.dashboard[user.email]
        if (userDashboard && userDashboard.tiles && userDashboard.tiles.length > 0) {
          setDashboardConfig({
            title: data.dashboard.title,
            ...userDashboard
          })
        } else {
          console.warn(`No dashboard configuration found for user: ${user.email}`)
          // Fallback to a default configuration or show error
          setDashboardConfig(null)
        }
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading dashboard config:', error)
        setLoading(false)
      })
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

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar user={user} onLogout={onLogout} />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
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
