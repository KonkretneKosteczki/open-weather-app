const express = require("express");
const router = express.Router();
const database = require("../database");
const config = require("../config");

function getAverage({city, property, days}) {
    const milliseconds = days * 24 * 60 * 60 * 1000;
    const timestampLimit = new Date().getTime() - milliseconds;

    const options = city ?
        {date: {$gte: timestampLimit}, city: city} :
        {date: {$gte: timestampLimit}};

    return database
        .collection("reports")
        .readEntryList(options)
        .then(reports => {
            if (property !== "all")
                return {
                    average: {
                        [property]: reports.reduce((avg, {[property]: value}) => {
                            return avg + value / reports.length
                        }, 0)
                    }
                };
            else return {
                average: reports.reduce((avg, {_id, city, date, ...report}) => {
                    Object.entries(report).forEach(([property, value]) => {
                        avg[property] = (avg[property] || 0) + value / reports.length
                    });
                    return avg;
                }, {})
            };
        })

}

router.get("/cities", (req, res)=>{
    res.json(config.weatherCitiesToCheck)
});

router.get("/dbSize", (req, res) => {
    function daysPassed(timestamp) {
        const current = new Date();
        const previous = new Date(timestamp);
        return Math.ceil((current - previous + 1) / 86400000);
    }

    return database
        .collection("reports")
        .readEntryList({city: config.weatherCitiesToCheck[0], limit: 1, sort: "date", sortOrder: -1})
        .then(([data]) => {
            if (data) return res.json({days: daysPassed(data.date)});
            else return res.json({days: 0})
        })
        .catch(err => res.status(502).json({err}))
});

router.get("/average", (req, res) => {
    const {c: city, p: property = "all", d: days = 1} = req.query;

    if (!city)
        return res.status(400).json({
            error: "Missing required field",
            errorDetails: {c: "city name"}
        });

    return getAverage({city, property, days})
        .then(average => res.json(average));
});

router.get("/poland", (req, res) => {
    const {p: property = "all", d: days = 1} = req.query;
    return getAverage({property, days})
        .then(average => res.json(average));
});

module.exports = router;
