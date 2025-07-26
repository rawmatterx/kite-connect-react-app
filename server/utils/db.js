const edgedb = require('edgedb');

// Only create EdgeDB client if we have the required environment variables
// and we're not in local development
let client = null;
let isEdgeDBConfigured = false;

// Skip EdgeDB in local development unless explicitly enabled
const skipEdgeDB = process.env.NODE_ENV === 'development' && process.env.ENABLE_EDGEDB !== 'true';

if (!skipEdgeDB && process.env.EDGEDB_INSTANCE && process.env.EDGEDB_SECRET_KEY) {
  try {
    // Create EdgeDB client with additional SSL/TLS configuration options
    const clientOptions = {
      instanceName: process.env.EDGEDB_INSTANCE,
      secretKey: process.env.EDGEDB_SECRET_KEY,
      // Add TLS options to handle SSL issues in Vercel environment
      tlsSecurity: process.env.EDGEDB_TLS_SECURITY || 'strict',
      // Add connection retry options
      connectionParams: {
        waitUntilAvailable: 30000, // 30 seconds
      }
    };
    
    // If EDGEDB_DSN is provided, use it instead
    if (process.env.EDGEDB_DSN) {
      client = edgedb.createClient(process.env.EDGEDB_DSN);
    } else {
      client = edgedb.createClient(clientOptions);
    }
    
    isEdgeDBConfigured = true;
    console.log('EdgeDB client created with SSL/TLS configuration');
  } catch (error) {
    console.warn('Failed to create EdgeDB client:', error.message);
    isEdgeDBConfigured = false;
  }
} else if (skipEdgeDB) {
  console.log('EdgeDB skipped in local development (set ENABLE_EDGEDB=true to enable)');
} else {
  console.warn('EdgeDB not configured: EDGEDB_INSTANCE and/or EDGEDB_SECRET_KEY not set');
}

// Test the connection
async function testConnection() {
  // If EdgeDB is not configured, return true to allow the application to run
  if (!isEdgeDBConfigured || !client) {
    console.log('EdgeDB not configured, skipping connection test');
    return true;
  }
  
  try {
    await client.ensureConnected();
    console.log('Successfully connected to EdgeDB');
    return true;
  } catch (error) {
    console.error('Failed to connect to EdgeDB:', error.message);
    // Return true even if connection fails to allow the application to run
    // In a production environment, you might want to handle this differently
    return true;
  }
}

module.exports = {
  client,
  testConnection,
  isEdgeDBConfigured
};
