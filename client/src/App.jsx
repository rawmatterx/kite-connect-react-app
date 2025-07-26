import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [profile, setProfile] = useState(null)
  const [holdings, setHoldings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if user is already logged in
  useEffect(() => {
    fetchProfile()
  }, [])

  const handleLogin = () => {
    window.location.href = '/api/login'
  }

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else if (response.status === 401) {
        // Not logged in
        setProfile(null)
      } else {
        throw new Error('Failed to fetch profile')
      }
    } catch (err) {
      setError(err.message)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchHoldings = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/holdings')
      if (response.ok) {
        const data = await response.json()
        setHoldings(data)
      } else {
        throw new Error('Failed to fetch holdings')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    // Clear session on backend
    fetch('/api/logout', { method: 'POST' })
      .then(() => {
        setProfile(null)
        setHoldings(null)
      })
  }

  if (loading) {
    return <div className="app">Loading...</div>
  }

  return (
    <div className="app">
      <h1>Kite Connect v3 Login Flow</h1>
      
      {error && <div className="error">Error: {error}</div>}
      
      {!profile ? (
        <div className="login-section">
          <p>Welcome! Please log in with your Zerodha account.</p>
          <button onClick={handleLogin} className="login-button">
            Login with Zerodha
          </button>
        </div>
      ) : (
        <div className="dashboard">
          <div className="user-info">
            <h2>Welcome, {profile.user_name || profile.user_id}</h2>
            <p>User ID: {profile.user_id}</p>
            <p>Email: {profile.email || 'N/A'}</p>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
          
          <div className="actions">
            <button onClick={fetchProfile} className="action-button">
              Refresh Profile
            </button>
            <button onClick={fetchHoldings} className="action-button">
              View Holdings
            </button>
          </div>
          
          {holdings && (
            <div className="holdings">
              <h3>Holdings</h3>
              {holdings.length > 0 ? (
                <ul>
                  {holdings.map((holding, index) => (
                    <li key={index}>
                      {holding.tradingsymbol} - Qty: {holding.quantity}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No holdings found</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
