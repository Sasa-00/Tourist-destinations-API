const mongoose = require("mongoose");
const Tour = require("./tourModel");

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

reviewSchema.statics.calcAverageRatings = async function(tourId){
  const stats = await this.aggregate([
    {
      $match: {tour: tourId}
    },
    {
      $group: {
        _id: '$tour',
        numberRating: {$sum:1},
        avgRating: {$avg:"$rating"}
      }
    }
  ])
  if(stats.length > 0){
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numberRating,
      ratingsAverage: stats[0].avgRating
    })
  }else{
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0
    })
  }
}

reviewSchema.post('save', function(){
   this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.index({tour:1,user:1}, {unique:true})

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

// We need to update our statistics also in situations when docs are updated or deleted.
// Those methods are using findByIdAndDelete/Update, and because of this we need special reg expression.
reviewSchema.pre(/^findOneAnd/, async function(next){
  // Because we are using findOne method, we have no access to document(this), and we store in this.r
  // document, so we can use it in post middleware.
  this.r = await this.findOne();
  next();
})

// Now we have our document here, and can access to data.
// Only in post, our data is changed, and now we can update statistics.
reviewSchema.post(/^findOneAnd/, async function(){
  await this.r.constructor.calcAverageRatings(this.r.tour);
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
