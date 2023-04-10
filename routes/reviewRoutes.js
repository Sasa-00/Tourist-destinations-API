const express = require('express');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourAndUserIds,
  getReview
} = require(`${__dirname}/../controllers/reviewController`);
const { protect, restrictTo} = require('./../controllers/authController');

const router = express.Router({mergeParams:true});

router.route('/').get(protect, getAllReviews).post(protect, restrictTo("user"), setTourAndUserIds, createReview);

router.route('/:id')
  .delete(protect, restrictTo('admin', 'user'), deleteReview)
  .patch(protect, restrictTo('admin', 'user'), updateReview)
  .get(protect, getReview)

module.exports = router;
