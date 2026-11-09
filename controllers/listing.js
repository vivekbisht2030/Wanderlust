const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// module.exports.index = async (req, res) => {
//     const allListing = await Listing.find({});
//     res.render("listings/index.ejs", {allListing});
// };

// module.exports.index = async (req, res) => {
//     const { category } = req.query;
//     let allListing;
//     if (category) {
//         allListing = await Listing.find({ category: category });
//     } else {
//         allListing = await Listing.find({});
//     }
//     res.render("listings/index.ejs", { allListing });
// };

// module.exports.renderNewForm = (req, res) => {
//     res.render("listings/new.ejs");
// };
module.exports.index = async (req, res) => {
    const { search, category } = req.query;

    let filter = {};

    // Search by listing title, location or country
    if (search && search.trim() !== "") {
        const searchRegex = new RegExp(
            search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
        );

        filter.$or = [
            { title: searchRegex },
            { location: searchRegex },
            { country: searchRegex }
        ];
    }

    // Category filtering
    if (category) {
        filter.category = category;
    }

    const allListing = await Listing.find(filter);

    res.render("listings/index.ejs", {
        allListing,
        search,
        category
    });
};
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


module.exports.showListing = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if(!listing) {
        req.flash("error", "listing you requested for does not exist");
        return res.redirect("/listings");
    }
    console.log(listing)
    res.render("listings/show.ejs", {listing});

};



module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })

    .send()

    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, "..", filename);
    const newListing = new Listing(req.body.listing);
    console.log(req.user);
    
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New listing created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "listing you requested for does not exist");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

// module.exports.updateListing = async(req, res) => {
//     let {id} = req.params;
//     let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});    
//     if (typeof req.file != "undefined") {
//         let url = req.file.path;
//         let filename = req.file.filename;
//         listing.image = {url, filename};
//         await listing.save();
//     }
//     req.flash("success", "listing updated");
//     res.redirect(`/listings/${id}`);
// };

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist");

        return res.redirect("/listings");
    }
    Object.assign(listing, req.body.listing);

    // Update coordinates if location or country changes
    const response = await geocodingClient.forwardGeocode({
        query: `${listing.location}, ${listing.country}`,
        limit: 1
    }).send();

    if (response.body.features.length > 0) {
        listing.geometry = response.body.features[0].geometry;
    } else {
        req.flash("error", "Could not find the updated location");
        return res.redirect(`/listings/${id}/edit`);
    }

    // Update image only if a new image is uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    await listing.save();

    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req, res) => {
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "listing deleted");
    res.redirect("/listings");
};