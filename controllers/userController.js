const AppError = require('./../utils/appError');
const User = require('./../models/userModel');

async function updateMe (req,res,next) {
  try{
    if(req.body.password || req.body.passwordConfirm){
      return next(new AppError('This route is not for password updates! Please use /updatePassword', 400))
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {new:true, runValidators:true});

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });

  }catch (err){
    return next(new AppError(err.message, 400));
  }
}

async function deleteMe(req,res,next){
  try{
    await User.findByIdAndUpdate(req.user.id, {active:false})

    res.status(204).json({
      status: "success",
      data: null
    })
  }catch(err){
    return next(new AppError(err.message, 400));
  }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
}

function createUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
}

function getUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
}

function updateUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
}

function deleteUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
}

function filterObj(obj, ...allowedField) {
  let newObj = {}
  Object.keys(obj).forEach(el => {
    if(allowedField.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

module.exports = { getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe };
