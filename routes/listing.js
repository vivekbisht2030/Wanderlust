const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js")
const listingController = require("../controllers/listing.js");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

// "/" or "/new" in every route here /listings was there

router
.route("/")
.get(wrapAsync(listingController.index))
// .post(isLoggedIn, validateListing, wrapAsync(listingController.createListing));
.post(upload.single('listing[image]'), (req, res) => {
    res.send(req.file);
});

// new
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// index
// router.get("/", wrapAsync(listingController.index));

// create
// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));


// show/read
// router.get("/:id", wrapAsync(listingController.showListing));


// edit
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// update
// router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// delete (post)
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;