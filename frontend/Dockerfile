# Use Node.js 18 Alpine as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Use the fixed page and config files
RUN cp src/app/page-fixed.tsx src/app/page.tsx
RUN cp next.config.js.fixed next.config.js

# Build the application
RUN npm run build

# Expose the port the app will run on
ENV PORT=8080
EXPOSE 8080

# Start the application
CMD ["npm", "start"]