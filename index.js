const express = require("express");
const app = express();
const activateCronJob = require("./weather-api");

app.use(express.static(__dirname + "/public"));
app.use("/api", require("./routers/api"));
app.get("/*", (req, res) => {
    res.status(404).json({error: "endpoint not found"})
});
app.listen(4000, () => {
    activateCronJob();
    console.log("APP listening on port 4000");
});
