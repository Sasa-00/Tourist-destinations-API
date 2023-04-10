const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');
const { deleteOne, updateOne, createOne, getOne, getAll } = require("./handlerFactory");

// Middleware to set id's, if they does not exist in expected location
function setTourAndUserIds(req,res,next){
  // Allow nested routes
  if(!req.body.tour) req.body.tour = req.params.tourId;
  if(!req.body.user) req.body.user = req.user.id;
  next();
}

const getAllReviews = getAll(Review);
const getReview = getOne(Review)
const createReview = createOne(Review)
const updateReview = updateOne(Review)
const deleteReview = deleteOne(Review)

module.exports = {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourAndUserIds,
  getReview
};
