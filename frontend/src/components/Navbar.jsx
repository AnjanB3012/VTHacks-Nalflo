import { useNavigate, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>NalFlo</h2>
      </div>
      
      <div className="navbar-menu">
        <div 
          className={`navbar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <span>Dashboard</span>
        </div>
        <div 
          className={`navbar-item ${location.pathname === '/api-engine' ? 'active' : ''}`}
          onClick={() => navigate('/api-engine')}
        >
          <span>API Engine</span>
        </div>
        <div className="navbar-item">
          <span>Settings</span>
        </div>
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{user.name || user.username}</span>
          <span className="user-email">{user.email}</span>
        </div>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
