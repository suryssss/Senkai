require("dotenv").config({ path: ".env.local" }); // Restart nodemon

const express = require("express");
const cors = require("cors");
const analyzeRoutes = require("./routes/analyzeroutes");
const trafficRoutes = require("./routes/trafficroutes");
const projectRoutes = require("./routes/projectRoutes");

const { createRateLimiter } = require("./middleware/rateLimiter");

const app = express();

const analyzeLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: "Too many analysis requests. Please try again in a minute."
});

const trafficLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 60,
    message: "Too many simulation requests. Please try again in a minute."
});

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

app.use("/api/analyze", analyzeLimiter, analyzeRoutes);
app.use("/api/traffic", trafficLimiter, trafficRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
    res.json({
        status: "running",
        service: "Senkai Architecture Analyzer API",
        groq: process.env.GROQ_API_KEY ? "configured" : "not configured"
    });
});

const PORT = process.env.PORT || 5000;

app.use((err, req, res, next) => {
    console.error(err.stack || err);
    const status = err.status || err.statusCode || (
        err.name === 'UnauthorizedError' ||
        (err.message && (err.message.includes('unauthenticated') || err.message.includes('Unauthorized')))
            ? 401
            : 500
    );
    const message = err.message || (status === 401 ? 'Unauthenticated or invalid token' : 'Internal Server Error');
    res.status(status).json({ success: false, error: message });
});

app.listen(PORT, () => {
    console.log(` Senkai API running on port ${PORT}`);
    console.log(` Groq AI: ${process.env.GROQ_API_KEY ? "✓ Configured" : "✗ Not configured (set GROQ_API_KEY in .env)"}`);
});