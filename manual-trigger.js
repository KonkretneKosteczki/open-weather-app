const {saveWeatherConditions} = require("./weather-api");
const database = require("./database");

saveWeatherConditions()
    .then(() => database.disconnect());
