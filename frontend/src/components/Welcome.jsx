import { Link } from 'react-router-dom'
import './Welcome.css'

const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1 className="welcome-title">
            Welcome to <span className="brand-name">NalFlo</span>
          </h1>
          <p className="welcome-subtitle">
            Your intelligent dashboard for seamless workflow management
          </p>
        </div>
        
        <div className="welcome-features">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics Dashboard</h3>
            <p>Real-time insights and data visualization</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Optimized performance for productivity</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3>Customizable</h3>
            <p>Tailor your workspace to your needs</p>
          </div>
        </div>

        <div className="welcome-actions">
          <Link to="/login" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/signup" className="btn btn-secondary">
            Create Account
          </Link>
        </div>
      </div>
      
      <div className="welcome-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
    </div>
  )
}

export default Welcome
