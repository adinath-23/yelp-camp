const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { cloudinary } = require('../cloudinary');

const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken })

module.exports.index = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const totalPages = Math.ceil(await Campground.count() / 10);
    if (page > totalPages || page < 1) {
        page = 1
    }
    const campgrounds = await Campground.find({}).skip((page - 1) * 10).limit(10);
    res.render('campgrounds/index', { campgrounds, page, totalPages });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location, limit: 1
    }).send()
    console.log(geoData.body.features[0].geometry.coordinates)
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id
    await campground.save()
    req.flash('success', 'Campground added successfully!')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.renderEditCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Campground not found')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.editCampground = async (req, res, next) => {
    const { id } = req.params
    console.log(req.body.deleteImages)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs)
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(campground)
    }
    req.flash('success', 'Campground updated successfully')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.renderCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate(
        {
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }
    ).populate('author');
    if (!campground) {
        req.flash('error', 'Campground not found')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/details', { campground });
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully!')
    res.redirect('/campgrounds');
}