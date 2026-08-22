const express = require("express");
const app = express();
const port = 8080;
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

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

// index
app.get("/listings", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing});
})
);

// new
app.get("/listings/new", (req, res) => {


    res.render("listings/new.ejs");
});



// create
app.post("/listings", wrapAsync(async (req, res) => {
    if(!req.body.listing) {
        throw new ExpressError(400, "Send a valid data");
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})
);

// show/read
app.get("/listings/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
})
);

// edit
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
})
);

// update
app.put("/listings/:id", wrapAsync(async(req, res) => {
    if(!req.body.listing) {
        throw new ExpressError(400, "Send a valid data");
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
})
);

// delete
app.delete("/listings/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
})
);

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let {status=500, message="Wrong"} = err;
    // res.status(status).send(message);
    res.status(status).render("error.ejs", {message});
});

app.listen(port, () => {
    console.log(`listening on port ${port}`); 
});