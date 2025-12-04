# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80
# Expose port 80

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy nginx configuration

COPY --from=build /app/dist /usr/share/nginx/html
# Copy built assets from build stage

FROM nginx:alpine
# Production stage

RUN npm run build
# Build the application

COPY . .
# Copy source code

RUN npm ci
# Install dependencies

COPY package*.json ./
# Copy package files

WORKDIR /app

FROM node:20-alpine AS build

