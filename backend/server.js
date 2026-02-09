require("dotenv").config({ path: ".env.local" });

const express = require("express");
const cors = require("cors");
const analyzeRoutes = require("./routes/analyzeroutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/analyze", analyzeRoutes);

app.get("/", (req, res) => {
    res.json({
        status: "running",
        service: "Senkai Architecture Analyzer API",
        groq: process.env.GROQ_API_KEY ? "configured" : "not configured"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(` Senkai API running on port ${PORT}`);
    console.log(` Groq AI: ${process.env.GROQ_API_KEY ? "✓ Configured" : "✗ Not configured (set GROQ_API_KEY in .env)"}`);
});