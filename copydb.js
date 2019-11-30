const config = require("./config");
const database = require("./database");

async function copy(){
    const oldReports = await database.collection("reports").readEntryList({});
    await database.disconnect();

    config.databaseURI = "new url";

    const info = await database.collection("reports").storeEntryList(oldReports);
    await database.disconnect();
    return info;
}

copy().then(console.log);
