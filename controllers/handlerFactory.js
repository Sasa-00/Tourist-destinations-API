const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// Functions below is common to a lot of other functions in user, tour and review controller.
// Because of this, they are settled here and then export to them.
function deleteOne(Model){
  return (
    async function (req, res, next) {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      next(new AppError(err.message, 404));
    }
  }
  )
}

function updateOne(Model) {
  return (
    async function (req, res, next) {
      try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });

        if (!doc) {
          return next(new AppError('No document found with that ID', 404));
        }

        res.status(200).json({
          status: 'success',
          data: {
            data: doc,
          },
        });
      } catch (err) {
        next(new AppError(err.message, 404));
      }
    }
  )
}

function createOne(Model){
  return (
    async function (req, res, next) {
      try {
        const newDoc = await Model.create(req.body);

        res.status(201).json({
          status: 'success',
          data: {
            data: newDoc,
          },
        });
      } catch (err) {
        next(new AppError(err.message, 404));
      }
    }
  )
}

function getOne (Model, popOptions) {
  return(
    async function (req, res, next) {
      try {
        let query = Model.findById(req.params.id);
        if(popOptions){
          query = query.populate(popOptions);
        }
        const doc = await query
        if (!doc) {
          return next(new AppError('No document found with that ID', 404));
        }
        res.status(200).json({
          status: 'success',
          data: {
            data: doc,
          },
        });
      } catch (err) {
        next(new AppError(err.message, 404));
      }
    }
  )
}

function getAll (Model){
  return (
    async function (req, res, next) {
      try {
        // To allow for nested GET reviews on tour
        let filter = {}
        if(req.params.tourId) filter = { tour: req.params.tourId }

        const features = new APIFeatures(Model.find(filter), req.query)
          .filter()
          .sort()
          .limitFields()
          .paginate();

        const doc = await features.query;

        res.status(200).json({
          status: 'success',
          results: doc.length,
          data: {
            data: doc,
          },
        });
      } catch (err) {
        next(new AppError(err.message, 404));
      }
    }
  )
}

module.exports = {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll
};
