# Base image (Node.js 22)
FROM node:22.14.0

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Build TypeScript
RUN npm run build

# Environment
ENV NODE_ENV=production

# Expose port
EXPOSE 4000

# Start server
CMD ["npm", "run", "start"]

