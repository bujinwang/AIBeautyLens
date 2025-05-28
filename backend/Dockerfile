# ---- Base Stage ----
FROM --platform=linux/amd64 node:20-slim AS base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS dependencies
WORKDIR /app

# Copy root package.json and yarn.lock (and any workspace config files if necessary)
COPY package.json yarn.lock ./
# Copy backend package.json
COPY backend/package.json ./backend/
# Copy shared package.json (if it has its own dependencies to install for the backend)
COPY shared/package.json ./shared/

# Install all workspace dependencies using Yarn
# This leverages Yarn workspaces if configured in the root package.json
RUN yarn install --frozen-lockfile

# ---- Builder Stage ----
FROM base AS builder
WORKDIR /app

# Copy all dependencies from the dependencies stage (including node_modules)
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/backend/node_modules ./backend/node_modules
# Copy application code
COPY . .

# Generate Prisma Client for the backend
# Ensure Prisma schema is available
WORKDIR /app/backend
RUN npx prisma generate

# Build the backend application
RUN yarn workspace @aibeautylens/backend build

# Prune development dependencies using Yarn workspaces
# This creates a production-ready node_modules structure in a separate directory
# Note: Yarn's approach to pruning in workspaces can be complex.
# An alternative is to copy only the production node_modules from the 'dependencies' stage
# after a production-only install, or rely on the multi-stage copy below.
# For simplicity here, we'll copy the built app and rely on a fresh prod install in the final stage.

# ---- Production Stage ----
FROM base AS production
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy root package.json and yarn.lock
COPY package.json yarn.lock ./
# Copy backend package.json
COPY backend/package.json ./backend/
# Copy shared package.json
COPY shared/package.json ./shared/

# Install only production dependencies for all workspaces
RUN yarn install --frozen-lockfile --production

# Copy built application from builder stage
COPY --from=builder /app/backend/dist ./backend/dist
# Copy Prisma schema for runtime (if needed, e.g., for migrations or certain client features)
COPY --from=builder /app/backend/prisma ./backend/prisma
# Copy shared library's built output if it's used at runtime by the backend
# This depends on how 'shared' is built and consumed. If it's just types, it might not be needed here.
# If it has runtime JS files, they need to be copied. Assuming 'shared' is built to a 'dist' folder:
# COPY --from=builder /app/shared/dist ./shared/dist


# Expose port
EXPOSE 3000

# Command to run the application
WORKDIR /app/backend
# The start:prod script is "node dist/main"
CMD [ "node", "dist/main.js" ]
