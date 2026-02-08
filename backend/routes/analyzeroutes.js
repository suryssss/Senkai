const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
    const data = req.body;

    console.log("Received architecture:", data);

    res.json({
        message: "Data received successfully",
        received: data
    });
});

module.exports = router;
