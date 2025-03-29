#!/bin/bash

# Usage: ./run-single-test.sh "test description"

if [ -z "$1" ]; then
  echo "Usage: $0 \"test description\""
  exit 1
fi

# Set NODE_ENV to test
export NODE_ENV=test

# Set a known JWT secret for tests
export JWT_SECRET=test-secret

# Run the test with the provided description
npx jest -t "$1" --verbose --detectOpenHandles