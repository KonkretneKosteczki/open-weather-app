const database = require("./database");
const bCrypt = require("bcrypt");

function seed(){
    return database
        .collection("users")
        .storeEntry({user: "test-user", password: bCrypt.hashSync('myPassword', 10)})
        .then(database.disconnect)
}

seed();
