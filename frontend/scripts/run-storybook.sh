#\!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Starting Storybook for Fluxori-V2 Frontend${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if build flag is provided
if [[ "$*" == *--build* ]]; then
  echo -e "${YELLOW}Building Storybook for static deployment...${NC}"
  npm run build-storybook
  
  echo -e "${GREEN}✓ Storybook build complete\!${NC}"
  echo -e "${YELLOW}Static build can be found in the 'storybook-static' directory.${NC}"
else
  echo -e "${YELLOW}Starting Storybook development server...${NC}"
  echo -e "${YELLOW}Navigate to http://localhost:6006 to view the component documentation.${NC}"
  npm run storybook
fi

echo -e "${BLUE}=====================================${NC}"
