# API Gateway & Distributed Rate Limiter

A production-ready API Gateway built with Node.js and Express that implements a distributed, route-specific rate-limiting system using Redis. This project securely proxies client traffic to downstream microservices while protecting the infrastructure from abuse, bursts, and DDoS attacks.

## 🚀 Key Features & Updates

* **Route-Specific Rate Limiting**: Implemented a dynamic factory pattern allowing distinct rate-limit thresholds for different endpoints (e.g., stricter limits on `/api/secure` vs `/api/public`).
* **Modular Architecture**: Refactored the core logic by decoupling the reverse proxy (`proxyMiddleware.js`) and the rate limiter (`rateLimiter.js`) into isolated, reusable middleware components.
* **Standardized HTTP Headers**: Enhances API consumer experience by returning industry-standard tracking headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`).
* **Production IP Extraction**: Configured `trust proxy` and utilizes Express's `req.ip` to accurately extract client IPs behind load balancers or reverse proxies.
* **Fault Tolerant (Fail-Open)**: Includes a fail-open mechanism wrapped in robust error handling. If the Redis cluster goes down, the API Gateway continues forwarding traffic instead of crashing.
* **High-Performance Logging**: Integrated `pino` for asynchronous, JSON-structured logging out-of-the-box.

## 🏗️ System Architecture

1. **Client Request**: A client sends an HTTP request to an API Gateway route.
2. **IP & Route Identification**: The Gateway extracts the client IP and the requested base URL to construct a unique namespaced Redis key (e.g., `rate_limit:/api/secure:192.168.1.1`).
3. **Redis Evaluation (Fixed Window)**:
   - *If under limit:* The request counter increments, TTL is updated if it's a new window, and traffic is securely proxied to the target API.
   - *If over limit:* The connection is rejected with a `429 Too Many Requests` status code.

## 🛠️ Tech Stack

* **Backend Environment**: Node.js, Express.js
* **In-Memory Store**: Redis (Cloud)
* **Core Libraries**: 
  * `http-proxy-middleware`: For high-performance API routing and proxying.
  * `redis`: Official Node.js Redis client.
  * `pino`: Ultra-fast Node.js logger.
  * `dotenv`: Environment variable management.

## 🚦 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed. You will also need access to a Redis instance (local or cloud-hosted).

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/chetanb-11/Rate-Limiter.git](https://github.com/chetanb-11/Rate-Limiter.git)
   cd Rate-Limiter