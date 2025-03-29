#!/bin/bash

# Change directory to the backend src folder
cd "$(dirname "$0")/src" || exit 1

# Create a backup folder for routes
mkdir -p backup/routes

# Copy all route files to the backup folder
cp -r routes/* backup/routes/

# Find all route files
route_files=$(find ./routes -name "*.routes.ts")

# Replace authMiddleware with authenticate in all route files
for file in $route_files; do
  echo "Processing $file..."
  
  # Replace the import statement
  sed -i 's/import { authMiddleware } from/import { authenticate } from/g' "$file"
  
  # Replace all occurrences of authMiddleware with authenticate
  sed -i 's/authMiddleware/authenticate/g' "$file"
done

# Find all controller test files that might be using authenticatedRequest
test_files=$(find ./controllers -name "*.test.ts")

# Copy all test files to the backup folder
mkdir -p backup/controllers
cp -r controllers/*.test.ts backup/controllers/

# Update the controller test files to use the correct token property
for file in $test_files; do
  echo "Processing test file $file..."
  # Update token generation to ensure it matches the expected format
  sed -i 's/userId: /id: /g' "$file"
done

echo "Done updating all files. Backups stored in backup/ directory."