const intiData = require("./data.js");
const Listing = require("../models/listing.js");
const mongoose = require('mongoose');
main()
    .then(() => {
        console.log("connection");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const intiDB = async () => {
    await Listing.insertMany(intiData.data);
    console.log("data was initialized");
}
intiDB();