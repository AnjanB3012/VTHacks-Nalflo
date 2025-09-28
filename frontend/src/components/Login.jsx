import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Demo credentials
  const demoCredentials = {
    username: 'demo@nalflo.com',
    password: 'demo123'
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (formData.username === demoCredentials.username && 
        formData.password === demoCredentials.password) {
      onLogin({
        username: formData.username,
        name: 'Demo User',
        email: 'demo@nalflo.com'
      })
      navigate('/dashboard')
    } else {
      setError('Invalid username or password. Use: demo@nalflo.com / demo123')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back to <span className="brand-name">NalFlo</span></h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary">
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up here
            </Link>
          </p>
          <div className="demo-credentials">
            <p><strong>Demo Credentials:</strong></p>
            <p>Username: demo@nalflo.com</p>
            <p>Password: demo123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
