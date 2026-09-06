const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine('ejs', ejsMate);

const mongoose = require('mongoose');
main()
    .then(() => {
        console.log("connection");
    }) .catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.get("/", (req, res) => {
    res.send("Working");
});

app.use("/listings", listings); // listing.js (routes)
app.use("/listings/:id/reviews", reviews); // review.js (routes)


app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page not found"));


});

app.use((err, req, res, next) => {
    let {status=500, message="Wrong"} = err;
    // res.status(status).send(message);

    res.status(status).render("error.ejs", {message});
    // console.log("ACTUAL ERROR:", err);
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});