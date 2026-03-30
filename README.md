# API Gateway & Distributed Rate Limiter

A lightweight API Gateway built with Node.js and Express that implements a distributed rate-limiting system using Redis. This project is designed to intercept incoming client requests, check their rate limits against a fast, in-memory Redis store, and securely proxy allowed requests to downstream services.

## 🚀 Features

* **Reverse Proxy / API Gateway**: Intercepts traffic and forwards it to downstream APIs using `http-proxy-middleware`.
* **Distributed Rate Limiting**: Utilizes a Redis cloud database to track requests across multiple server instances.
* **Fixed Window Counter Algorithm**: Limits users based on their IP address to a maximum of 5 requests per 20-second window.
* **Automated Expiration**: Leverages Redis TTL (Time-To-Live) to automatically clear rate limit counters without relying on Node.js global timers.
* **Environment Configuration**: Secures sensitive database credentials using `.env` variables.

## 🏗️ System Architecture

1. **Client** makes an HTTP request to the Gateway.
2. **Gateway** extracts the Client's IP address.
3. **Redis** checks the current request count for that IP.
   - *If under limit:* The request count is incremented, and traffic is proxied to the target API.
   - *If over limit:* The connection is immediately rejected with a `429 Too Many Requests` status code.

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: Redis (Cloud)
* **Key Packages**: 
  * `redis`: Node.js Redis client.
  * `http-proxy-middleware`: For routing and proxying API requests.
  * `ip`: For reliable client IP extraction.

## 🚦 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your machine. You will also need a Redis instance (local or cloud-hosted).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chetanb-11/Rate-Limiter.git
   cd Rate-Limiter
