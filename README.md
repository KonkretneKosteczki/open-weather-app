## Table of contents
* [General info](#general-info)
* [Technologies](#technologies)
* [Configuration](#configuration)
* [Setup](#setup)
* [Endpoints](#endpoints)

## General info
This project is RESTful service for Network Programming subject at Lodz University of Technology.
	
## Technologies
Project is created with:
* "bcrypt": "^3.0.7",
* "body-parser": "^1.19.0",
* "connect-ensure-login": "^0.1.1",
* "cron": "^1.7.2",
* "express": "^4.17.1",
* "express-session": "^1.17.0",
* "mongodb": "^3.3.5",
* "openweather-apis": "^4.1.0",
* "passport": "^0.4.0",
* "passport-local": "^1.0.0"
* "nodemon": "^2.0.1"
	    
## Setup
To run this project you will need a running mongodb database and to install project dependencies locally using npm:
```
$ npm install --production #production
$ npm install #developement
```
Take a note of the fact that in order to get access to the app you need to be authorized, which required at least a single user to be written into database collection, which can be achieved by running
```
$ npm run seed-db
```
After which you can start the app with
```
$ npm start #production
$ npm start:dev #developement with hot reloading
```

## Configuration

Session information and cookies are encoded using a secret variable extracted from environmental variable `APP_SECRET`, please change it before using the app for security reasons.

Application by default runs on port `4000` or on a port specified in environmental variable `PORT` (supported by heroku)

Database used in this app is heroku provided mongodb. It's uri can be passed to app by setting environmental variable `MONGODB_URI` or it will default to the standard installation mongodb host and port, using database entry `weather-data`

Since app is communicating with the [open weather api](https://openweathermap.org/) it's api key has to be provided in `OPENWEATHERAPI_KEY`, it has no default value and app will fail if it's not provided.

There are two more adjustable settings, however they require you to edit [config.js](https://github.com/KonkretneKosteczki/open-weather-app/blob/master/config.js) file in order for them to take effect.
* cron pattern that configures the data collection scheduler (by default `0 0 */12 * * *` every 12 hours)
* list of cities in polish: `["Warszawa", "Szczecin", "Lodz", "Wroclaw", "Gdansk", "Krakow", "Suwalki", "Rzeszow"]`

## Endpoints

User directly interactive endpoints:
* **GET /** *the main page with weather table generation widget*
* **GET /login** *login page*
* **GET /logout** *logout page, removes session cookie and redirects back to login page*
* **POST /login** *endpoint accepting x-www-form-urlencoded data from login page and generating all necessary session info and cookies, accepts data such as `{"username":String, "password":String}` note test-user and myPassword being default parameters*

Api Endpoints:

Each of them returns data in JSON format and requires user to be authorized. if user was not authorized before an attempt at fetching data, app will respond with `{"error":"Unauthorized"}` and status code 401 (Unauthorized)
* **POST /api/dbSize** *returns `{"days":Number}` time elapsed (in days) since first weather entry, representing the amount of days data has been collected for*
* **POST /api/poland?p={property}&d={days}** *returns average value for given number of days and parameter key provided in query, if they are not provided number of days will default to 1 and parameter to all, for more information on units of returned data refer to [open-weather-api](https://openweathermap.org/current)*
```
{
    "average": {
        "temperature": 0.1725,
        "pressure": 1016.25,
        "humidity": 76.25,
        "precipitation": 0,
        "wind_speed": 2.05,
        "wind_direction": 170
    }
}
```
* **POST /api/average?c={city}&p={property}&d={days}** *returns the same data in the same format as /api/poland, except for only a single city provided in query parameters, if no city is provided endpoint will return an error `{"error":"Missing required field","errorDetails":{"c":"city name"}}` with status code 400 (Bad Request)*



example usage of endpoints in Postman [![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/8a454a44d428f3a66aea)
