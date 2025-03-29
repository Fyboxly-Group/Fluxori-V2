#!/bin/bash

# Simple test runner script for Fluxori-V2 backend
# Ensures consistent environment variables for tests

# Set environment variables
export NODE_ENV=test
export JWT_SECRET=test-secret

# Run tests with provided arguments or all tests if no arguments
if [ $# -eq 0 ]; then
  echo "Running all tests..."
  npx jest
else
  echo "Running tests with arguments: $@"
  npx jest "$@"
fi