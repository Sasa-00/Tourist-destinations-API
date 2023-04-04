const express = require('express');
const {
  getAllReviews,
  createReview,
} = require(`${__dirname}/../controllers/reviewController`);
const { protect } = require('./../controllers/authController');

const router = express.Router();

router.route('/').get(getAllReviews).post(protect, createReview);

module.exports = router;
