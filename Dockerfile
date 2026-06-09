# Stage 1: Build the Angular application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application for production
# Adjust "oncocare-hms" if your output path in angular.json is different
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the custom nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the builder stage
# IMPORTANT: Adjust the path "/app/dist/oncocare-hms/browser" based on your angular.json output path
COPY --from=builder /app/dist/oncocare-hms/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
