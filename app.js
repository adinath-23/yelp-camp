if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError');
const campgroundRouter = require('./routes/campgrounds');
const reviewRouter = require('./routes/reviews');
const userRouter = require('./routes/users')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localPassport = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const mongoDBStore = require('connect-mongo')
const dbUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/yelp-camp'
// const dbUrl = process.env.MONGO_URL
mongoose.connect(dbUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

//methodoverride is used to make delete, put requests fromhtml
app.use(methodOverride('_method'));
//urlencoded is used to parse the request body
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize({ replaceWith: '_' }))

const secret = process.env.SECRET || 'THISISNOTASECRETYOUDUMDUM'

const store = mongoDBStore.create(
    {
        mongoUrl: dbUrl,
        secret: secret,
        touchAfter: 24 * 3600
    }
)


store.on('error', function (e) {
    console.log('SESSION STORE ERROR ', e)
})
const sessionConfig = {
    store,
    name: '__',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",

];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://cdn.jsdelivr.net",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dlc1bfkpt/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://source.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        }
    })
);

//passport config for app
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localPassport(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//setting for the views and public files and ejs
app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//this middlewear makes sure that given data is available in all views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.user = req.user
    next()
})

//passing routers
app.use('/campgrounds', campgroundRouter);
app.use('/campgrounds/:id/reviews', reviewRouter);
app.use('/', userRouter)

app.get('/', (req, res) => {
    res.render('home')
})
//Routes for all invalid requrests
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

//Error handeling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No! Something went wrong :('
    res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listining on port ${port}`);
});