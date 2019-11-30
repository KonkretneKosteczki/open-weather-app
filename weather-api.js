// Designed REST client (1):
//// implement the mechanism to download from the public REST service the current
//// weather conditions (e.g temperature in [Celcius degrees], pressure in [hPa], humidity in
//// [%], precipitation in [mm], wind speed in [m/s] and direction in [degrees]) for 8 cities:
//// Warszawa, Łódź, Wrocław, Szczecin, Rzeszów, Kraków, Gdańsk and Suwałki
//// (in URL do not use polish letters),

const weather = require("openweather-apis");
const CronJob = require("cron").CronJob;
const config = require("./config");
const database = require("./database");

weather.setLang("pl");
weather.setUnits("metric");
weather.setAPPID(config.weatherApiKey);

async function saveWeatherConditions() {
    console.log("Querying weather conditions");
    const timestamp = parseTimestamp(new Date().getTime());
    const reports = await config.weatherCitiesToCheck.reduce(async (allReportsPromise, city) => {
        const allReports = await allReportsPromise;
        console.log("Querying city:", city);
        weather.setCity(city);

        const report = await new Promise((resolve, reject) => {
            weather.getAllWeather((err, weatherInfo) => {
                if (err) reject(err);
                resolve(weatherInfo);
            });
        }).catch(err => console.error(err));
        if (!report) return allReports;

        const parsedReport = parseReport(report, timestamp, city);
        console.log(JSON.stringify(parsedReport));
        allReports.push(parsedReport);
        return allReports;
    }, []);

    return database
        .collection("reports")
        .storeEntryList(reports);
}

function parseReport(report, date, city) {
    console.log(JSON.stringify(report));
    const {main: {temp: temperature, humidity, pressure}, wind: {speed: wind_speed, deg: wind_direction}, rain: {"3h": precipitation} = {"3h": 0}} = report;
    return {date, temperature, pressure, humidity, precipitation, wind_speed, wind_direction, city}
}

function parseTimestamp(timestamp) {
    // rounds timestamp to nearest 12h
    const millisecondsIn12Hours = 1000 * 60 * 60 * 12;
    return Math.round(timestamp / millisecondsIn12Hours) * millisecondsIn12Hours
}

module.exports = {
    saveWeatherConditions,
    activateCronJob: () => new CronJob(config.weatherCheckingCronPattern, saveWeatherConditions, null, true)
};
