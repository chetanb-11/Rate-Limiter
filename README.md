# API Gateway & Distributed Rate Limiter

A production-ready API Gateway built with **Node.js** and **Express 5** that implements a distributed, route-specific rate-limiting system using **Redis**. This project securely proxies client traffic to downstream microservices while protecting the infrastructure from abuse, bursts, and DDoS attacks.

## 🚀 Key Features

* **Dual Rate-Limiting Algorithms**: Ships with two battle-tested strategies — **Fixed Window Counter** and **Sliding Window Log** — selectable at runtime via a single environment variable.
* **Strategy Factory Pattern**: A lightweight factory (`createRateLimiter`) dynamically instantiates the chosen algorithm with per-route thresholds, keeping the main application code clean and declarative.
* **Route-Specific Rate Limiting**: Distinct rate-limit thresholds for different endpoints (e.g., 10 req/min on `/api/secure` vs 100 req/min on `/api/public`).
* **Live Monitoring Endpoint**: `GET /api/stats` scans Redis in real-time and returns per-IP, per-route request counts and TTLs — useful for observability and debugging.
* **Standardized HTTP Headers**: Returns industry-standard headers on every response:
  * `X-RateLimit-Limit` — maximum allowed requests
  * `X-RateLimit-Remaining` — requests left in the current window
  * `X-RateLimit-Reset` — when the window resets
  * `Retry-After` — included on `429` responses (sliding window)
* **Production IP Extraction**: Configured with `trust proxy` and utilizes Express's `req.ip` to accurately extract client IPs behind load balancers or reverse proxies.
* **Fault Tolerant (Fail-Open)**: If the Redis cluster goes down, the API Gateway continues forwarding traffic instead of crashing — wrapped in robust error handling.
* **Reverse Proxy**: Transparently proxies rate-limited traffic to downstream APIs via `http-proxy-middleware`.

## 🏗️ System Architecture

```
Client Request
      │
      ▼
┌─────────────┐
│  Express 5  │──── GET /api/stats ──▶ Redis SCAN ──▶ JSON response
│  Gateway    │
└─────┬───────┘
      │
      ▼
┌─────────────────────────────┐
│  createRateLimiter Factory  │◀── RATE_LIMIT_STRATEGY env var
│  (fixed | sliding)          │
└─────┬───────────────────────┘
      │
      ├── Fixed Window ──▶ Redis INCR + EXPIRE
      │
      └── Sliding Window ──▶ Redis ZADD + ZRANGEBYSCORE + ZCARD
              │
              ▼
        ┌───────────┐
        │   Redis   │
        └───────────┘
              │
              ▼
   Under limit? ──▶ Proxy to target API
   Over limit?  ──▶ 429 Too Many Requests
```

### Algorithm Comparison

| | Fixed Window | Sliding Window Log |
|---|---|---|
| **Redis Structure** | Simple counter (`INCR`) | Sorted Set (`ZADD` / `ZCARD`) |
| **Accuracy** | Can allow 2× burst at window edges | Precise — no edge-burst problem |
| **Memory** | O(1) per key | O(N) per key (stores each timestamp) |
| **Best for** | High-throughput, simple use cases | Strict enforcement, abuse-sensitive routes |

## 📁 Project Structure

```
rate_limiting/
├── config/
│   └── redisClient.js            # Redis client connection & setup
├── middleware/
│   ├── createRateLimiter.js      # Strategy factory (fixed vs sliding)
│   ├── fixedWindowLimiter.js     # Fixed window counter algorithm
│   ├── slidingWindowLimiter.js   # Sliding window log algorithm
│   ├── ratestats.js              # GET /api/stats handler
│   └── proxyMiddleware.js        # Reverse proxy to target API
├── index.js                      # Express app entry point
├── .env                          # Environment variables (not committed)
└── package.json
```

## 🚦 API Endpoints

| Method | Endpoint | Rate Limit | Description |
|---|---|---|---|
| `GET` | `/` | None | Health check |
| `GET` | `/api/stats` | None | Live rate-limit stats from Redis |
| `*` | `/api/secure/*` | 10 req / 60s | Proxied to target API (strict) |
| `*` | `/api/public/*` | 100 req / 60s | Proxied to target API (generous) |

## 🛠️ Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js v5
* **In-Memory Store**: Redis (Cloud)
* **Core Libraries**:
  * `http-proxy-middleware` — High-performance API routing and proxying
  * `redis` — Official Node.js Redis client
  * `cors` — Cross-Origin Resource Sharing
  * `dotenv` — Environment variable management

## 🚦 Getting Started

### Prerequisites

* **Node.js** (v18+) and **npm** installed
* Access to a **Redis** instance (local or cloud-hosted, e.g. Redis Cloud, Upstash)
* **nodemon** installed globally (`npm i -g nodemon`) or as a dev dependency

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chetanb-11/Rate-Limiter.git
   cd Rate-Limiter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```env
   REDIS_USERNAME=your_redis_username
   REDIS_PASSWORD=your_redis_password
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   RATE_LIMIT_STRATEGY=sliding
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`.

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `REDIS_USERNAME` | ✅ | — | Redis authentication username |
| `REDIS_PASSWORD` | ✅ | — | Redis authentication password |
| `REDIS_HOST` | ✅ | — | Redis server hostname |
| `REDIS_PORT` | ✅ | — | Redis server port |
| `RATE_LIMIT_STRATEGY` | ❌ | `sliding` | Algorithm to use: `sliding` or `fixed` |

## 📊 Response Headers

Every proxied request includes rate-limit metadata:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 60
```

When a client exceeds the limit, they receive:

```json
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "error": "Too Many Requests",
  "message": "Limit of 10 requests per 60s exceeded",
  "retryAfter": 60
}
```