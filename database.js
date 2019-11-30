const {MongoClient} = require("mongodb");
const config = require("./config");

let con = null;

function getCollection(client, col) {
    return client.db().collection(col);
}

async function ensureConnection() {
    if (!con || !(await con).db().serverConfig.isConnected()) {
        console.log("(Re)Establishing connection to database.");
        con = MongoClient.connect(config.databaseURI, {useNewUrlParser: true, autoReconnect: false,  useUnifiedTopology: true })
            .then(client => {
                console.log("Database connected");
                return client;
            })
    }
    return con.catch(err => {
        console.error(err.message);
        con = null;
        throw err;
    });
}

function disconnect() {
    return con ? con.then(client => client.close()) : Promise.resolve(null);
}

function storeEntry(data, col, options) {
    return ensureConnection().then(client => getCollection(client, col).insertOne(data, ...options));
}

function storeEntryList(data, col, options) {
    return ensureConnection().then(client => getCollection(client, col).insertMany(data, ...options));
}

function updateEntry(filter, data, col, options) {
    return ensureConnection().then(client => getCollection(client, col).updateOne(filter, data, ...options))
}

function replaceEntry(filter, data, col, options) {
    return ensureConnection().then(client => getCollection(client, col).replaceOne(filter, data, ...options))
}

function deleteEntry(filter, col, options) {
    return ensureConnection().then(client => getCollection(client, col).deleteOne(filter, ...options))
}

function readEntry(data, col, options) {
    return ensureConnection().then(client => getCollection(client, col).findOne(data, ...options));
}

function readEntryList({limit, sort, sortOrder=1, ...data} = {}, col, options) {
    return ensureConnection().then(client => {
        const collection = getCollection(client, col);

        return limit ?
            collection.find(data, ...options).sort({[sort]: sortOrder}).limit(limit).toArray() :
            collection.find(data, ...options).toArray();
    });
}

function databaseConnection(collection) {
    return {
        storeEntry: (data, ...options) => storeEntry(data, collection, options),
        readEntry: (data, ...options) => readEntry(data, collection, options),
        readEntryList: (data, ...options) => readEntryList(data, collection, options),
        updateEntry: (filter, data, ...options) => updateEntry(filter, data, collection, options),
        replaceEntry: (filter, data, ...options) => replaceEntry(filter, data, collection, options),
        deleteEntry: (filter, ...options) => deleteEntry(filter, collection, options),
        storeEntryList: (data, ...options) => storeEntryList(data, collection, options)
    }
}

const database = {
    collection: (col) => databaseConnection(col),
    disconnect
};

module.exports = database;
