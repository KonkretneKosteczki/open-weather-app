module.exports = {
    appPort: process.env.PORT || 4000,
    databaseURI: process.env.MONGODB_URI || "mongodb://localhost:27017/weather-data",
    weatherCheckingCronPattern: "0 0 */12 * * *", // 0s, 0m, 0/12h
    weatherCitiesToCheck: ["Warszawa", "Szczecin", "Lodz", "Wroclaw", "Gdansk", "Krakow", "Suwalki", "Rzeszow"],
    weatherApiKey: process.env.OPENWEATHERAPI_KEY
};
