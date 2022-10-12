const mongoose = require('mongoose');
const Review = require('./review');

const Schema = mongoose.Schema;

const ImageSchema = new Schema(
    {
        url: String,
        filename: String
    }
)
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } };
const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    location: String,
    images: [ImageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

CampgroundSchema.virtual('properties.popupMarkup').get(function () {
    return `<a href='/campgrounds/${this._id}'>${this.title}</a>
    <p>${this.location}</p>`
})

CampgroundSchema.virtual('avgRating').get(function () {
    return Math.ceil(this.reviews.map((review) => review.rating).reduce((a, b) => a + b, 0) / this.reviews.length);
})

CampgroundSchema.post('findOneAndDelete', async function (data) {
    if (data) {
        await Review.deleteMany({
            _id: {
                $in: data.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)