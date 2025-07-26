const crypto = require("crypto")
const dotenv = require("dotenv")

// EdgeDB utilities
const {
  saveUser,
  getUser,
  saveHoldings,
  getHoldingsFromDB,
  saveSession,
  getSession,
  deleteSession,
  saveRequestToken,
} = require("../utils/userData")

// Database connection
dotenv.config()

// Kite Connect configuration
const API_KEY = process.env.KITE_API_KEY
const API_SECRET = process.env.KITE_API_SECRET
const REDIRECT_URI = process.env.KITE_REDIRECT_URI || "https://kite-connect-react-app.vercel.app/api/kite-redirect"

// Kite Connect API base URL
const KITE_API_BASE = "https://api.kite.trade"

// Generate checksum for token exchange
const generateChecksum = (apiKey, requestToken, apiSecret) => {
  const data = apiKey + requestToken + apiSecret
  return crypto.createHash("sha256").update(data).digest("hex")
}

// Make authenticated API request
const makeKiteRequest = async (endpoint, accessToken, method = "GET", data = null) => {
  const url = `${KITE_API_BASE}${endpoint}`
  const headers = {
    "X-Kite-Version": "3",
    Authorization: `token ${API_KEY}:${accessToken}`,
    "Content-Type": "application/x-www-form-urlencoded",
  }

  const options = {
    method,
    headers,
  }

  if (data && method === "POST") {
    const formData = new URLSearchParams()
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key])
    })
    options.body = formData
  }

  const response = await fetch(url, options)
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || `API request failed: ${response.status}`)
  }

  return result
}

