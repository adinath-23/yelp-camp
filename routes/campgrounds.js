const express = require('express');
const catchAsync = require('../utils/catchAsync')
const campgrounds = require('../controllers/campgrounds')
const { isLoggedIn, isAuthor, validateCampground } = require('../middlewear.js')
const router = express.Router();
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/')
    // route to display all campgrounds
    .get(catchAsync(campgrounds.index))
    // Route to handel new campground submission
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

//route to create new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// Routes to edit page for campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditCampground));

router.route('/:id')
    // shows individual campground details and review based on id
    .get(catchAsync(campgrounds.renderCampground))
    // Route to submit edited campground
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground))
    // deletes campground using id
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;