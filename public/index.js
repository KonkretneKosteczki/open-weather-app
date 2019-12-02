const options = {method: "POST"};

fetch("/api/dbSize", options)
    .then(checkStatus)
    .then(res => res.json())
    .then(({days}) => document.getElementById("days").max = days)
    .catch(console.error);

function formatKeys(key){
    return {
        temperature: "temperature<br>[Celsius dg]",
        pressure: "pressure<br>[hPa]",
        humidity: "humidity<br>[%]",
        precipitation: "precipitation<br>[mm]",
        wind_speed: "wind speed<br>[m/s]",
        wind_direction: "wind direction<br>[dg]",
    }[key] || key;
}

function checkStatus(res) {
    if (!res.ok) throw "Error requesting data from api";
    return res;
}

function createTableFromJSON(json, divContainer) {
    // EXTRACT VALUE FOR HTML HEADER.
    // ('Book ID', 'Book Name', 'Category' and 'Price')
    const columns = ["", ...json.map(({city, country}) => city || country)];
    const table = document.createElement("table");
    const tr = table.insertRow(-1);

    columns.forEach(label => {
        const th = document.createElement("th");
        th.innerHTML = label;
        tr.appendChild(th);
    });

    // ADD JSON DATA TO THE TABLE AS ROWS.
    const properties = Object.keys(json[0]).filter(labels => labels !== "city");

    properties.forEach(key => {
        const tr = table.insertRow(-1);
        const tabCell = tr.insertCell(-1);
        tabCell.innerHTML = formatKeys(key);

        json.map(values => {
            const tabCell = tr.insertCell(-1);
            tabCell.innerHTML = (Math.round(values[key] * 100) / 100).toString();
        })
    });

    divContainer.appendChild(table);
}

function createTable() {
    const divContainer = document.getElementById("showData");
    divContainer.innerHTML = "";
    return getData().then(data => createTableFromJSON(data, divContainer)).catch(console.error);
}

async function getData() {
    const days = document.getElementById("days").value;
    const cities = await fetch(`/api/cities?d=${days}`, options)
        .then(checkStatus)
        .then(res => res.json());

    const data = [];
    for (const city of cities) {
        data.push(await fetch(`/api/average?d=${days}&c=${city}`, options)
            .then(checkStatus)
            .then(res => res.json())
            .then(({average}) => ({...average, city}))
        );
    }

    data.push(await fetch(`/api/poland?d=${days}`, options)
        .then(checkStatus)
        .then(res => res.json())
        .then(({average}) => ({...average, country: "Poland"}))
    );

    return data;
}
