# Production-ready Node.js container
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose default port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Run with non-root node user for container security
USER node

# Start server
CMD ["node", "src/server.js"]
