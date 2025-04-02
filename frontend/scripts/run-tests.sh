#\!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Running Tests for Fluxori-V2 Frontend${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if --coverage flag is provided
if [[ "$*" == *--coverage* ]]; then
  echo -e "${YELLOW}Running tests with coverage...${NC}"
  npm test -- --coverage $@
else
  echo -e "${YELLOW}Running tests...${NC}"
  npm test $@
fi

# Check exit status
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed\!${NC}"
else
  echo -e "${RED}✗ Some tests failed. Please check the output above for details.${NC}"
  exit 1
fi

# If coverage is generated, provide a summary
if [[ "$*" == *--coverage* ]] && [ -d "coverage" ]; then
  echo -e "${BLUE}=====================================${NC}"
  echo -e "${BLUE}  Coverage Summary${NC}"
  echo -e "${BLUE}=====================================${NC}"
  
  # Try to extract coverage summary
  if [ -f "coverage/coverage-summary.json" ]; then
    echo -e "${YELLOW}Statement coverage:${NC} $(jq '.total.statements.pct' coverage/coverage-summary.json)%"
    echo -e "${YELLOW}Branch coverage:${NC} $(jq '.total.branches.pct' coverage/coverage-summary.json)%"
    echo -e "${YELLOW}Function coverage:${NC} $(jq '.total.functions.pct' coverage/coverage-summary.json)%"
    echo -e "${YELLOW}Line coverage:${NC} $(jq '.total.lines.pct' coverage/coverage-summary.json)%"
  else
    echo -e "${YELLOW}Coverage report generated. Open the coverage/lcov-report/index.html file in your browser to view it.${NC}"
  fi
fi

echo -e "${BLUE}=====================================${NC}"
