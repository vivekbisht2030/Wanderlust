
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    checkIn: {
        type: Date,
        required: true
    },

    checkOut: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > this.checkIn;
            },
            message: "Check-out date must be after check-in date."
        }
    },

    guests: {
        type: Number,
        required: true,
        min: 1
    },

    pricePerNight: {
        type: Number,
        required: true
    },

    totalPrice: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["Confirmed", "Cancelled"],
        default: "Confirmed"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
