
// const express = require("express");
// const router = express.Router({ mergeParams: true });

// const wrapAsync = require("../utils/wrapAsync.js");
// const { isLoggedIn } = require("../middleware.js");
// const bookingController = require("../controllers/booking.js");

// // Create booking
// router.post(
//     "/",
//     isLoggedIn,
//     wrapAsync(bookingController.createBooking)
// );

// module.exports = router;

const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isBookingAuthor } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

// Show booking form
router.get(
    "/new", isLoggedIn, wrapAsync(bookingController.renderBookingForm)
);

// Show edit booking page
router.get("/:bookingId/edit", isLoggedIn, wrapAsync(isBookingAuthor), wrapAsync(bookingController.renderEditBookingForm)
);

// Create booking

router.post("/", isLoggedIn, wrapAsync(bookingController.createBooking)
);


// Update booking
router.put("/:bookingId", isLoggedIn, wrapAsync(isBookingAuthor), wrapAsync(bookingController.updateBooking)
);



// Cancel booking
router.delete("/:bookingId", isLoggedIn, wrapAsync(isBookingAuthor), wrapAsync(bookingController.cancelBooking)
);

module.exports = router;