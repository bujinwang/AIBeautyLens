# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy the backend application and shared library
COPY backend ./backend
COPY shared ./shared

# Set working directory to the backend application
WORKDIR /app/backend

# Install backend dependencies, including the local shared library
RUN npm install ../shared && npm install

# Build the NestJS application
RUN npm run build

# Prune development dependencies for a smaller production image
RUN npm prune --production

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD [ "npm", "run", "start:prod" ]