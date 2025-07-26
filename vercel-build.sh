#!/bin/bash

# Install client dependencies
cd client
npm install

# Build the client application
npm run build

cd ..

# Continue with the normal build process
echo "Client build completed successfully"
