/**
 * In-memory sliding-window rate limiter middleware.
 * Protects endpoints from burst traffic and financial exhaustion.
 */
function createRateLimiter({
    windowMs = 60 * 1000,
    max = 30,
    message = "Too many requests, please try again later."
} = {}) {
    const hits = new Map();

    const interval = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of hits.entries()) {
            if (now > record.resetTime) {
                hits.delete(key);
            }
        }
    }, windowMs);
    interval.unref();

    return function rateLimit(req, res, next) {
        const ip = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";
        const now = Date.now();

        let record = hits.get(ip);
        if (!record || now > record.resetTime) {
            record = { count: 1, resetTime: now + windowMs };
            hits.set(ip, record);
            res.setHeader("X-RateLimit-Limit", max);
            res.setHeader("X-RateLimit-Remaining", max - 1);
            return next();
        }

        if (record.count >= max) {
            res.setHeader("X-RateLimit-Limit", max);
            res.setHeader("X-RateLimit-Remaining", 0);
            res.setHeader("Retry-After", Math.ceil((record.resetTime - now) / 1000));
            return res.status(429).json({
                success: false,
                error: message,
            });
        }

        record.count++;
        res.setHeader("X-RateLimit-Limit", max);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count));
        next();
    };
}

module.exports = { createRateLimiter };
