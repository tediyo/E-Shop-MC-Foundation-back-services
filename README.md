# E-commerce Backend Microservices

A scalable, production-ready e-commerce backend built with Node.js, Express, TypeScript, and MongoDB using microservices architecture.

## 🏗️ Architecture Overview

```
ecommerce-backend/
├── services/                    # Microservices
│   ├── auth-service/           # Authentication & Authorization
│   ├── catalog-service/        # Product Catalog Management
│   ├── inventory-service/      # Stock & Inventory Management
│   ├── cart-service/           # Shopping Cart Management
│   ├── order-service/          # Order Processing & Workflow
│   ├── payment-service/        # Payment Processing
│   ├── shipping-service/       # Shipping & Delivery
│   ├── search-service/         # Search & Recommendations
│   ├── review-service/         # Product Reviews & Ratings
│   └── notification-service/   # Email, SMS, Push Notifications
├── shared/                     # Shared Libraries
│   ├── types/                  # TypeScript Interfaces
│   ├── utils/                  # Common Utilities
│   ├── constants/              # Shared Constants
│   └── schemas/                # Validation Schemas
├── infrastructure/             # Infrastructure Configuration
├── tools/                      # Build & Deployment Tools
└── docs/                       # Documentation
```

## 🚀 Features

- **Microservices Architecture**: Scalable, maintainable, and independently deployable services
- **TypeScript**: Full type safety and modern JavaScript features
- **MongoDB**: Flexible document database with Mongoose ODM
- **Redis**: High-performance caching and session management
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions for different user types
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Input Validation**: Comprehensive request validation using Joi
- **Structured Logging**: Winston-based logging with multiple transports
- **Health Checks**: Service health monitoring endpoints
- **Docker Support**: Containerized deployment with Docker Compose
- **API Versioning**: RESTful APIs with version control

## 🛠️ Tech Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB 7.0
- **Cache**: Redis 7.2
- **Message Broker**: RabbitMQ 3.12
- **Search Engine**: Elasticsearch 8.11
- **Object Storage**: MinIO

### Development Tools
- **Package Manager**: npm
- **Build Tool**: TypeScript Compiler
- **Linting**: ESLint + TypeScript ESLint
- **Testing**: Jest + Supertest
- **Hot Reload**: Nodemon
- **Process Manager**: PM2 (production)

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- MongoDB (or Docker)
- Redis (or Docker)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ecommerce-backend
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Environment Setup
```bash
# Copy environment files for each service
cp services/auth-service/env.example services/auth-service/.env
# Repeat for other services...
```

### 4. Start Infrastructure Services
```bash
docker-compose up -d mongodb redis elasticsearch rabbitmq minio
```

### 5. Start Development Servers
```bash
# Start all services
npm run dev

# Or start individual services
npm run dev:auth
npm run dev:catalog
# etc...
```

## 🐳 Docker Development

### Start All Services
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

### Rebuild Services
```bash
docker-compose build --no-cache
```

## 📚 API Documentation

### Authentication Service (`/api/v1/auth`)

#### Public Endpoints
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh-token` - Refresh access token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `POST /verify-email` - Verify email address
- `POST /resend-verification` - Resend verification email

#### Protected Endpoints
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /enable-2fa` - Enable two-factor authentication
- `POST /verify-2fa` - Verify 2FA code
- `POST /disable-2fa` - Disable two-factor authentication

#### Admin Endpoints
- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get user by ID (admin only)
- `PUT /users/:id` - Update user (admin only)
- `DELETE /users/:id` - Delete user (super admin only)

### User Management Service (`/api/v1/users`)

#### Profile Management
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /preferences` - Update user preferences
- `PUT /address` - Update user address
- `POST /profile-picture` - Upload profile picture
- `DELETE /profile-picture` - Delete profile picture

#### Security & Authentication
- `PUT /password` - Change password
- `POST /2fa/setup` - Setup two-factor authentication
- `POST /2fa/verify` - Verify 2FA code
- `POST /2fa/disable` - Disable 2FA
- `POST /phone/verify` - Verify phone number
- `POST /email/verify` - Verify email address

## 🔧 Configuration

### Environment Variables

#### Auth Service
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://admin:password123@localhost:27017/ecommerce
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
```

#### Database Configuration
```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/ecommerce
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://admin:password123@localhost:5672
ELASTICSEARCH_URL=http://localhost:9200
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests for Specific Service
```bash
npm run test:auth
npm run test:catalog
# etc...
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## 📦 Building

### Build All Services
```bash
npm run build
```

### Build Specific Service
```bash
npm run build:auth
npm run build:catalog
# etc...
```

## 🚀 Deployment

### Production Build
```bash
npm run build:all
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment
```bash
kubectl apply -f infrastructure/k8s/
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- `GET /health` - Service health status
- `GET /metrics` - Prometheus metrics (if configured)

### Logging
- **Console**: Colored, formatted logs for development
- **File**: JSON logs for production and debugging
- **Levels**: error, warn, info, http, debug

### Metrics
- Request/response times
- Error rates
- Database connection status
- Redis connection status
- Service uptime

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: Protection against abuse
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Request sanitization
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-based Access**: Granular permissions
- **Session Management**: Redis-based sessions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🔄 Roadmap

### Phase 1: Core Services ✅
- [x] Authentication Service
- [ ] Catalog Service
- [ ] Inventory Service
- [ ] Cart Service
- [ ] Order Service

### Phase 2: Advanced Features
- [ ] Payment Service
- [ ] Shipping Service
- [ ] Search Service
- [ ] Review Service
- [ ] Notification Service

### Phase 3: Enterprise Features
- [ ] Analytics Service
- [ ] Reporting Service
- [ ] Audit Service
- [ ] Backup Service
- [ ] Monitoring Service

---

**Happy Coding! 🚀**
