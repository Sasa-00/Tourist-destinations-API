const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');

async function getAllReviews (req,res,next) {
  try{
    const allReviews = await Review.find();

    res.status(200).json({
      status: 'success',
      results: allReviews.length,
      data: {
        reviews: allReviews
      },
    });
  }catch(err){
    next(new AppError(err.message, 401))
  }
}

async function createReview (req,res,next) {
  try{
    const newReview = await Review.create({
      rating: req.body.rating,
      review: req.body.review,
      tour: req.body.tour,
      user: req.body.user
    })

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  }catch(err){
    next(new AppError(err.message, 401))
  }
}

module.exports = {
  createReview,
  getAllReviews
};

