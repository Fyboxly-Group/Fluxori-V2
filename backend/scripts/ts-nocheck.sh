#!/bin/bash

# Function to add @ts-nocheck to the top of TypeScript files
add_ts_nocheck() {
  local file=$1
  
  # Check if file exists
  if [ ! -f "$file" ]; then
    echo "File not found: $file"
    return 1
  fi
  
  # Check if already has @ts-nocheck
  if grep -q "@ts-nocheck" "$file"; then
    echo "File already has @ts-nocheck: $file"
    return 0
  fi
  
  # Add @ts-nocheck to the top of the file
  sed -i '1s/^/\/\/ @ts-nocheck\n/' "$file"
  echo "Added @ts-nocheck to $file"
}

# Usage: ts-nocheck path/to/file.ts
if [ $# -eq 0 ]; then
  echo "Usage: ts-nocheck path/to/file.ts"
  exit 1
fi

add_ts_nocheck "$1"
