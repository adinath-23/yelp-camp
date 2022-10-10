const { reviewSchema, campgroundSchema } = require('./schemas.js')
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

//checks if you are logged in for a given task
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You need to be logged in');
        return res.redirect('/login')
    }
    next()
}

//JOI validation for campground forms
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

//checks if you are authorized for a given task
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'you dont have permission')
        return res.redirect(`/campgrounds/${campground._id}`)
    }
    next();
}

//checks if you are the creator for a given review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId, id } = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'you dont have permission')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

//JOI validation for review for
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}