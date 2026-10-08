const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine('ejs', ejsMate);

const mongoose = require('mongoose');
const cookie = require("express-session/session/cookie.js");

main()
    .then(() => {
        console.log("connection");
    }) .catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const sessionOption = {
    secret: "mysupersecretpolu",


    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 *1000,
        maxAge: 7 * 24 * 60 * 60 *1000,

        httpOnly: true
    }
};

app.get("/", (req, res) => {
    res.send("Working");
});

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    console.log(res.locals.success);
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "polu@gmail.com",
//         username: "PoluOlu"
//     });

//     let registeredUser = await User.register(fakeUser, "Polu@Olu");
//     res.send(registeredUser);
// });



app.use("/listings", listingRouter); // listing.js (routes)
app.use("/listings/:id/reviews", reviewRouter); // review.js (routes)
app.use("/", userRouter); // user.js (routes)

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});



app.use((err, req, res, next) => {
    let {status=500, message="Wrong"} = err;
    // res.status(status).send(message);
    res.status(status).render("error.ejs", {message});
    console.log("ACTUAL ERROR:", err);
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});