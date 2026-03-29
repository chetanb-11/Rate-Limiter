# Rate Limiter (Node.js + Redis)

A simple Express-based rate limiter that uses Redis to track request counts with key expiry.

## What this project does

- Starts an HTTP server on `localhost:3000`
- Applies a global middleware to count requests in Redis
- Limits traffic to **5 requests in 5 seconds**
- Returns:
  - `200 OK` with `ok` when under limit
  - `429 Too Many Requests` with `{"message":"too many request"}` when limit is exceeded

## Tech stack

- Node.js
- Express
- Redis (`redis` npm package)
- `ip` package

## Project structure

- `/home/runner/work/Rate-Limiter/Rate-Limiter/index.js` — Express app and rate-limit middleware
- `/home/runner/work/Rate-Limiter/Rate-Limiter/redis.js` — Redis client connection setup

## How rate limiting works

Current configuration in `index.js`:

- `MAX_ALLOWED_REQ = 5`
- `MAX_TIME = 5` seconds

Flow:

1. Middleware reads IP value (`ip.address()`).
2. Increments Redis key for that IP using `INCR`.
3. If it is the first request (`count === 1`), sets TTL to 5 seconds.
4. If count is greater than 5, responds with HTTP 429.
5. Otherwise request continues to route handler.

## Setup and run

> This repository currently contains `package-lock.json` but does not include a `package.json`.  
> You will need a valid `package.json` (with start script/dependencies) to install and run via npm.

General steps:

1. Install dependencies:
   - `npm install`
2. Start server:
   - `node index.js`
3. Test endpoint:
   - `GET http://localhost:3000/`

## Example behavior

If you send more than 5 requests within 5 seconds, you should receive:

```json
{"message":"too many request"}
```

with status code `429`.

## Current limitations / notes

- The middleware uses `ip.address()`, which reads the server machine IP, not the client request IP.
- Redis connection settings are hardcoded in `redis.js` instead of environment variables.
- There are no automated tests configured in the repository right now.
- There are no npm scripts available at the moment because `package.json` is missing.

## Suggested next improvements

- Use `req.ip` (and trusted proxy settings if needed) for true per-client limiting.
- Move Redis host/port/password to environment variables.
- Add `package.json` with scripts (`start`, `dev`, `test`).
- Add tests for rate-limit behavior.
