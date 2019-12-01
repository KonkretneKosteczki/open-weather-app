const express = require("express");
const app = express();
const {activateCronJob} = require("./weather-api");
const config = require("./config");

app.use(require("./routers/auth"));
app.use(express.static(__dirname + "/public"));

app.use("/api", require("./routers/api"));
app.get("/*", (req, res) => {
    res.status(404).json({error: "endpoint not found"})
});

app.listen(config.appPort, () => {
    activateCronJob();
    console.log(`APP listening on port ${config.appPort}`);
});
