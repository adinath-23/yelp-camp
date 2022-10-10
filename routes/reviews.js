const express = require('express');
const catchAsync = require('../utils/catchAsync')
const reviews = require('../controllers/reviews')
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middlewear.js')
const router = express.Router({ mergeParams: true });


//route used to submit review on specific campground page
router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview))

//route to delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;