const express = require("express")
const cors = require("cors")
const analyzeRoutes = require("./routes/analyzeroutes");

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/analyze", analyzeRoutes)

app.get('/', (req, res) => {
    res.send("backend")
})


const PORT = 3000

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})