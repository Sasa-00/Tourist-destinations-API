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
const reviewRouter = require('./../routes/reviewRoutes')

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter)

router.route('/').get(getAllTours).post(protect, restrictTo('admin', 'lead-guide'), createTour);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);
router.route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
