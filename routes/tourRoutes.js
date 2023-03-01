const express = require('express');
const {
  getAllTours,
  getTour,
  updateTour,
  createTour,
  deleteTour,
} = require(`${__dirname}/../controllers/tourController`);

const router = express.Router();

router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;