// Login endpoint - redirects to Zerodha login with v=3
const login = (req, res) => {
  try {
    // Generate the official Kite Connect login URL with v=3
    const loginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${API_KEY}`

    console.log(`Redirecting user to Zerodha login: ${loginUrl}`)
    res.redirect(loginUrl)
  } catch (error) {
    console.error("Error generating login URL:", error)
    res.status(500).json({ error: error.message })
  }
}

// Kite callback endpoint - handles redirect from Zerodha
const kiteCallback = async (req, res) => {
  try {
    // Extract request_token and status from query parameters
    const request_token = req.query.request_token
    const status = req.query.status

    console.log(`Received callback with request_token: ${request_token}, status: ${status}`)

    // Validate the response
    if (status !== "success" || !request_token) {
      console.error(`Login failed. Status: ${status}, Request token: ${request_token}`)
      return res.status(400).send("Login failed. Invalid status or missing request_token.")
    }

    // Save request token to EdgeDB for security and traceability
    // We'll save it with a placeholder user_id for now, will update after we get the actual user_id
    await saveRequestToken(request_token, "pending")

    // Generate checksum for token exchange
    const checksum = generateChecksum(API_KEY, request_token, API_SECRET)

    // Exchange request_token for access_token using official API
    const tokenData = {
      api_key: API_KEY,
      request_token: request_token,
      checksum: checksum,
    }

    const tokenResponse = await fetch(`${KITE_API_BASE}/session/token`, {
      method: "POST",
      headers: {
        "X-Kite-Version": "3",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(tokenData),
    })

    const sessionData = await tokenResponse.json()

    if (!tokenResponse.ok || sessionData.status !== "success") {
      throw new Error(sessionData.message || "Token exchange failed")
    }

    const userData = sessionData.data

    // Store access_token in session
    req.session.access_token = userData.access_token
    req.session.public_token = userData.public_token
    req.session.user_id = userData.user_id

    // Save user data to EdgeDB
    await saveUser(userData.user_id, userData.access_token, userData.public_token, userData.refresh_token || null)

    // Update the request token in EdgeDB with the actual user ID
    await saveRequestToken(request_token, userData.user_id)

    // Save session to EdgeDB
    if (req.sessionID) {
      await saveSession(req.sessionID, userData.user_id)
    }

    console.log("Successfully obtained access_token and saved to EdgeDB")

    // For development, show success page
    if (process.env.NODE_ENV === "development") {
      return res.send(`
        <h1>Login Successful!</h1>
        <p>User ID: ${userData.user_id}</p>
        <p>User Name: ${userData.user_name}</p>
        <p>Email: ${userData.email}</p>
        <p>Broker: ${userData.broker}</p>
        <p><a href="/">Go to Dashboard</a></p>
      `)
    }

    // For production, redirect to frontend
    res.redirect("/")
  } catch (error) {
    console.error("Error in kiteCallback:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get user profile using official API
const getProfile = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.access_token) {
      return res.status(401).json({ error: "Not authenticated" })
    }

    // Fetch user profile using official API
    const profileResponse = await makeKiteRequest("/user/profile", req.session.access_token)

    if (profileResponse.status === "success") {
      res.json(profileResponse.data)
    } else {
      throw new Error("Failed to fetch profile")
    }
  } catch (error) {
    console.error("Error fetching profile:", error)

    // If token is invalid, clear session
    if (error.message.includes("Invalid token") || error.message.includes("401")) {
      req.session.destroy()
      return res.status(401).json({ error: "Session expired. Please login again." })
    }

    res.status(500).json({ error: error.message })
  }
}

// Get user holdings using official API
const getUserHoldings = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.access_token) {
      return res.status(401).json({ error: "Not authenticated" })
    }

    // Fetch user holdings using official API
    const holdingsResponse = await makeKiteRequest("/portfolio/holdings", req.session.access_token)

    if (holdingsResponse.status === "success") {
      const holdings = holdingsResponse.data

      // Save holdings to EdgeDB if user_id is available
      if (req.session.user_id && holdings && holdings.length > 0) {
        await saveHoldings(req.session.user_id, holdings)
      }

      res.json(holdings)
    } else {
      throw new Error("Failed to fetch holdings")
    }
  } catch (error) {
    console.error("Error fetching holdings:", error)

    // If token is invalid, clear session
    if (error.message.includes("Invalid token") || error.message.includes("401")) {
      req.session.destroy()
      return res.status(401).json({ error: "Session expired. Please login again." })
    }

    res.status(500).json({ error: error.message })
  }
}

// Get user margins using official API
const getMargins = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.access_token) {
      return res.status(401).json({ error: "Not authenticated" })
    }

    const segment = req.params.segment || "" // equity or commodity
    const endpoint = segment ? `/user/margins/${segment}` : "/user/margins"

    // Fetch user margins using official API
    const marginsResponse = await makeKiteRequest(endpoint, req.session.access_token)

    if (marginsResponse.status === "success") {
      res.json(marginsResponse.data)
    } else {
      throw new Error("Failed to fetch margins")
    }
  } catch (error) {
    console.error("Error fetching margins:", error)

    // If token is invalid, clear session
    if (error.message.includes("Invalid token") || error.message.includes("401")) {
      req.session.destroy()
      return res.status(401).json({ error: "Session expired. Please login again." })
    }

    res.status(500).json({ error: error.message })
  }
}

// Logout using official API
const logout = async (req, res) => {
  try {
    // If we have an access token, invalidate it on Kite's servers
    if (req.session.access_token) {
      try {
        const logoutUrl = `${KITE_API_BASE}/session/token?api_key=${API_KEY}&access_token=${req.session.access_token}`

        await fetch(logoutUrl, {
          method: "DELETE",
          headers: {
            "X-Kite-Version": "3",
          },
        })

        console.log("Successfully invalidated access token on Kite servers")
      } catch (error) {
        console.error("Error invalidating token on Kite servers:", error)
        // Continue with local logout even if remote logout fails
      }
    }

    // Delete session from EdgeDB if it exists
    if (req.sessionID) {
      await deleteSession(req.sessionID)
    }

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err)
        return res.status(500).json({ error: "Failed to logout" })
      }

      // Clear the session cookie
      res.clearCookie("connect.sid")

      // Send success response
      res.json({ message: "Logged out successfully" })
    })
  } catch (error) {
    console.error("Error during logout:", error)
    res.status(500).json({ error: "Failed to logout" })
  }
}

module.exports = {
  login,
  kiteCallback,
  getProfile,
  getUserHoldings,
  getMargins,
  logout,
}
