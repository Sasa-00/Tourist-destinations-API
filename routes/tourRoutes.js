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

const router = express.Router();

router.route('/').get(getAllTours).post(createTour);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
