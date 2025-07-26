const { client, isEdgeDBConfigured } = require('./db');

// Save user data to EdgeDB
async function saveUser(kiteUserId, accessToken, publicToken, refreshToken = null) {
  // If EdgeDB is not configured, return early
  if (!isEdgeDBConfigured || !client) {
    console.log('EdgeDB not configured, skipping saveUser');
    return null;
  }
  
  try {
    const query = `
      INSERT User {
        user_id := <str>$user_id,
        kite_user_id := <str>$kite_user_id,
        access_token := <str>$access_token,
        public_token := <str>$public_token,
        refresh_token := <str>$refresh_token,
        last_login := datetime_current()
      }
      UNLESS CONFLICT ON .user_id
      ELSE (
        UPDATE User SET {
          access_token := <str>$access_token,
          public_token := <str>$public_token,
          refresh_token := <str>$refresh_token,
          last_login := datetime_current()
        }
      )
    `;
    
    const result = await client.querySingle(query, {
      user_id: kiteUserId,
      kite_user_id: kiteUserId,
      access_token: accessToken,
      public_token: publicToken || '',
      refresh_token: refreshToken || ''
    });
    
    return result;
  } catch (error) {
    console.error('Error saving user to EdgeDB:', error.message);
    return null;
  }
}

// Get user data from EdgeDB
async function getUser(kiteUserId) {
  // If EdgeDB is not configured, return null
  if (!isEdgeDBConfigured || !client) {
    console.log('EdgeDB not configured, skipping getUser');
    return null;
  }
  
  try {
    const query = `
      SELECT User {
        user_id,
        kite_user_id,
        access_token,
        public_token,
        refresh_token,
        token_expiry,
        created_at,
        last_login,
        profile_data
      }
      FILTER .user_id = <str>$user_id
    `;
    
    const user = await client.querySingle(query, {
      user_id: kiteUserId
    });
    
    return user;
  } catch (error) {
    console.error('Error getting user from EdgeDB:', error.message);
    return null;
  }
}

// Save user holdings to EdgeDB
async function saveHoldings(kiteUserId, holdings) {
  // If EdgeDB is not configured, return early
  if (!isEdgeDBConfigured || !client) {
    console.log('EdgeDB not configured, skipping saveHoldings');
    return true;
  }
  
  try {
    // First, delete existing holdings for this user
    await client.execute(`
      DELETE Holding
      FILTER .user_id = <str>$user_id
    `, {
      user_id: kiteUserId
    });
    
    // Then insert new holdings
    for (const holding of holdings) {
      await client.execute(`
        INSERT Holding {
          user_id := <str>$user_id,
          instrument_token := <int64>$instrument_token,
          exchange := <str>$exchange,
          tradingsymbol := <str>$tradingsymbol,
          quantity := <int32>$quantity,
          average_price := <decimal>$average_price
        }
      `, {
        user_id: kiteUserId,
        instrument_token: holding.instrument_token,
        exchange: holding.exchange,
        tradingsymbol: holding.tradingsymbol,
        quantity: holding.quantity,
        average_price: holding.average_price
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error saving holdings to EdgeDB:', error.message);
    return false;
  }
}

// Get user holdings from EdgeDB
async function getHoldings(kiteUserId) {
  // If EdgeDB is not configured, return empty array
  if (!isEdgeDBConfigured || !client) {
    console.log('EdgeDB not configured, skipping getHoldings');
    return [];
  }
  
  try {
    const query = `
      SELECT Holding {
        instrument_token,
        exchange,
        tradingsymbol,
        quantity,
        average_price,
        last_updated
      }
      FILTER .user_id = <str>$user_id
      ORDER BY .tradingsymbol
    `;
    
    const holdings = await client.query(query, {
      user_id: kiteUserId
    });
    
    return holdings;
  } catch (error) {
    console.error('Error getting holdings from EdgeDB:', error.message);
    return [];
  }
}

// Save session data to EdgeDB
async function saveSession(sessionId, kiteUserId) {
  // If EdgeDB is not configured, return early
  if (!isEdgeDBConfigured || !client) {
    console.log('EdgeDB not configured, skipping saveSession');
    return null;
  }
  
  try {
    const query = `
      INSERT Session {
        session_id := <str>$session_id,
        user_id := <str>$user_id,
        kite_user_id := <str>$kite_user_id,
        expires_at := datetime_current() + <duration>'24 hours'
      }
      UNLESS CONFLICT ON .session_id
      ELSE (
        UPDATE Session SET {
          user_id := <str>$user_id,
          kite_user_id := <str>$kite_user_id,
          expires_at := datetime_current() + <duration>'24 hours'
        }
      )
    `;
    
    const result = await client.querySingle(query, {
      session_id: sessionId,
      user_id: kiteUserId,
      kite_user_id: kiteUserId
    });
    
    return result;
  } catch (error) {
    console.error('Error saving session to EdgeDB:', error.message);
    return null;
  }
}

// Get session data from EdgeDB
async function getSession(sessionId) {
  // If EdgeDB is not configured, return null
  if (!isEdgeDBConfigured || !client) {
    console.log('EdgeDB not configured, skipping getSession');
    return null;
  }
  
  try {
    const query = `
      SELECT Session {
        session_id,
        user_id,
        kite_user_id,
        created_at,
        expires_at
      }
      FILTER .session_id = <str>$session_id
      AND .expires_at > datetime_current()
    `;
    
    const session = await client.querySingle(query, {
      session_id: sessionId
    });
    
    return session;
  } catch (error) {
    console.error('Error getting session from EdgeDB:', error.message);
    return null;
  }
}

// Delete session from EdgeDB
async function deleteSession(sessionId) {
  // If EdgeDB is not configured, return early
  if (!isEdgeDBConfigured || !client) {
    console.log('EdgeDB not configured, skipping deleteSession');
    return null;
  }
  
  try {
    const query = `
      DELETE Session
      FILTER .session_id = <str>$session_id
    `;
    
    const result = await client.execute(query, {
      session_id: sessionId
    });
    
    return result;
  } catch (error) {
    console.error('Error deleting session from EdgeDB:', error.message);
    return null;
  }
}

module.exports = {
  saveUser,
  getUser,
  saveHoldings,
  getHoldings,
  saveSession,
  getSession,
  deleteSession
};
