const express = require("express");
const app = express();
const port = 8080;
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");

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

const validateListing = (req, res, next) => {

    let {error} = listingSchema.validate(req.body);
    if(error){


        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    } else {
        next();
    }

};

const validateReviews = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errorMsg);

    } else {
        next();
    }

};

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
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
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
app.put("/listings/:id", validateListing, wrapAsync(async(req, res) => {
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

// Review
app.post("/listings/:id/reviews", validateReviews, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
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