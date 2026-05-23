require("dotenv").config({ path: ".env.local" }); // Restart nodemon

const express = require("express");
const cors = require("cors");
const analyzeRoutes = require("./routes/analyzeroutes");
const trafficRoutes = require("./routes/trafficroutes");
const projectRoutes = require("./routes/projectRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/analyze", analyzeRoutes);
app.use("/api/traffic", trafficRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
    res.json({
        status: "running",
        service: "Senkai Architecture Analyzer API",
        groq: process.env.GROQ_API_KEY ? "configured" : "not configured"
    });
});

const PORT = process.env.PORT;

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(401).json({ error: 'Unauthenticated or invalid token' });
});

app.listen(PORT, () => {
    console.log(` Senkai API running on port ${PORT}`);
    console.log(` Groq AI: ${process.env.GROQ_API_KEY ? "✓ Configured" : "✗ Not configured (set GROQ_API_KEY in .env)"}`);
});