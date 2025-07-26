const edgedb = require('edgedb');

// Only create EdgeDB client if we have the required environment variables
// and we're not in local development
let client = null;
let isEdgeDBConfigured = false;

// Skip EdgeDB in local development unless explicitly enabled
const skipEdgeDB = process.env.NODE_ENV === 'development' && process.env.ENABLE_EDGEDB !== 'true';

// Check for different EdgeDB connection methods
  const hasInstanceAndSecret = process.env.EDGEDB_INSTANCE && process.env.EDGEDB_SECRET_KEY;
  const hasDSN = process.env.EDGEDB_DSN;
  
  if (!skipEdgeDB && (hasInstanceAndSecret || hasDSN)) {
    try {
      if (hasDSN) {
        // Use DSN connection string
        console.log('Creating EdgeDB client with DSN');
        client = edgedb.createClient(process.env.EDGEDB_DSN);
      } else if (hasInstanceAndSecret) {
        // Use instance name and secret key
        console.log('Creating EdgeDB client with instance name and secret key');
        const clientOptions = {
          instanceName: process.env.EDGEDB_INSTANCE,
          secretKey: process.env.EDGEDB_SECRET_KEY,
          // Add TLS options to handle SSL issues in Vercel environment
          tlsSecurity: process.env.EDGEDB_TLS_SECURITY || 'strict',
          // Add connection retry options
          waitUntilAvailable: process.env.EDGEDB_WAIT_UNTIL_AVAILABLE || 30000, // 30 seconds default
        };
        client = edgedb.createClient(clientOptions);
      }
      
      isEdgeDBConfigured = true;
      console.log('EdgeDB client created successfully');
    } catch (error) {
      console.warn('Failed to create EdgeDB client:', error.message);
      console.warn('Environment variables present:');
      console.warn('  EDGEDB_INSTANCE:', !!process.env.EDGEDB_INSTANCE);
      console.warn('  EDGEDB_SECRET_KEY:', !!process.env.EDGEDB_SECRET_KEY);
      console.warn('  EDGEDB_DSN:', !!process.env.EDGEDB_DSN);
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
