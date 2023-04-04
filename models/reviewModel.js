const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: [true,'Review can not be empty!']
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true,'Review must belong to a tour.']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true,'Review must belong to a user.']
  }
}, {
  timestamps: true,
  toJSON: {virtuals:true},
  toObject: {virtuals:true}
});

reviewSchema.pre(/^find/, function(next){

  this.populate({
    path: "tour",
    select: "name"
  }).populate({
    path: "user",
    select: "name"
  })
  next();
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
