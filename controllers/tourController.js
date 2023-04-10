const { json } = require('express');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const { deleteOne, updateOne, createOne, getOne, getAll } = require("./handlerFactory");

const getAllTours = getAll(Tour);
const getTour = getOne(Tour,{path: 'reviews'})
const createTour = createOne(Tour);
const updateTour = updateOne(Tour)
const deleteTour = deleteOne(Tour);

// Special handler to get average specs grouped by difficulty
async function getTourStats(req, res, next) {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
}

// Special route(handler) to get plan of trips in certain year
async function getMonthlyPlan(req, res, next) {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: {
            $push: '$name',
          },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numTourStarts: -1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    next(new AppError(err.message, 404));
  }
}

module.exports = {
  getAllTours,
  getTour,
  updateTour,
  createTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
};
