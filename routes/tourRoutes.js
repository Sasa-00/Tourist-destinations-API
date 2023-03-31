const express = require('express');
const {
  getAllTours,
  getTour,
  updateTour,
  createTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
} = require(`${__dirname}/../controllers/tourController`);
const { protect, restrictTo } = require('./../controllers/authController');

const router = express.Router();

router.route('/').get(protect, getAllTours).post(createTour);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/:id').get(getTour).patch(updateTour).delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
