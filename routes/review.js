const express = require("express");
const router = express.Router({mergeParams: true});
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {validateReviews, isLoggedIn, isReviewAuthor} = require("../middleware.js");

// "/" or "/new" in every route here, /listings/:id/reviews was there

// Review
router.post("/", isLoggedIn, validateReviews, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new review saved");
    req.flash("success", "new review created");
    res.redirect(`/listings/${listing._id}`);
})
);

// Delete (review)
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async(req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "review deleted");
    res.redirect(`/listings/${id}`);
})
);

module.exports = router;