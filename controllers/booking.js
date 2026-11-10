
const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.renderBookingForm = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id).populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    if (listing.owner._id.equals(req.user._id)) {
        req.flash("error", "You cannot book your own listing");
        return res.redirect(`/listings/${id}`);
    }

    res.render("bookings/new.ejs", { listing });
};

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body.booking;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // Prevent booking your own listing
    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot book your own listing");
        return res.redirect(`/listings/${id}`);
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
        isNaN(startDate) ||
        isNaN(endDate) ||
        startDate < today ||
        endDate <= startDate
    ) {
        req.flash("error", "Please select valid booking dates");
        return res.redirect(`/listings/${id}`);
    }

    const guestCount = Number(guests);

    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
        req.flash("error", "Please select between 1 and 20 guests");
        return res.redirect(`/listings/${id}`);
    }

    // Check overlapping confirmed bookings
    const overlappingBooking = await Booking.findOne({
        listing: id,
        status: "Confirmed",
        checkIn: { $lt: endDate },
        checkOut: { $gt: startDate }
    });

    if (overlappingBooking) {
        req.flash("error", "This listing is already booked for these dates");
        return res.redirect(`/listings/${id}`);
    }

    const nights = Math.ceil(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    const pricePerNight = listing.price;
    const totalPrice = nights * pricePerNight;

    const newBooking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn: startDate,
        checkOut: endDate,
        guests: guestCount,
        pricePerNight,
        totalPrice
    });

    await newBooking.save();

    req.flash("success", "Your booking is confirmed!");
    res.redirect(`/listings/${id}`);
};


module.exports.updateBooking = async (req, res) => {
    const { id, bookingId } = req.params;
    const { checkIn, checkOut, guests } = req.body.booking;

    const booking = res.locals.booking;
    const listing = await Listing.findById(id);

    if (!listing || booking.status !== "Confirmed") {
        req.flash("error", "Booking cannot be edited");
        return res.redirect(`/listings/${id}`);
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const guestCount = Number(guests);

    if (
        isNaN(startDate) ||
        isNaN(endDate) ||
        startDate < today ||
        endDate <= startDate ||
        !Number.isInteger(guestCount) ||
        guestCount < 1 ||
        guestCount > 20
    ) {
        req.flash("error", "Please enter valid booking details");
        return res.redirect(`/listings/${id}`);
    }

    const overlappingBooking = await Booking.findOne({
        _id: { $ne: bookingId },
        listing: id,
        status: "Confirmed",
        checkIn: { $lt: endDate },
        checkOut: { $gt: startDate }
    });

    if (overlappingBooking) {
        req.flash("error", "These dates are already booked");
        return res.redirect(`/listings/${id}`);
    }

    const nights = Math.ceil(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    booking.checkIn = startDate;
    booking.checkOut = endDate;
    booking.guests = guestCount;
    booking.totalPrice = nights * booking.pricePerNight;

    await booking.save();

    req.flash("success", "Booking updated successfully");
    res.redirect(`/listings/${id}`);
};


module.exports.cancelBooking = async (req, res) => {
    const { id } = req.params;

    const booking = res.locals.booking;

    if (booking.status === "Cancelled") {
        req.flash("error", "Booking is already cancelled");
        return res.redirect(`/listings/${id}`);
    }

    booking.status = "Cancelled";
    await booking.save();

    req.flash("success", "Booking cancelled successfully");
    res.redirect(`/listings/${id}`);
};

module.exports.renderEditBookingForm = async (req, res) => {
    const booking = res.locals.booking;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    res.render("bookings/edit.ejs", { booking, listing });
};