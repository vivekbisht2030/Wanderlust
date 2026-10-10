const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const {isLoggedIn} = require("../middleware.js")

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errorMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    } else {
        next();
    }
};

// "/" or "/new" in every route here /listings was there

// index
router.get("/", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing});
})
);

// new
router.get("/new", isLoggedIn, (req, res) => {
    console.log(req.user);
    res.render("listings/new.ejs");
});



// create
router.post("", isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {


    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New listing created");
    res.redirect("/listings");
})

);

// show/read
router.get("/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing) {

        req.flash("error", "listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
})
);

// edit
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
})
);

// update
router.put("/:id", isLoggedIn, validateListing, wrapAsync(async(req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "listing updated");
    res.redirect(`/listings/${id}`);
})
);



// delete (post)
router.delete("/:id", isLoggedIn, wrapAsync(async(req, res) => {
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "listing deleted");
    res.redirect("/listings");
})
);

module.exports = router;