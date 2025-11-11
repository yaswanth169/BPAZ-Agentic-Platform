# BPAZ-Agentic-Platform - Frontend Docker Compose Deployment

This project allows you to deploy only the frontend using Docker Compose.

## Services

- **client**: React frontend application (Port: 3000)

## Setup and Run

### 1. Development Environment

```bash
# Start the frontend service
 docker-compose up

# Run in the background
 docker-compose up -d

# Start only the client service
 docker-compose up client
```

### 2. Production Environment

```bash
# Run with a production build
 docker-compose -f docker-compose.yml up --build

# Run with a production build in the background
 docker-compose -f docker-compose.yml up -d --build
```

### 3. Stopping Services

```bash
# Stop all services
 docker-compose down

# Remove volumes as well
 docker-compose down -v
```

## Environment Variables

### Frontend (Client)
- `VITE_API_BASE_URL`: API base URL (default: http://localhost:8000)
- `VITE_API_VERSION`: API version (default: /api/v1)
- `VITE_NODE_ENV`: Node environment (default: development)
- `VITE_ENABLE_LOGGING`: Toggle logging on/off (default: true)

## Access URLs

- **Frontend**: http://localhost:3000

## Development Tips

### Hot Reload
Code changes are automatically reflected in the development environment.

### View Logs
```bash
# Tail the client service logs
 docker-compose logs -f client
```

### Attach to the Container
```bash
# Open a shell inside the client container
 docker-compose exec client sh
```

## Troubleshooting

### Port Conflicts
If port 3000 is already in use, change the port mapping in `docker-compose.yml`.

### Volume Issues
```bash
# Clean up volumes
 docker-compose down -v
 docker volume prune
```

### Build Issues
```bash
# Clear cache and rebuild
 docker-compose build --no-cache
```

## Note

This configuration deploys only the frontend. If your backend API runs as a separate service, update the `VITE_API_BASE_URL` environment variable to point to your backend URL. 