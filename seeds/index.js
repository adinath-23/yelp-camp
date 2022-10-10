const mongoose = require('mongoose')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelper')
const Campground = require('../models/campground')
const Review = require('../models/review')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
})


const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '633832ee90698c066f12176d',
            location: `${cities[random].city}, ${cities[random].state}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random].longitude, cities[random].latitude]
            },
            title: `${sample(descriptors)} ${sample(places)} `,
            images: [
                {
                    url: 'https://res.cloudinary.com/dlc1bfkpt/image/upload/v1664967905/YelpCamp/zbdkggoz8yudxlmz5dr8.png',
                    filename: 'YelpCamp/zbdkggoz8yudxlmz5dr8'
                },
                {
                    url: 'https://res.cloudinary.com/dlc1bfkpt/image/upload/v1664967906/YelpCamp/zq9f6uxgwlsczojy5xlc.webp',
                    filename: 'YelpCamp/zq9f6uxgwlsczojy5xlc'
                }
            ],

            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Porro dolor qui laboriosam tempora, illo voluptates corporis fugit asperiores officia saepe consequatur vel rem, placeat dolorum laudantium repellendus voluptatum iste",
            price
        })
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close()
    });